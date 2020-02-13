import { Workers } from './workers.js';

export class Sector {

	constructor(config, x, y) {
		this.id = `sec@[${x}:${y}]`;
		this.config = config;
		this.x = x;
		this.y = y;

		this.terrain = {
			mountains: 0,
			forrest: 0,
			plains: 0,
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
		const supply = entity.supply * Math.min(1, (entity.demand ? demand / entity.demand : 0));
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
					return vector.execute(entityName, this.config.general.demandDirectionSharpness * entity.demand);
				} else {
					return vector.execute(entityName, 0);	
				}
				
			}).reduce((acc, supply) => acc + supply, 0);

			entity.supply = vectorSupplySum * this.config.general.supplyDecline;
			entity.demand = entity.demandIncrementor;
			entity.demandIncrementor = 0;
		});
	}

	toString() {
		const output = [];

		output.push('ENTITIES');
		this.entities.forEach((entity, entityName) => {
			const supplyStr = entity.supply > 0.0001 ? entity.supply.toString().substring(0, 5) : '~0';
			const demandStr = entity.demand > 0.0001 ? entity.demand.toString().substring(0, 5) : '~0';
			output.push(`${entityName}: ${supplyStr} | ${demandStr}`);
		});

		return output.join('\n');
	}
}