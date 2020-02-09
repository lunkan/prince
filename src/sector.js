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
				supplyDecrementor: 0,
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
		const supply = entity.supply * (entity.demand ? demand / entity.demand : 0);
		// entity.supplyDecrementor += supply;
		return supply;
	}

	execute() {
		this.entities.forEach((entity, entityName) => {
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
					return vector.execute(entityName, 0);	
				}
				
			}).reduce((acc, supply) => acc + supply, 0);

			

			/*const ratio = entity.supplyDecrementor ? entity.supply / entity.supplyDecrementor : 1;

			const supplyIn = worker.production + vectorSupplySum;
			const supplyOut = worker.consumtion; // entity.supplyDecrementor

			entity.supply = Math.max(0, worker.production + vectorSupplySum - worker.consumtion) * (Math.min(1, ratio) * 0.5 + 0.5);
			entity.supplyDecrementor = 0;*/

			entity.supply = worker.production + vectorSupplySum;

			//entity.supply = vectorSupplySum;

			

			// entity.supply = worker.production ? Math.max(worker.production, vectorSupplySum): vectorSupplySum; // Math.max(0, worker.production + vectorSupplySum - worker.consumtion);
			// entity.supply = Math.min(entity.supply, worker.consumtion + entity.demandIncrementor);


			entity.demand = worker.consumtion + entity.demandIncrementor;
			entity.demandIncrementor = 0;

			if (worker.production) {
				console.log('prod:', worker.production, entity.supply, entity.demand, entity.demand / entity.supply);
			}
			
			if (worker.consumtion) {
				console.log('cons:', worker.consumtion, entity.supply, entity.demand, entity.demand / entity.supply);
			}

			/*if (worker.production && entity.demand / entity.supply > 0.1) {
				entity.supply += worker.production;
			}*/
		});
	}
}