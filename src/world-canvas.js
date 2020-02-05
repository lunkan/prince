
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
		// Default
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

		return this;
	}

	drawWorkers(entityName, type) {
		const worker = this.sector.workers.get(entityName);

		if ((!type || type === 'production') && worker.production) {
			const radius = this.width * 0.5 * (worker.production / 2);
			this.ctx.fillStyle = '#0000ff';
			this.ctx.beginPath();
			this.ctx.arc(this.center, this.middle, radius, 0, 2 * Math.PI);
			this.ctx.fill();
		}

		if ((!type || type === type === 'consumtion') && worker.consumtion) {
			const radius = this.width * 0.5 * (worker.consumtion / 2);
			this.ctx.fillStyle = '#ff0000';
			this.ctx.beginPath();
			this.ctx.arc(this.center, this.middle, radius, 0, 2 * Math.PI);
			this.ctx.fill();
		}

		return this;
	}

	drawTransportNetwork() {
		return this;
	}

	drawEntityHeatMap(entityName, type) {
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



