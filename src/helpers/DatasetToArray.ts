import {Dataset} from "./Courses";

export function datasetToArray(dataset: Dataset) {
	let rooms: object[] = [];
	for (let building of dataset.buildings) {
		for (let room of building.rooms) {
			let roomObj = {
				fullname: building.fullname,
				shortname: building.shortname,
				number: room.number,
				name: room.name,
				address: building.address,
				lat: building.lat,
				lon: building.lon,
				seats: room.seats,
				type: room.type,
				furniture: room.furniture,
				href: room.href
			};
			rooms.push(roomObj);
		}
	}
	return rooms;
}
