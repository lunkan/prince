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
				demand: 1,
				supplyIncrementor: 0,
				supply: 0,
			},
		]));

		this.workers = new Map(config.entities.map(entity => [
			entity.name,
			{
				production: 0,
				consumtion: 0,
			},
		]));
	}

	connect(vectors) {
		this.vectors = vectors;
	}

	getSupply(entityName, demand) {
		const entity = this.entities.get(entityName);
		entity.demandIncrementor += demand;
		return entity.supply * (demand / entity.demand);
	}

	execute() {
		this.entities.keys().forEach(entityName => {
			const entity = this.entities.get(entityName);
			const worker = this.workers.get(entityName);

			const vectorWinner = this.vectors.sort((vectorA, vectorB) => {
				return vectorA.getValue(entityName) - vectorB.getValue(entityName);
			})[0];

			const vectorSupplySum = this.vectors.map(vector => {
				if (vector === vectorWinner) {
					return vector.execute(entityName, 1.2 * entity.demand);	
				} else if (vector.isNeighborVector(vectorWinner)) {
					return vector.execute(entityName, -0.1 * entity.demand);	
				} else {
					return vector.execute(0);	
				}
				
			}).reduce((acc, supply) => acc + supply, 0);

			entity.supply = Math.max(0, vectorSupplySum + worker.production - worker.consumtion);
			entity.demand = entity.demandIncrementor;
			entity.demandIncrementor = 0;
		});
	}
}