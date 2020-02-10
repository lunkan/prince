import { Workers } from './workers.js';

export class Sector {

	constructor(config, x, y) {
		this.id = `sec@[${x}:${y}]`;
		this.x = x;
		this.y = y;

		this.terrain = {
			mountains: 0,
		};

		this.entities = new Map(config.entities.map(entity => [
			entity.name,
			{
				demandIncrementor: 0,
				demand: 0,
				supply: 0,
			},
		]));

		this.workers = new Workers(config, this);
	}

	connect(vectors) {
		this.vectors = vectors;
		this.vectors.push(this.workers);
	}

	getSupply(entityName, demand) {
		const entity = this.entities.get(entityName);
		entity.demandIncrementor += demand;
		const supply = entity.supply * (entity.demand ? demand / entity.demand : 0);
		return supply;
	}

	execute() {
		this.workers.run();

		this.entities.forEach((entity, entityName) => {
			const vectorWinner = this.vectors.sort((vectorA, vectorB) => {
				return vectorA.getValue(entityName) - vectorB.getValue(entityName);
			})[0];

			const vectorSupplySum = this.vectors.map(vector => {
				if (vector === vectorWinner) {
					return vector.execute(entityName, entity.demand);
				} else if (vector.isNeighborVector(vectorWinner)) {
					return vector.execute(entityName, -0.2 * entity.demand);
				} else {
					return vector.execute(entityName, 0);	
				}
				
			}).reduce((acc, supply) => acc + supply, 0);

			entity.supply = vectorSupplySum;
			entity.demand = entity.demandIncrementor;
			entity.demandIncrementor = 0;
		});
	}
}