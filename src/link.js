export class Link {
	static generateKey(sectorA, sectorB) {
		const keySortedSectors = [sectorA, sectorB].sort((a, b) => a.id - b.id);
		return keySortedSectors.map(sector => sector.id).join('_');
	}

	static isNeighborVectors(vectorA, vectorB) {
		if (vectorA.source !== vectorB.source) {
			return false;
		} else if (vectorA.target.x === vectorB.target.x && Math.abs(vectorB.target.y - vectorA.target.y) === 1) {
			return true;
		} else if (vectorA.target.y === vectorB.target.y && Math.abs(vectorB.target.x - vectorA.target.x) === 1) {
			return true;
		} else {
			return false;
		}
	}

	constructor(config, sectorA, sectorB) {
		this.terrain = config.terrainResistance.default + (sectorA.terrain.mountains * config.terrainResistance.mountain)/2 + (sectorB.terrain.mountains * config.terrainResistance.mountain)/2;
		this.distance = Math.sqrt(Math.pow(sectorA.x - sectorB.x, 2) + Math.pow(sectorA.y - sectorB.y, 2));

		this.vectors = [sectorA, sectorB].map((sector, i, list) => {
			return {
				source: sector,
				target: i === 0 ? list[1] : list[0], 
				entities: new Map(config.entities.map(entity => [
					entity.name,
					{
						demand: 0,
						supply: 0,
					},
				])),
			};
		});
	}

	getVectorFromSource(source) {
		const vector = this.vectors.find(vector => vector.source === source);
		return {
			execute: this.execute.bind(this, vector),
			getValue: this.getValue.bind(this, vector),
			isNeighborVector: function (neighbor) {
				return Link.isNeighborVectors(vector, neighbor);
			},
		};
	}

	execute(vector, entityName, value) {
		const entity = vector.entities.get(entityName); 
		entity.demand = entity.demand * 0.9 + value * 0.1;

		const resistance = 1 + (this.terrain / (1 + entity.supply * 2)) * this.distance;
		const modDemand = entity.demand / resistance;
		entity.supply = vector.target.getSupply(entity, modDemand);
		
		return entity.supply;
	}

	getValue(vector, entityName) {
		const entity = vector.entities.get(entityName);
		return entity.supply ? entity.demand / entity.supply : 0;
	}
}
