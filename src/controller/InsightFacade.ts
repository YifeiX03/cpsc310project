import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError,
} from "./IInsightFacade";

import {
	Dataset,
	Course,
	Section
} from "../helpers/Courses";
import {parseZip} from "../helpers/ParseZip";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {
	public datasets: Dataset[];

	constructor() {
		console.log("InsightFacadeImpl::init()");
		this.datasets = [];
		if (this.datasets) {
			console.log("Successfully initialized datasets");
		}
	}

	public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		let datasetIDs = this.datasets.map((each) => each.datasetName);

		if (datasetIDs.includes(id)) {
			return Promise.reject(new InsightError("Duplicate Dataset id!"));
		}

		// Check if the id is an empty string or consists of all spaces.
		if (!id.trim()) {
			return Promise.reject(new InsightError("Dataset id cannot be empty or spaces only!"));
		}

		return parseZip(id, content)
			.then((dataset) => {
				this.datasets.push(dataset);
				return this.datasets.map((each) => each.datasetName);
			})
			.catch(() => {
				return Promise.reject(new InsightError("Dataset file invalid!"));
			});
	}

	public removeDataset(id: string): Promise<string> {
		return Promise.reject("Not implemented.");
	}

	public performQuery(query: unknown): Promise<InsightResult[]> {
		return Promise.reject("Not implemented.");
	}

	public listDatasets(): Promise<InsightDataset[]> {
		return Promise.reject("Not implemented.");
	}
}
