import * as fs from "fs-extra";
import {parseZip} from "./parseZip";
import InsightFacade from "../controller/InsightFacade";

const persistDir = "./data";

// Saves input serialized zip as a file with name set as dataset name
export function toDisk(id: string, dataset: string): void {
	fs.writeFileSync(persistDir + "/" + id + ".txt", dataset);
}

// Reads from directory persistDir and loads them into InsightFacade
// Returns an array of datasets added
export function fromDisk(insightFacade: InsightFacade): string[] {
	let files: string[] = fs.readdirSync(persistDir);
	let ids: string[] = [];
	files.forEach( (fileName) => {
		let file: string = fs.readFileSync(persistDir + "/" + fileName).toString("base64");
		let id: string = fileName.replace(".txt", "");
		// insightFacade.datasets.push(parseZip(id, file));
		ids.push(id);
	});
	return ids;
}

// Finds a saved dataset with given name and deletes it
// Returns id of deleted dataset
export function removeDisk(id: string): void {
	fs.removeSync(persistDir + "/" + id + ".txt");
}
