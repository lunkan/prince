import { config } from './config.js';
import { WorldBuilder } from './world-builder.js';
import { WorldCanvas } from './world-canvas.js';

let world;
let worldMapRef;
let worldCanvas;

const generateWorld = (size) => {
	world = new WorldBuilder(config, size, size)
		.mountains()
		.plains()
		.forrest()
		.workers()
		.create();
};

const SCALE = 50;

const draw = () => {
	worldCanvas = new WorldCanvas(worldMapRef.getContext('2d'), SCALE);
	worldMap.width = SCALE * world.sizeX;
	worldMap.height = SCALE * world.sizeY;

	const selectedHeatmap = document.filters.elements['heatmap'].value;
	const workers = config.workers.map(worker => worker.name);

	world.getSectorList()
		.map(sector => worldCanvas.getContext(sector))
		.forEach(sectorContext => sectorContext
			.drawBorders()
			.drawTerrain()
			.drawTransportNetwork()
			.drawEntityHeatMap(selectedHeatmap, document.filters.demand.checked, document.filters.supply.checked)
			.drawWorkers(workers)
		);
};



window.onload = () => {
	worldMapRef = document.getElementById('worldMap');
	worldMapRef.addEventListener('click', (e) => {
		const logText = [];

		const rect = e.target.getBoundingClientRect();
  		const x = (e.clientX - rect.left) / SCALE;
  		const y = (e.clientY - rect.top) / SCALE;

  		const sx = Math.floor(x);
  		const sy = Math.floor(y);
  		const sector = world.getSector(sx, sy);
		logText.push(sector.toString());

  		const dx = x - sx;
		const dy = y - sy;
  		const vx = sx + (dx > 0.66 ? 1 : dx < 0.33 ? -1 : 0);
  		const vy = sy + (dy > 0.66 ? 1 : dy < 0.33 ? -1 : 0);
  		const vsector = world.getSector(vx, vy);

  		if (vsector && vsector !== sector) {
  			const vector = sector.vectors.find(vector => vector.target === vsector);
			logText.push(vector.toString());
  		} else if (vsector && vsector === sector) {
			logText.push(sector.workers.toString());
  		}

  		const logElm = document.getElementById('log');
  		logElm.textContent = logText.join('\n\n');
	});

	const heatmapSelect = document.filters.elements['heatmap'];
	config.entities.forEach(entityConfig => {
		const option = document.createElement("option");
		option.value = option.text = entityConfig.name;
		heatmapSelect.add(option);
	});

	[...document.filters.elements].forEach(input => {
		input.addEventListener('change', draw);
	});

	document.getElementById('generateBtn').addEventListener('click', () => {
		generateWorld(10);
		draw();
	});

	document.getElementById('runBtn').addEventListener('click', () => {
		const numTicks = parseInt(document.getElementById('numTicks').value) || 0;
		world.run(numTicks);
		draw();
	});

	generateWorld(10);
	draw();
};