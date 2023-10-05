import * as fs from "fs-extra";
import {parseZip} from "./ParseZip";
import InsightFacade from "../controller/InsightFacade";
import {Dataset} from "./Courses";

const persistDir = "./data";

// Saves input Dataset as a JSON file with name set as dataset name
export function toDisk(id: string, dataset: Dataset): void {
	const {...object} = dataset;
	fs.writeFileSync(persistDir + "/" + id + ".json", JSON.stringify(object));
}

// Reads from directory persistDir and loads them into InsightFacade
// TODO: change to synchronous by changing how we save to disk
export function fromDisk(insightFacade: InsightFacade): void {
	let files: string[] = fs.readdirSync(persistDir);
	for (const fileName of files) {
		let file = fs.readFileSync(persistDir + "/" + fileName).toString("base64");
		let datasetObj = JSON.parse(file);
		insightFacade.datasets.push(datasetFromJSON(datasetObj));
	}
}

function datasetFromJSON(input: object): Dataset {
	if (Object.hasOwn(input, "id")) {
		let id = (input as any).id;
		return Object.assign(new Dataset(id), input);
	}
	return new Dataset("Invalid-Dataset");
}

// Finds a saved dataset with given name and deletes it
export function removeDisk(id: string): void {
	fs.removeSync(persistDir + "/" + id + ".json");
}
