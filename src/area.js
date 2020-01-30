
export class Area {
	constructor(x, y) {
		this.x = x;
		this.y = y;

		this.stock = [];

		this.links;

		this.mountains = 0;
	}

	connect() {
		const neighbors = getNeighborNodes(this);
		this.links = neighbors.map(neighbor => new Link(neighbor, this, 1 / neighbors.length));
	}

	getNeighborLinks(link) {
		return this.links.filter(neighborLink => {
			if (link === neighborLink) {
				return false;
			} else if (link.target.x === neighborLink.target.x && Math.abs(neighborLink.target.y - link.target.y) === 1) {
				return true;
			} else if (link.target.y === neighborLink.target.y && Math.abs(neighborLink.target.x - link.target.x) === 1) {
				return true;
			} else {
				return false;
			}
		});
	}
}