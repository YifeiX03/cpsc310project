import {Dataset} from "./Courses";
import {InsightDatasetKind} from "../controller/IInsightFacade";
import {mfields, roomMfields, roomSfields, sfields, ValidationResult} from "./ValidationTypes";

export function getDatasetType(datasetName: string, datasets: Dataset[]): string {
	for (let dataset of datasets) {
		if (dataset.datasetName === datasetName) {
			if (dataset.type === InsightDatasetKind.Rooms) {
				return "rooms";
			} else if (dataset.type === InsightDatasetKind.Sections) {
				return "sections";
			}
		}
	}
	return "unknown";
}

export function validateKeys(datasets: Dataset[], datasetName: string,
	key: string, keyType: "skey" | "mkey" | "both"): boolean {
	const datasetType = getDatasetType(datasetName, datasets);

	const isSKey = (currentKey: string) => {
		if (datasetType === "rooms") {
			return roomSfields.has(currentKey);
		} else if (datasetType === "sections") {
			return sfields.has(currentKey);
		}
		return false;
	};

	const isMKey = (currentKey: string) => {
		if (datasetType === "rooms") {
			return roomMfields.has(currentKey);
		} else if (datasetType === "sections") {
			return mfields.has(currentKey);
		}
		return false;
	};

	if (keyType === "skey") {
		return isSKey(key);
	} else if (keyType === "mkey") {
		return isMKey(key);
	} else {
		return isSKey(key) || isMKey(key);
	}
}

export function extractAggregationColumns(arr: any[]): string[] {
	return arr.map((obj) => Object.keys(obj)[0]);
}

export function extractDatasetName(request: any): ValidationResult | string {
	let datasetName: string = "";
	if ("OPTIONS" in request && typeof request.OPTIONS === "object" && "COLUMNS" in request.OPTIONS &&
		Array.isArray(request.OPTIONS.COLUMNS) && request.OPTIONS.COLUMNS.length > 0) {
		if (typeof request.OPTIONS.COLUMNS[0] === "string") {
			let fragment = request.OPTIONS.COLUMNS[0].split("_");
			if (fragment.length === 2) {
				datasetName = fragment[0];
			} else if ("TRANSFORMATIONS" in request && "GROUP" in
				request.TRANSFORMATIONS && Array.isArray(request.TRANSFORMATIONS.GROUP)
				&& request.TRANSFORMATIONS.GROUP.length > 0) {
				let fragment2 = request.TRANSFORMATIONS.GROUP[0].split("_");
				if (fragment2.length === 2) {
					datasetName = fragment2[0];
				}
			}
		}
	}
	return datasetName;
}
