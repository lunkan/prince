import { Sector } from './sector.js';
import { Link } from './link.js';

export class World {
	constructor(config, sizeX, sizeY) {
		this.links = new Map();
		this.config = config;
		this.tick = 0;

		// Create sectors
		this.grid = [];
		for (let iy = 0; iy < sizeY; iy++){
			this.grid.push([]);
			for (let ix = 0; ix < sizeX; ix++){
				this.grid[iy][ix] = new Sector(this.config, ix, iy);
			}
		}
	}

	connect() {
		// Connect links
		this.getSectorList().forEach(sector => {
			const vectors = this.getNeighborSectors(sector).map(neighbor => {
				const linkKey = Link.generateKey(sector, neighbor);

				if (!this.links.has(linkKey)) {
					const newLink = new Link(this.config, sector, neighbor);
					this.links.set(linkKey, newLink);
				}

				const link = this.links.get(linkKey);
				return link.getVectorFromSource(sector);
			});

			sector.connect(vectors);
		});
	}

	get sizeX() {
		return this.grid[0].length;
	}

	get sizeY() {
		return this.grid.length;
	}

	getSector(x, y) {
		return this.grid[y][x];
	}

	getSectorList() {
		const sectorlist = [];
		for (let iy = 0; iy < this.sizeY; iy++){
			for (let ix = 0; ix < this.sizeX; ix++){
				sectorlist.push(this.grid[iy][ix]);
			}
		}
		return sectorlist;
	}

	randSector() {
		const iy =  Math.floor(this.sizeY * Math.random());
		const ix =  Math.floor(this.sizeX * Math.random());
		return this.grid[iy][ix];
	}

	getNeighborSectors(sector) {
		const y0 = Math.max(0, sector.y - 1);
		const y1 = Math.min(this.sizeY - 1, sector.y + 1);
		const x0 = Math.max(0, sector.x - 1);
		const x1 = Math.min(this.sizeX - 1, sector.x + 1);

		const neighbors = [];
		for (let iy = y0; iy <= y1; iy++){
			for (let ix = x0; ix <= x1; ix++){
				if (this.grid[iy][ix] !== sector) {
					neighbors.push(this.grid[iy][ix]);
				}
			}
		}

		return neighbors;
	}

	run(numTicks) {
		for (let i = 0; i < numTicks; i++) {
			this.getSectorList().forEach(sector => sector.execute());

			this.links.forEach(link => link.updateTrackBonus());

			this.tick++;
		}
	}
}