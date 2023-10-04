import * as fs from "fs-extra";
import {parseZip} from "./ParseZip";
import InsightFacade from "../controller/InsightFacade";
import {Dataset} from "./Courses";

const persistDir = "./data";

// Saves input serialized zip as a file with name set as dataset name
export function toDisk(id: string, dataset: string): void {
	fs.writeFileSync(persistDir + "/" + id + ".txt", dataset);
}

// Reads from directory persistDir and loads them into InsightFacade
// Returns an array of datasets added
export async function fromDisk(insightFacade: InsightFacade): Promise<string[]> {
	let files: string[] = fs.readdirSync(persistDir);
	let ids: string[] = [];
	let promises: Array<Promise<Dataset>> = [];
	files.forEach( (fileName) => {
		let file: string = fs.readFileSync(persistDir + "/" + fileName).toString("base64");
		let id: string = fileName.replace(".txt", "");
		promises.push(parseZip(id, file));
		ids.push(id);
	});
	let datasets = await Promise.all(promises);
	for (const dataset of datasets) {
		insightFacade.datasets.push(dataset);
	}
	return ids;
}

// Finds a saved dataset with given name and deletes it
// Returns id of deleted dataset
export function removeDisk(id: string): void {
	fs.removeSync(persistDir + "/" + id + ".txt");
}
