import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError,
	ResultTooLargeError
} from "./IInsightFacade";

import {fromDisk, removeDisk, toDisk} from "../helpers/DiskHelpers";

import {Dataset} from "../helpers/Courses";
import {parseZip} from "../helpers/ParseZip";
import {performQueryHelper} from "../helpers/PerformQueryHelper";
import {requestValidator} from "../helpers/RequestValidator";
import {parseHTML} from "../helpers/ParseHTML";

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
		fromDisk(this);
	}

	public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		let datasetIDs = this.datasets.map((each) => each.datasetName);

		if (datasetIDs.includes(id)) {
			return Promise.reject(new InsightError("Duplicate Dataset id!"));
		}
		if (id.includes("_")) {
			return Promise.reject(new InsightError("invalid dataset ID"));
		}
		// Check if the id is an empty string or consists of all spaces.
		if (!id.trim()) {
			return Promise.reject(new InsightError("Dataset id cannot be empty or spaces only!"));
		}
		if (kind === InsightDatasetKind.Sections) {
			return parseZip(id, content)
				.then((dataset) => {
					this.datasets.push(dataset);
					toDisk(id, dataset);
					return this.datasets.map((each) => each.datasetName);
				})
				.catch((e) => {
					return Promise.reject(new InsightError(e));
				});
		}
		if (kind === InsightDatasetKind.Rooms) {
			return parseHTML(id, content)
				.then((dataset) => {
					this.datasets.push(dataset);
					toDisk(id, dataset);
					return this.datasets.map((each) => each.datasetName);
				})
				.catch((e) => {
					return Promise.reject(new InsightError(e));
				});
		}
		return Promise.reject(new InsightError("kind is neither sections nor rooms"));
	}

	public async removeDataset(id: string): Promise<string> {
		let datasetIDs = this.datasets.map((each) => each.datasetName);

		// check if id has underscore
		if (id.includes("_")) {
			return Promise.reject(new InsightError("invalid dataset ID"));
		}
		// Check if the id is an empty string or consists of all spaces.
		if (!id.trim()) {
			return Promise.reject(new InsightError("Dataset id cannot be empty or spaces only!"));
		}
		// check if dataset with id is present
		if (!datasetIDs.includes(id)) {
			return Promise.reject(new NotFoundError("Dataset id not found!"));
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
			let result = requestValidator(query, this.datasets);
			if (!result.valid) {
				reject(new InsightError(result.error));  // Use reject instead of returning a rejected promise
				return;
			}
			try {
				const queryResult = performQueryHelper(query, this.datasets);  // TODO Await the performQueryHelper function
				resolve(queryResult);  // Resolve with the result
			} catch (err) { // magic, dont touch!!!!!
				const errorMessage: string = (err as any).message || (err as object).toString();

				if (errorMessage.includes("logic")) {
					reject(new InsightError(errorMessage));
				} else {
					reject(new ResultTooLargeError(errorMessage));
				}
			}
		});
	}

	public listDatasets(): Promise<InsightDataset[]> {
		let result: InsightDataset[] = [];
		for (const dataset of this.datasets) {
			let rows = dataset.getRows();
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
