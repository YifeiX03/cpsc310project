import {Building, Dataset, Room} from "./Courses";
import * as JSZip from "jszip";
import * as Parse5 from "parse5";
import {InsightDatasetKind} from "../controller/IInsightFacade";
import http from "http";
import {getGeolocationRequest, getGeolocations} from "./HTTPHelpers";
import {checkDataset} from "./CheckDataset";

// parses and validates a serialized zip of html files and returns a dataset
// returns Dataset
// Partially uses code from
// https://stackoverflow.com/questions/39322964/extracting-zipped-files-using-jszip-in-javascript
export async function parseHTML(id: string, dataZip: string): Promise<Dataset> {
	let buffer = Buffer.from(dataZip, "base64");
	let zip = await JSZip.loadAsync(buffer);
	errorCheck(zip === null, "Zip is null");
	let indexFile = await zip.files["index.htm"].async("string");
	let fileMap = await getRoomFiles(zip);
	let indexDoc = Parse5.parse(indexFile);
	let fileDocMap = new Map();
	for (let entry of fileMap.entries()) {
		fileDocMap.set(entry[0], Parse5.parse(entry[1]));
	}
	let datasetObj;
	try {
		datasetObj = await createDataset(indexDoc, fileDocMap);
	} catch(e) {
		return Promise.reject(e);
	}
	if (datasetObj) {
		let dataset = ObjectToDataset(id, datasetObj);
		if (checkDataset(dataset)) {
			return Promise.resolve(dataset);
		}
	}
	return Promise.reject("Couldn't construct dataset :/");
}
function ObjectToDataset(id: string, datasetObj: any) {
	let dataset = new Dataset(id);
	dataset.type = InsightDatasetKind.Rooms;
	for (let buildingObj of datasetObj) {
		let building = new Building(
			buildingObj.fullname,
			buildingObj.shortname,
			buildingObj.address,
			buildingObj.lat,
			buildingObj.lon
		);
		for (let roomObj of buildingObj.rooms) {
			let room = new Room(
				roomObj.number,
				roomObj.name,
				roomObj.seats,
				roomObj.type,
				roomObj.furniture,
				roomObj.href
			);
			building.rooms.push(room);
		}
		dataset.buildings.push(building);
	}
	return dataset;
}

async function getRoomFiles(zip: any): Promise<Map<string, string>> {
	const filePromises = [];
	const fileNames = [];
	for (const fileName of Object.keys(zip.files)) {
		// excludes the index file
		if (fileName === "index.htm"){
			continue;
		}
		fileNames.push(fileName);
		filePromises.push(zip.files[fileName].async("string"));
	}
	const files = await Promise.all(filePromises);
	errorCheck(fileNames.length !== files.length, "Error in getRoomFiles, arrays not same length");
	const fileMap = new Map();
	for (const index in fileNames) {
		fileMap.set(fileNames[index], files[index]);
	}
	return fileMap;
}

async function createDataset(index: any, files: Map<any, any>): Promise<object[] | null>{
	let table = filterTable(findChildren(index, "tr"));
	if (table.length === 0) {
		throw new Error("No table found in index");
	}
	let buildings = await createBuildings(table);
	createRoomsForBuildings(buildings, files);
	await getGeolocations(buildings);
	return buildings;
}

async function createBuildings(table: any[]): Promise<object[]> {
	let buildings: object[] = [];
	for (let element of table) {
		let building = {
			fullname:
				findChild(
					findChild(
						findClass(element, "views-field views-field-title"),
						"a"),
					"#text")?.value,
			shortname:
				findChild(
					findClass(element, "views-field views-field-field-building-code"),
					"#text")?.value,
			address:
				findChild(
					findClass(element, "views-field views-field-field-building-address"),
					"#text")?.value,
			lat: null,
			lon: null,
			rooms: [],
			path: findChild(
				findClass(element, "views-field views-field-nothing"),
				"a")?.attrs[0]?.value,
			path2: findChild(
				findClass(element, "views-field views-field-title"),
				"a")?.attrs[0]?.value
		};
		building.fullname = trim(building.fullname);
		building.shortname = trim(building.shortname);
		building.address = trim(building.address);
		buildings.push(building);
	}
	return buildings;
}

function createRoomsForBuildings(buildings: any[], buildingsMap: Map<any,any>) {
	for (let building of buildings) {
		let rooms: object[] = [];
		let path = building.path;
		if (path === null || path === undefined) {
			path = building.path2;
			if (path === null || path === undefined) {
				continue;
			}
		}
		path = path.replace("./","");
		let buildingFile = buildingsMap.get(path);
		if (buildingFile === undefined) {
			continue;
		}
		let roomsTable = filterTable(findChildren(buildingFile, "tr"));
		rooms = createRooms(building, roomsTable);
		building.rooms = rooms;
	}
}

function createRooms(building: any, table: any[]): object[] {
	let rooms: object[] = [];
	for (let element of table) {
		let number =
			findChild(
				findChild(
					findClass(element, "views-field views-field-field-room-number"),
					"a"),
				"#text")?.value;
		number = trim(number);
		let room = {
			number: number,
			name: building.shortname?.concat(" ").concat(number),
			seats:
				findChild(
					findClass(element, "views-field views-field-field-room-capacity"),
					"#text")?.value,
			type:
				findChild(
					findClass(element, "views-field views-field-field-room-type"),
					"#text")?.value,
			furniture:
				findChild(
					findClass(element, "views-field views-field-field-room-furniture"),
					"#text")?.value,
			href:
				findChild(
					findClass(element, "views-field views-field-nothing"),
					"a")?.attrs[0]?.value,
		};
		room.name = trim(room.name);
		room.seats = Number(trim(room.seats));
		room.type = trim(room.type);
		room.furniture = trim(room.furniture);
		rooms.push(room);
	}
	return rooms;
}

// TODO: test this when you get home to make sure it works
function filterTable(table: any[]): any[]{
	let filteredResults: any[] = [];
	for (let element of table) {
		let hasTD = true;
		for (let child of element.childNodes) {
			if (!child.tagName) {
				continue;
			}
			if (child.tagName !== "td") {
				hasTD = false;
			}
		}
		if (hasTD) {
			filteredResults.push(element);
		}
	}
	return filteredResults;
}

// Might turn this into findByType where you can put in the type of node as well as value
function findClass(node: any, classVal: string): any {
	if (node === null) {
		return null;
	}
	for (let i = 0; i < node.childNodes?.length; i++) {
		let child = node.childNodes[i];
		if (!child.attrs) {
			continue;
		}
		if (child.attrs[0]?.name === "class" && child.attrs[0]?.value === classVal) {
			return child;
		}
		// const result = findClass(child, classVal);
		// if (result) {
		// 	return result;
		// }
	}
	return null;
}

// uses code from https://stackoverflow.com/questions/67591100/how-to-parse-with-parse5
function findChild(node: any, name: string): any {
	if (node === null) {
		return null;
	}
	for (let i = 0; i < node.childNodes?.length; i++) {
		if (node.childNodes[i].nodeName === name) {
			return node.childNodes[i];
		}

		const result = findChild(node.childNodes[i], name);
		if (result) {
			return result;
		}
	}
	return null;
}

function findChildren(node: any, tag: string): any[] {
	let results: any[] = [];
	for (let i = 0; i < node.childNodes?.length; i++) {
		if (node.childNodes[i].nodeName === tag) {
			results.push(node.childNodes[i]);
		}

		const result = findChildren(node.childNodes[i], tag);
		if (result) {
			results = results.concat(result);
		}
	}
	return results;
}

function trim(input: string) {
	return input.replace(/(\n)/, "").trim();
}

function errorCheck (input: boolean, message: string) {
	if (input) {
		throw new Error(message);
	}
}
