
export class Workers {
	constructor(config, sector) {
		this.sector = sector;

		this.workers = new Map(config.workers.map(worker => [
			worker.name, {
				config: worker,
				amount: 0,

			},
		]));
	}

	get(entityName) {
		return this.workers.get(entityName);
	}

	run() {
		const value = 1;
		this.workers.forEach(worker => {
			if (worker.amount) {
				worker.config.consumes.forEach(consumtion => {
					this.sector.getSupply(consumtion.entity, worker.amount * value);
				});
			}
		});
	}

	execute(entityName, value) {
		let valueSum = 0;
		this.workers.forEach(worker => {

			worker.config.produce.forEach(production => {
				if (production.entity === entityName) {
					valueSum += worker.amount * production.value;
				}
			});
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