
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

			const neighbors = this.world.getNeighborSectors(sector).sort(() => 0.5 - Math.random());
			for (let i = 0; i < Math.min(3, neighbors.length); i++) {
				neighbors[i].terrain.mountains += 0.35;

				const neighbors2 = this.world.getNeighborSectors(neighbors[i]).sort(() => 0.5 - Math.random());
				for (let i = 0; i < Math.min(3, neighbors2.length); i++) {
					neighbors2[i].terrain.mountains += 0.15;
				}
			}
		}

		return this;
	}

	plains() {
		for (let i = 0; i < 3; i++) {
			const x = Math.floor(Math.random() * this.world.sizeX);
			const y = Math.floor(Math.random() * this.world.sizeY);
			const sector = this.world.getSector(x, y);

			if (!sector.terrain.mountains) {
				sector.terrain.plains += 0.7;
				sector.terrain.grassland = 0;
			}

			const neighbors = this.world.getNeighborSectors(sector).sort(() => 0.5 - Math.random());
			for (let i = 0; i < Math.min(3, neighbors.length); i++) {
				if (!neighbors[i].terrain.mountains) {
					neighbors[i].terrain.plains += 0.35;
					neighbors[i].terrain.grassland = 0;
				}

				const neighbors2 = this.world.getNeighborSectors(neighbors[i]).sort(() => 0.5 - Math.random());
				for (let i = 0; i < Math.min(3, neighbors2.length); i++) {
					if (!neighbors2[i].terrain.mountains) {
						neighbors2[i].terrain.plains += 0.15;
						neighbors2[i].terrain.grassland = 0;
					}
				}
			}
		}

		return this;
	}

	forrest() {
		for (let i = 0; i < 3; i++) {
			const x = Math.floor(Math.random() * this.world.sizeX);
			const y = Math.floor(Math.random() * this.world.sizeY);
			const sector = this.world.getSector(x, y);

			if (!sector.terrain.plains) {
				sector.terrain.forrest += 0.7;
				sector.terrain.grassland = 0;
			}

			const neighbors = this.world.getNeighborSectors(sector).sort(() => 0.5 - Math.random());
			for (let i = 0; i < Math.min(3, neighbors.length); i++) {
				if (!neighbors[i].terrain.plains) {
					neighbors[i].terrain.forrest += 0.35;
					neighbors[i].terrain.grassland = 0;
				}

				const neighbors2 = this.world.getNeighborSectors(neighbors[i]).sort(() => 0.5 - Math.random());
				for (let i = 0; i < Math.min(3, neighbors2.length); i++) {
					if (!neighbors2[i].terrain.plains) {
						neighbors2[i].terrain.forrest += 0.15;
						neighbors2[i].terrain.grassland = 0;
					}
				}
			}
		}

		return this;
	}

	workers() {
		this.world.getSectorList().forEach(sector => {
			sector.workers.get('shepherd').amount = sector.terrain.grassland;
			sector.workers.get('miner').amount = sector.terrain.mountains;
			sector.workers.get('woodcutter').amount = sector.terrain.forrest;
			sector.workers.get('farmer').amount = sector.terrain.plains;

			if (Math.random() > 0.95) {
				sector.workers.get('craftsmen').amount = Math.random() * 3;
			}
		});


		/*this.world.randSector().workers.get('shepherd').amount = 1;
		this.world.randSector().workers.get('miner').amount = 1;
		this.world.randSector().workers.get('woodcutter').amount = 1;
		this.world.randSector().workers.get('farmer').amount = 1;*/
		return this;
	}

	create() {
		this.world.connect();
		return this.world;
	}
}