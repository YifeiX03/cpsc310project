import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	ResultTooLargeError,
} from "./IInsightFacade";

import {
	Dataset
} from "../helpers/Courses";
import {parseZip} from "../helpers/ParseZip";
import {performQueryHelper} from "../helpers/PerformQueryHelper";
import {requestValidator} from "../helpers/RequestValidator";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 */
export default class InsightFacade implements IInsightFacade {
	public datasets: Dataset[];

	constructor() {
		console.log("InsightFacadeImpl::init()");
		this.datasets = [];
		if (this.datasets) {
			console.log("Successfully initialized datasets");
		}
		// TODO: figure out how to load from disk everytime a new InsightFacade is made
		fromDisk(this);
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
			.catch((e) => {
				return Promise.reject(new InsightError(e));
			});
	}

	public async removeDataset(id: string): Promise<string> {
		let datasetIDs = this.datasets.map((each) => each.datasetName);

		if (!datasetIDs.includes(id)) {
			return Promise.reject(new NotFoundError("Dataset id not found!"));
		}
		// check if id has underscore

		// Check if the id is an empty string or consists of all spaces.
		if (!id.trim()) {
			return Promise.reject(new InsightError("Dataset id cannot be empty or spaces only!"));
		}
		try {
			this.datasets.forEach((item, index) => {
				if (item.datasetName === id) {
					this.datasets.splice(index, 1);
				}
			});
			removeDisk(id);
			return Promise.resolve(id);
		} catch (e) {
			return Promise.reject(new InsightError());
		}
	}

	public performQuery(query: unknown): Promise<InsightResult[]> {
		return new Promise((resolve, reject) => {  // Notice the async keyword here
			let result = requestValidator(query, this.datasets.map((each) => each.datasetName));
			if (!result.valid) {
				reject(new InsightError(result.error));  // Use reject instead of returning a rejected promise
				return;
			}
			try {
				const queryResult = performQueryHelper(query, this.datasets);  // Await the performQueryHelper function
				resolve(queryResult);  // Resolve with the result
			} catch (err) {
				reject(new ResultTooLargeError(err as string));  // Reject if there's an error
			}
		});
	}
	public listDatasets(): Promise<InsightDataset[]> {
		let result: InsightDataset[] = [];
		for (const dataset of this.datasets) {
			let rows = 0;
			for (const course of dataset.courses) {
				rows += course.sections.length;
			}
			let insightDataset: InsightDataset = {
				id: dataset.datasetName,
				kind: dataset.type,
				numRows: rows
			};
			result.push(insightDataset);
		}
		return Promise.resolve(result);
	}
}
