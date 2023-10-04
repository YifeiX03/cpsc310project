import {ValidationResult} from "./ValidationTypes";
import {validateWhere} from "./WhereValidator";
import {validateOptions} from "./OptionsValidator";


/**
 * Validates a query request
 * @param request: query request
 * @param loadedDataSets: list of loaded datasets
 * @return: ValidationResult
 */
export function requestValidator(request: any, loadedDataSets: string[]): ValidationResult{
	if (request == null) {
		return {valid: false, error: "request is null"};
	}

	if (!("WHERE" in request) || !("OPTIONS" in request)) {
		return {valid: false, error: "request does not contain WHERE or OPTIONS"};
	}

	if (typeof request.WHERE !== "object" || typeof request.OPTIONS !== "object") {
		return {valid: false, error: "WHERE or OPTIONS is not an object"};
	}
	let datasetName: string = "";
	// Check if dataset name is valid, if so, set datasetName for later assertions for only reference one dataset
	if ("OPTIONS" in request && typeof request.OPTIONS === "object") {
		if ("COLUMNS" in request.OPTIONS) {
			if (Array.isArray(request.OPTIONS.COLUMNS) && request.OPTIONS.COLUMNS.length > 0) {
				if (typeof request.OPTIONS.COLUMNS[0] === "string") {
					let fragment = request.OPTIONS.COLUMNS[0].split("_");
					if (fragment.length === 2) {
						datasetName = fragment[0];
					}
				}
			}
		}
	}
	if (datasetName === "") {
		return {valid: false, error: "in COLUMN, wrong dataset"};
	}
	let res1 = validateWhere(request.WHERE, loadedDataSets, datasetName);
	let res2 = validateOptions(request.OPTIONS, loadedDataSets);
	return {valid: res1.valid && res2.valid, error: res1.error === undefined ? res2.error : res1.error};
}
