import {
	Dataset,
	Course,
	Section
} from "./Courses";
import * as JSZip from "jszip";
import * as Parse5 from "parse5";

// parses and validates a serialized zip of html files and returns a dataset
// returns Dataset
// Partially uses code from
// https://stackoverflow.com/questions/39322964/extracting-zipped-files-using-jszip-in-javascript
export async function parseHTML(id: string, dataZip: string): Promise<Dataset> {
	let buffer = Buffer.from(dataZip, "base64");
	let zip = await JSZip.loadAsync(buffer);
	errorCheck(zip === null, "Zip is null");
	// TODO: check to see if index.htm is missing
	let indexFile = await zip.files["index.htm"].async("string");
	let fileMap = await getRoomFiles(zip);
	let indexDoc = Parse5.parse(indexFile);
	let fileDocMap = new Map();
	for (let entry of fileMap.entries()) {
		fileDocMap.set(entry[0], Parse5.parse(entry[1]));
	}
	let dataset = createDataset(indexDoc, fileDocMap);
	return Promise.reject("Not yet fully implemented");
}

async function getRoomFiles(zip: any): Promise<Map<string, string>> {
	const filePromises = [];
	const fileNames = [];
	// TODO: check if the files are in the correct folder(s)
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

function createDataset(index: any, files: Map<any, any>): Dataset | null{
	// main idea is to iterate through the table in the index file
	// each element in table has a building, and a link to its local file
	// the files map has the local path as a key, and the parsed html as its value
	// TODO: find the table in index
	let possibleTableEls = findChildren(index, "tr");
	// TODO: iterate through table, creating buildings at each element
	let buildings = createBuildings(possibleTableEls);
	// TODO: follow local path linked at each element to find corresponding file
	// TODO: find room table at each building file and make rooms for each building
	return null;
}

function createBuildings(table: any[]): object[] {
	let buildings: object[] = [];
	for (let element of table) {
		// TODO: temp way of skipping past "th"
		if (element.childNodes[1].nodeName !== "td") {
			continue;
		}
		// TODO: using absolute values here, change might be necessary, and also null checks
		let building = {
			fullname: findClass(element, "views-field views-field-title")?.childNodes[1].childNodes[0].value,
			shortname: null,
			address: null,
			lat: null,
			lon: null,
			path: null
		};
		// TODO: check if any of the values are null
		buildings.push(building);
	}
	return buildings;
}

function findClass(node: any, classVal: string): any {
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
function findChild(node: any, tag: string): any {
	for (let i = 0; i < node.childNodes?.length; i++) {
		if (node.childNodes[i].nodeName === tag) {
			return node.childNodes[i];
		}

		const result = findChild(node.childNodes[i], tag);
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

function errorCheck (input: boolean, message: string) {
	if (input) {
		throw new Error(message);
	}
}
