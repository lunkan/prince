
export class Workers {
	constructor(config, sector) {
		this.sector = sector;

		this.workers = new Map(config.workers.map(worker => [
			worker.name, {
				config: worker,
				consumtion: 0,
				production: 0,
				income: 0,
				amount: 0,
				weights: new Array(worker.consumes.length).fill(null).map(() => {
					return {
						value: 0,
						delta: 0,
						weight: 1 / worker.consumes.length, 
					};
				}),
			},
		]));
	}

	get(entityName) {
		return this.workers.get(entityName);
	}

	run() {
		this.workers.forEach(worker => {
			if (worker.amount) {
				const demand = 1;

				worker.weights = worker.config.consumes.map((consumtion, i) => {
					const value = this.sector.getSupply(consumtion.entity, worker.amount);//worker.weights[i] * demand);
					const normValue = (value / consumtion.value) - worker.amount;
					const sigmoidValue = 1 / (1 + Math.exp(-normValue));

					worker.weights[i].ref = value;
					worker.weights[i].value = sigmoidValue;
					worker.weights[i].delta = sigmoidValue * (1 - sigmoidValue);
					return worker.weights[i];
				});

				worker.weights
					.sort((a, b) => a.delta - b.delta)
					.forEach((weight, i) => {
						weight.weight = weight.weight * 0.9;

						if (i === 0) {
							weight.weight += 0.1;
						}
					});

				worker.consumtion = worker.weights.reduce((acc, weight, i) => {
					return acc + weight.value / worker.weights.length;
				}, 0);

				console.log('worker:', worker);

				worker.production = 0;
				worker.income = 0;
			}
		});
	}

	execute(entityName, value) {
		let valueSum = 0;
		this.workers.forEach(worker => {
			let workerProduction = 0;
			worker.config.produce.forEach(production => {
				if (production.entity === entityName) {
					workerProduction += worker.amount * production.value;
					worker.income += value;
				}
			});

			worker.production += workerProduction;
			valueSum += workerProduction
		});
		
		return valueSum;
	}

	getValue(entityName) {
		let value = 0;
		this.workers.forEach(worker => {

			worker.config.produce.forEach(production => {
				if (production.entity === entityName) {
					value += worker.amount * production.value;
				}
			});
		});

		return value > 0 ? value : Number.MAX_SAFE_INTEGER;
	}

	get target() {
		return this.sector;
	}

	isNeighborVector(vector) {
		return false;
	}

	toString() {
		const output = [];

		output.push('WORKERS');
		this.workers.forEach((worker, workerName) => {
			output.push(`${workerName}: ${worker.amount}`);
		});

		return output.join('\n');
	}
}