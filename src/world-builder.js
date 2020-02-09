
import { World } from './world.js';

export class WorldBuilder {
	constructor(config, sizeX, sizeY) {
		this.world = new World(config, sizeX, sizeY);
	}

	mountains() {
		for (let i = 0; i < 3; i++) {
			const x = Math.floor(Math.random() * this.world.sizeX);
			const y = Math.floor(Math.random() * this.world.sizeY);
			const sector = this.world.getSector(x, y);
			sector.terrain.mountains += 0.7;

			const neighbors = this.world.getNeighborSectors(sector).sort(() => Math.random());
			for (let i = 0; i < Math.min(3, neighbors.length); i++) {
				neighbors[i].terrain.mountains += 0.35;

				const neighbors2 = this.world.getNeighborSectors(neighbors[i]).sort(() => Math.random());
				for (let i = 0; i < Math.min(3, neighbors2.length); i++) {
					neighbors2[i].terrain.mountains += 0.15;
				}
			}
		}

		return this;
	}

	workers() {
		this.world.randSector().workers.get('wool').production = 1;
		this.world.randSector().workers.get('wool').consumtion = 1;
		return this;
	}

	create() {
		this.world.connect();
		return this.world;
	}
}