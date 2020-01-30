

import { Area } from './area.js';

console.log('area', Area);

let tick = 0;
const runDemandStack = [];
const runSupplyStack = [];
const runCurrentStack = [];
const nodes = [];

const TERRAIN_COST_DEFAULT = 1;
const TERRAIN_COST_MOUNTAIN = 20;

const getNodes = () => {
	const nodelist = [];
	for (let iy = 0; iy < nodes.length; iy++){
		for (let ix = 0; ix < nodes[iy].length; ix++){
			nodelist.push(nodes[iy][ix]);
		}
	}
	return nodelist;
}

const randNode = () => {
	const iy =  Math.floor(nodes.length * Math.random());
	const ix =  Math.floor(nodes[iy].length * Math.random());
	return nodes[iy][ix];
};

const getNeighborNodes = (node) => {
	const y0 = Math.max(0, node.y - 1);
	const y1 = Math.min(nodes.length - 1, node.y + 1);
	const x0 = Math.max(0, node.x - 1);
	const x1 = Math.min(nodes[y0].length - 1, node.x + 1);

	const neighborNodes = [];
	for (let iy = y0; iy <= y1; iy++){
		for (let ix = x0; ix <= x1; ix++){
			if (nodes[iy][ix] !== node) {
				neighborNodes.push(nodes[iy][ix]);
			}
		}
	}

	return neighborNodes;
};

class Link {
	constructor(target, source, initWeight) {
		this.target = target;
		this.source = source;
		this.weightDemand = initWeight;
		this.weightSupply = initWeight;

		this.lastUpdate = 0;
		this.currentThreshold = 0;
		this.current = 0;

		this.terrain = TERRAIN_COST_DEFAULT + (target.mountains * TERRAIN_COST_MOUNTAIN)/2 + (source.mountains * TERRAIN_COST_MOUNTAIN)/2;
		this.distance = Math.sqrt(Math.pow(target.x - source.x, 2) + Math.pow(target.y - source.y, 2));
	}

	addCurrent(value) {
		this.current += value;
		if (this.lastUpdate < tick) {
			runCurrentStack.push(this);
			this.lastUpdate = tick;
		}
	}

	executeCurrent() {
		const current = this.current > 0 ? Math.min(0.5, Math.max(0, Math.pow(this.current, 2))) : 0;
		this.currentThreshold = this.currentThreshold * 0.9 + current * 0.1;
		this.current = 0;
	}

	sendDemand(value) {
		const share = value * this.weightDemand;
		this.target.addDemand(share / this.getMirrorLink().getResistance());
	}

	sendSupply(value) {
		this.target.addSupply(value);	
	}

	getResistance() {
		return 1 + (this.terrain / (1 + this.currentThreshold * 2)) * this.distance;
	}

	getDemand() {
		return this.target.demandThreshold / this.getMirrorLink().getResistance();
	}

	getCost() {
		if (this.target.supplyThreshold) {
			const localCost = this.target.demandThreshold / this.target.supplyThreshold;
			return localCost * this.getMirrorLink().getResistance();
		} else {
			return 0;
		}
	}

	getMirrorLink() {
		return this.target.links.find(link => link.target === this.source);
	}
}

class Node {
	constructor(x, y) {
		this.x = x;
		this.y = y;

		this.demand = 0;
		this.demandThreshold = 0;
		this.demandLastUpdate = 0;
		
		this.supply = 0;
		this.supplyThreshold = 0;
		this.supplyLastUpdate = 0;

		this.production = 0;
		this.consumtion = 0;

		this.links;

		this.mountains = 0;
	}

	connect() {
		const neighbors = getNeighborNodes(this);
		this.links = neighbors.map(neighbor => new Link(neighbor, this, 1 / neighbors.length));
	}

	addSupply(value) {
		this.supply += value;
		if (this.supplyLastUpdate < tick) {
			runSupplyStack.push(this);

			const elapsedTime = tick - this.supplyLastUpdate;
			const decay = Math.pow(0.9, elapsedTime);
			this.supplyThreshold = this.supplyThreshold * decay + (this.supply * 0.1);
			this.supplyLastUpdate = tick;
			this.supply = 0;
		}
	}

	executeSupply() {
		const demandSum = this.links.reduce((acc, link) => acc + link.getDemand(), 0);
		this.links.forEach(link => {
			const share = link.getDemand() / demandSum;
			const value = this.supplyThreshold * share;

			link.addCurrent(value);
			this.getNeighborLinks(link).forEach(neighborLink => {
				neighborLink.addCurrent(-(value / 2));
			});

			link.sendSupply(value);
		});
	}

	addDemand(value) {
		this.demand += value;
		if (this.demandLastUpdate < tick) {
			runDemandStack.push(this);

			const elapsedTime = tick - this.demandLastUpdate;
			const decay = Math.pow(0.9, elapsedTime);
			this.demandThreshold = this.demandThreshold * decay + (this.demand * 0.1);
			this.demandLastUpdate = tick;
			this.demand = 0;
		}
	}

	executeDemand() {
		this.links.sort((linkA, linkB) => {
			return Math.random();
		}).sort((linkA, linkB) => {
			return linkA.getCost() - linkB.getCost();
		}).forEach((link, i) => {
			const value = i == 0 ? 1 : 0;
			link.weightDemand = link.weightDemand * 0.9 + value * 0.1;
			link.sendDemand(this.demandThreshold);
		});
	}

	getNeighborLinks(link) {
		return this.links.filter(neighborLink => {
			if (link === neighborLink) {
				return false;
			} else if (link.target.x === neighborLink.target.x && Math.abs(neighborLink.target.y - link.target.y) === 1) {
				return true;
			} else if (link.target.y === neighborLink.target.y && Math.abs(neighborLink.target.x - link.target.x) === 1) {
				return true;
			} else {
				return false;
			}
		});
	}
}

const generateWorld = (size) => {
	nodes.length = 0;
	for (let iy = 0; iy < size; iy++){
		nodes.push([]);
		for (let ix = 0; ix < size; ix++){
			nodes[iy][ix] = new Node(ix, iy);
		}
	}

	for (let i = 0; i < 3; i++) {
		const cx = Math.floor(Math.random() * size);
		const cy = Math.floor(Math.random() * size);
		const cNode = nodes[cy][cx];
		cNode.mountains += 0.7;

		const cNodeNeighbors = getNeighborNodes(cNode).sort(() => Math.random());
		for (let i = 0; i < Math.min(3, cNodeNeighbors.length); i++) {
			cNodeNeighbors[i].mountains += 0.35;

			const sNodeNeighbors = getNeighborNodes(cNodeNeighbors[i]).sort(() => Math.random());
			for (let i = 0; i < Math.min(3, sNodeNeighbors.length); i++) {
				sNodeNeighbors[i].mountains += 0.15;
			}
		}
	}

	getNodes().forEach(node => node.connect());

	randNode().production = 1;
	randNode().consumtion = 1;

	//randNode().production = 1;
	//randNode().consumtion = 1;
};

const run = (numTicks) => {
	for (let i = 0; i < numTicks; i++) {
		getNodes().forEach(node => {
			if (node.production) {
				node.addSupply(node.production);
			}
			if (node.consumtion) {
				node.addDemand(node.consumtion);
			}
			
		});

		while (runDemandStack.length > 0) {
			runDemandStack.pop().executeDemand();
		}

		while (runSupplyStack.length > 0) {
			runSupplyStack.pop().executeSupply();
		}

		while (runCurrentStack.length > 0) {
			runCurrentStack.pop().executeCurrent();
		}

		getNodes().forEach(node => {
			if (node.production) {
				node.demand = Math.max(0, node.demand - node.production);
			}
			if (node.consumtion) {
				node.supply = Math.max(0, node.supply - node.consumtion);
			}
			
		});

		tick++;
	}
};

const SCALE = 50;
const draw = () => {
	if (!nodes) {
		return;
	}

	const canvas = document.getElementById('canvas');
	canvas.width = SCALE * nodes[0].length;
	canvas.height = SCALE * nodes.length;

	var ctx = canvas.getContext('2d');
	ctx.lineWidth = 1;
	ctx.strokeStyle = 'grey';

	for (let iy = 0; iy < nodes.length; iy++){
		for (let ix = 0; ix < nodes[iy].length; ix++){
			const node = nodes[iy][ix];

			ctx.fillStyle = '#BDD4AB';
			ctx.fillRect(node.x * SCALE, node.y * SCALE, SCALE, SCALE);
			ctx.strokeRect(node.x * SCALE, node.y * SCALE, SCALE, SCALE);

			if (node.mountains > 0) {
				ctx.fillStyle = `rgba(0, 0, 0, ${Math.min(1, node.mountains)})`;
				ctx.beginPath();
    			ctx.moveTo(node.x * SCALE + SCALE / 2, node.y * SCALE + SCALE / 2);
    			ctx.lineTo(node.x * SCALE, node.y * SCALE + SCALE);
    			ctx.lineTo(node.x * SCALE + SCALE, node.y * SCALE + SCALE);
    			ctx.fill();

    			ctx.fillStyle = `rgba(0, 0, 0, ${Math.min(1, node.mountains) * 0.5})`;
				ctx.beginPath();
    			ctx.moveTo(node.x * SCALE + SCALE / 2, node.y * SCALE + SCALE / 2);
    			ctx.lineTo(node.x * SCALE + SCALE, node.y * SCALE + SCALE);
    			ctx.lineTo(node.x * SCALE + SCALE, node.y * SCALE);
    			ctx.fill();

    			ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, node.mountains)})`;
				ctx.beginPath();
    			ctx.moveTo(node.x * SCALE + SCALE / 2, node.y * SCALE + SCALE / 2);
    			ctx.lineTo(node.x * SCALE, node.y * SCALE + SCALE);
    			ctx.lineTo(node.x * SCALE, node.y * SCALE);
    			ctx.fill();
			}

			if (document.filters.demand.checked && node.demandThreshold) {
				ctx.fillStyle = `rgba(255, 0, 0, ${Math.min(1, node.demandThreshold)})`;
				ctx.fillRect(node.x * SCALE, node.y * SCALE, SCALE, SCALE);
    		}

			if (document.filters.supply.checked && node.supplyThreshold) {
				ctx.fillStyle = `rgba(0, 0, 255, ${Math.min(1, node.supplyThreshold)})`;
				ctx.fillRect(node.x * SCALE, node.y * SCALE, SCALE, SCALE);
    		}

			if (document.filters.production.checked && node.production) {
				const radius = SCALE * 0.5 * (node.production / 2);
				ctx.fillStyle = '#0000ff';
				ctx.beginPath();
    			ctx.arc(node.x * SCALE + SCALE * 0.5, node.y * SCALE + SCALE * 0.5, radius, 0, 2 * Math.PI);
    			ctx.fill();
    		}

    		if (document.filters.consumtion.checked && node.consumtion) {
				const radius = SCALE * 0.5 * (node.consumtion / 2);
				ctx.fillStyle = '#ff0000';
				ctx.beginPath();
    			ctx.arc(node.x * SCALE + SCALE * 0.5, node.y * SCALE + SCALE * 0.5, radius, 0, 2 * Math.PI);
    			ctx.fill();
    		}
		}
	}

	for (let iy = 0; iy < nodes.length; iy++){
		for (let ix = 0; ix < nodes[iy].length; ix++){
			const node = nodes[iy][ix];

			node.links.forEach(link => {
				const fromPoint = [link.source.x * SCALE + SCALE * 0.5, link.source.y * SCALE + SCALE * 0.5];
				const toPoint = [link.target.x * SCALE + SCALE * 0.5, link.target.y * SCALE + SCALE * 0.5];
				const thickness = link.currentThreshold * 12;

				if (thickness > 0.0001) {
					ctx.lineWidth = thickness;
					ctx.beginPath();
					ctx.moveTo(fromPoint[0], fromPoint[1]);
					ctx.lineTo(toPoint[0], toPoint[1]);
					ctx.stroke();
				}
			});
		}
	}
};



window.onload = () => {
	[...document.filters.elements].forEach(input => {
		input.addEventListener('change', draw);
	});

	document.getElementById('generateBtn').addEventListener('click', () => {
		generateWorld(10);
		draw();
	});

	document.getElementById('runBtn').addEventListener('click', () => {
		const numTicks = parseInt(document.getElementById('numTicks').value) || 0;
		run(numTicks);
		draw();
	});

	generateWorld(10);
	draw();
};