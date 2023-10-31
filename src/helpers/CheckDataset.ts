import {Building, Dataset, Room} from "./Courses";

export function checkDataset(dataset: Dataset): boolean {
	let hasRoom = false;
	let hasValidRoom = false;
	for (let building of dataset.buildings) {
		if (building.rooms.length > 0) {
			hasRoom = true;
			if (checkBuilding(building) && checkRooms(building.rooms)){
				hasValidRoom = true;
				return true;
			}
		}
	}
	return hasRoom && hasValidRoom;
}

function checkBuilding(building: Building): boolean {
	if (
		building.fullname !== null &&
		building.shortname !== null &&
		building.address !== null
	) {
		return true;
	}
	return false;
}

function checkRooms(rooms: Room[]): boolean {
	let hasValidRoom = false;
	for (let room of rooms) {
		if (
			room.number !== null &&
			room.name !== null &&
			room.seats !== null &&
			room.type !== null &&
			room.furniture !== null &&
			room.href !== null
		) {
			hasValidRoom = true;
			return hasValidRoom;
		}
	}
	return hasValidRoom;
}
