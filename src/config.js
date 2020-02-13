export const config = {
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
};