
export class SectorContext {
	constructor(sector, canvasContext, x, y, width, height) {
		this.sector = sector;
		this.ctx = canvasContext;
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}

	get left() {
		return this.x;
	}

	get right() {
		return this.x + this.width;
	}

	get top() {
		return this.y;
	}

	get bottom() {
		return this.y + this.height;
	}

	get center() {
		return this.x + this.width / 2;
	}

	get middle() {
		return this.y + this.height / 2;
	}

	drawBorders() {
		this.ctx.lineWidth = 1;
		this.ctx.strokeStyle = 'grey';
		this.ctx.strokeRect(this.x, this.y, this.width, this.height);
		return this;
	}

	drawTerrain() {
		this.ctx.fillStyle = '#BDD4AB';
		this.ctx.fillRect(this.x, this.y, this.width, this.height);

		// Mountains
		const mountains = this.sector.terrain.mountains;
		if (mountains > 0) {
			this.ctx.fillStyle = `rgba(0, 0, 0, ${Math.min(1, mountains)})`;
			this.ctx.beginPath();
			this.ctx.moveTo(this.center, this.middle);
			this.ctx.lineTo(this.left, this.bottom);
			this.ctx.lineTo(this.right, this.bottom);
			this.ctx.fill();

			this.ctx.fillStyle = `rgba(0, 0, 0, ${Math.min(1, mountains) * 0.5})`;
			this.ctx.beginPath();
			this.ctx.moveTo(this.center, this.middle);
			this.ctx.lineTo(this.right, this.bottom);
			this.ctx.lineTo(this.right, this.top);
			this.ctx.fill();

			this.ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, mountains)})`;
			this.ctx.beginPath();
			this.ctx.moveTo(this.center, this.middle);
			this.ctx.lineTo(this.left, this.bottom);
			this.ctx.lineTo(this.left, this.top);
			this.ctx.fill();
		}

		// Plains
		this.ctx.lineWidth = 1;
		this.ctx.strokeStyle = '#ff9900';
		const plains = this.sector.terrain.plains;
		if (plains > 0) {
			
			for (let ix = 0; ix < this.width; ix += 4) {
				const x = this.left + ix;
				const y = this.top + ix;
				this.ctx.beginPath();
				this.ctx.moveTo(this.left, y);
				this.ctx.lineTo(x, this.top);
				this.ctx.stroke();
			}

			for (let ix = 2; ix < this.width; ix += 4) {
				const x = this.left + ix;
				const y = this.top + ix;
				this.ctx.beginPath();
				this.ctx.moveTo(this.right, y);
				this.ctx.lineTo(x, this.bottom);
				this.ctx.stroke();
			}
		}

		// Forrest
		const forrest = this.sector.terrain.forrest;
		if (forrest > 0) {
			const seed = this.sector.y * 100 + this.x;
			const numTrees = Math.ceil(Math.min(20, forrest * 20));
			const trees = Array(numTrees).fill(null).map((value, i) => {
				const seedX = ((seed + i) % 10) / 10;
				const seedY = ((seed + i) % 3) / 3;
				const seedZ = (i % 3) / 3;

				return [
					this.x + seedX * this.width + Math.sin(seed + i) * 10,
					this.y + seedY * this.height + Math.cos(seed + i) * 10,
					3 + Math.round(seedZ * 3),
				];
			});

			this.ctx.fillStyle = `rgba(0, 0, 0, 0.25)`;	
			trees.forEach(point => {
				this.ctx.beginPath();
				this.ctx.ellipse(point[0] + 2, point[1] + 4, point[2] * 1.2, point[2], Math.PI / 3, 0, 2 * Math.PI, false);
				this.ctx.fill();
			});

			trees.forEach((point, i) => {
				this.ctx.fillStyle = i % 2 === 0 ? '#014e00' : '#218922';
				this.ctx.beginPath();
				this.ctx.arc(point[0], point[1], point[2], 0, 2 * Math.PI, false);
				this.ctx.fill();
			});
		}

		return this;
	}

	drawWorkers(workerNames) {
		workerNames.forEach(workerName => {
			const worker = this.sector.workers.get(workerName);
			if (worker.amount) {
				const radius = Math.sqrt(this.width * 0.5 * worker.amount);
				this.ctx.fillStyle = worker.config.color;
				this.ctx.beginPath();
				this.ctx.arc(this.center, this.middle, radius, 0, 2 * Math.PI);
				this.ctx.fill();
			}
		});

		return this;
	}

	drawTransportNetwork() {
		this.ctx.strokeStyle = `rgba(102, 51, 0, 0.65)`;	
		this.sector.vectors.forEach(vector => {

			const target = vector.target;
			if (target !== this.sector) {
				const thickness = Math.min(10, vector.getCurrent() * 5);
				
				if (thickness > 0.5) {
					const toX = target.x > this.sector.x ? this.right : target.x < this.sector.x ? this.left : this.center;
					const toY = target.y > this.sector.y ? this.bottom : target.y < this.sector.y ? this.top : this.middle;
				
					this.ctx.lineWidth = thickness;
					this.ctx.beginPath();
					this.ctx.moveTo(this.center, this.middle);
					this.ctx.lineTo(toX, toY);
					this.ctx.stroke();
				}
			}
		});


		return this;
	}

	drawEntityHeatMap(entityName, demand, supply) {
		if (entityName) {
			const entity = this.sector.entities.get(entityName);

			const level = entity.supply + entity.demand;
			

			if (level > 0.1) {
				const diff = entity.supply - entity.demand;
				// Js not handeling negative sqrt
				const heatValue = diff > 0 ? Math.pow(diff, 0.5) : -1 * Math.pow(Math.abs(diff), 0.5);
				const normalizedValue = Math.max(Math.min(heatValue, 1), -1) / 1;

				const red = normalizedValue < 0 ? Math.abs(normalizedValue) * 255 : 0;
				const green = (1 - Math.abs(normalizedValue)) * 255;
				const blue = normalizedValue > 0 ? normalizedValue * 255 : 0;

				this.ctx.fillStyle = `rgba(${red}, ${green}, ${blue}, ${1})`;
				this.ctx.fillRect(this.x, this.y, this.width, this.height);
			}
	    }

		return this;
	}
}

export class WorldCanvas {
	constructor(canvasContext, scale) {
		this.ctx = canvasContext;
		this.scale = scale;
		this.cachedSectors = new Map();
	}

	getContext(sector) {
		let context = this.cachedSectors.get(sector);
		if (!context) {
			context = new SectorContext(sector, this.ctx, sector.x * this.scale, sector.y * this.scale, this.scale, this.scale);
			this.cachedSectors.set(sector, context);
		}

		return context;
	}

	clear() {
		this.cachedSectors = new Map();
	}
}



