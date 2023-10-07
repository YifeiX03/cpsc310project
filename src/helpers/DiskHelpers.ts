import * as fs from "fs-extra";
import InsightFacade from "../controller/InsightFacade";
import {Dataset} from "./Courses";

const persistDir = "./data";

// Saves input Dataset as a JSON file with name set as dataset name
// creates the data directory if it doesn't exist
export function toDisk(id: string, dataset: Dataset): void {
	try {
		if (!fs.existsSync(persistDir)) {
			fs.mkdirSync(persistDir);
		}
		const {...object} = dataset;
		fs.writeFileSync(persistDir + "/" + id + ".json", JSON.stringify(object));
	} catch (e) {
		console.error(e);
	}
}

// Reads from directory persistDir and loads them into InsightFacade
// change to synchronous by changing how we save to disk
export function fromDisk(insightFacade: InsightFacade): void {
	try {
		if (!fs.existsSync(persistDir)) {
			return;
		}
		let files: string[] = fs.readdirSync(persistDir);
		for (const fileName of files) {
			let file = fs.readFileSync(persistDir + "/" + fileName, "utf8");
			let datasetObj = JSON.parse(file);
			insightFacade.datasets.push(datasetFromJSON(datasetObj));
		}
	} catch (e) {
		console.error(e);
	}
}

function datasetFromJSON(input: object): Dataset {
	if (Object.hasOwn(input, "datasetName")) {
		let id = (input as any).datasetName;
		return Object.assign(new Dataset(id), input);
	}
	throw new Error("Object did not have datasetName property");
}

// Finds a saved dataset with given name and deletes it
export function removeDisk(id: string): void {
	try {
		fs.removeSync(persistDir + "/" + id + ".json");
	} catch (e) {
		console.error(e);
	}
}
