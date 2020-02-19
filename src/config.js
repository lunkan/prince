export const config = {
	general: {
		supplyDecline: 0.98,
		demandDirectionSharpness: 0, //-0.2,
	},
	terrainResistance: {
		default: 3,
		grassland: 1,
		plain: 1,
		mountain: 20,
		forrest: 5,
	},
	entities: [{
		name: 'wool',
	}, {
		name: 'grain',
	}, {
		name: 'lumber',
	}, {
		name: 'stone',
	}, {
		name: 'handcraft',
	}],
	workers: [{
		name: 'shepherd',
		color: '#00cc00',
		produce: [{
			entity: 'wool',
			value: 1,
		}],
		consumes: [{
			entity: 'grain',
			value: 0.5,
		}, {
			entity: 'handcraft',
			value: 0.5,
		}],
	}, {
		name: 'miner',
		color: '#3d3d29',
		produce: [{
			entity: 'stone',
			value: 1,
		}],
		consumes: [{
			entity: 'lumber',
			value: 0.15,
		}, {
			entity: 'wool',
			value: 0.15,
		}, {
			entity: 'grain',
			value: 0.15,
		}, {
			entity: 'handcraft',
			value: 55,
		}],
	}, {
		name: 'farmer',
		color: '#ffcc00',
		produce: [{
			entity: 'grain',
			value: 1,
		}],
		consumes: [{
			entity: 'lumber',
			value: 0.5,
		}, {
			entity: 'handcraft',
			value: 0.5,
		}],
	}, {
		name: 'woodcutter',
		color: '#006600',
		produce: [{
			entity: 'lumber',
			value: 1,
		}],
		consumes: [{
			entity: 'wool',
			value: 0.5,
		}, {
			entity: 'handcraft',
			value: 0.5,
		}],
	}, {
		name: 'craftsmen',
		color: '#cc0000',
		produce: [{
			entity: 'handcraft',
			value: 1,
		}],
		consumes: [{
			entity: 'lumber',
			value: 0.25,
		}, {
			entity: 'wool',
			value: 0.25,
		}, {
			entity: 'grain',
			value: 0.25,
		}, {
			entity: 'stone',
			value: 0.25,
		}],
	}],
};

/*export const config = {
	general: {
		supplyDecline: 0.98,
		demandDirectionSharpness: -0.2,
	},
	terrainResistance: {
		default: 3,
		plain: 3,
		mountain: 20,
		forrest: 5,
	},
	entities: [{
		name: 'wool',
	}, {
		name: 'grain',
	}, {
		name: 'fur',
	}, {
		name: 'cloth',
	}],
	workers: [{
		name: 'shepherd',
		color: '#0000ff',
		produce: [{
			entity: 'wool',
			value: 1,
		}],
		consumes: [{
			entity: 'cloth',
			value: 1,
		}],
	}, {
		name: 'tailor',
		color: '#ff0000',
		produce: [{
			entity: 'cloth',
			value: 1,
		}],
		consumes: [{
			entity: 'fur',
			value: 1,
		}],
	}, {
		name: 'farmer',
		color: '#ffff00',
		produce: [{
			entity: 'grain',
			value: 1,
		}],
		consumes: [{
			entity: 'wool',
			value: 1,
		}],
	}, {
		name: 'hunter',
		color: '#00ffff',
		produce: [{
			entity: 'fur',
			value: 1,
		}],
		consumes: [{
			entity: 'grain',
			value: 1,
		}],
	}],
};*/


//-------

/*const worker = {
	name: 'shepherd',
	color: '#0000ff',
	produce: {
		entity: 'wool',
		value: 1,
	},
	requires: {
		entity: 'plain',
		value:
	},
	demands: [{
		entity: 'lumber',
		value: 1,
	}],
}*/
