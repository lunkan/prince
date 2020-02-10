
export class Workers {
	constructor(entityName) {
		this.entityName = entityName;

	}

	execute(entityName, value) {
		const entity = vector.entities.get(entityName); 
		entity.demand = entity.demand * 0.9 + value * 0.1;

		// Base 1.25 - to counter current bonus for demand (1.2)
		const resistance = 1.25 + (this.terrain / (1 + entity.supply * 2)) * this.distance;

		const modDemand = entity.demand / resistance;
		entity.supply = vector.target.getSupply(entityName, modDemand);

		return entity.supply;
	}

	getValue(entityName) {
		const entity = vector.entities.get(entityName);
		return entity.supply ? entity.demand / entity.supply : -Math.random();
	}

	isNeighborVector(vector) {
		return false;
	}
}