export const config = {
	terrainResistance: {
		default: 1,
		mountain: 20,
	},
	entities: [{
		name: 'wool'
	}],
	workers: [{
		name: 'shepherd',
		color: '#0000ff',
		produce: [{
			entity: 'wool',
			value: 1,
		}],
		consumes: [],
	}, {
		name: 'tailor',
		color: '#ff0000',
		produce: [],
		consumes: [{
			entity: 'wool',
			value: 1,
		}],
	}],
};