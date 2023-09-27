import {ValidationResult} from "./ValidationTypes";


export function validateOptions(options: object, loadedDatasets: string[]): ValidationResult {
	if (options === null) {
		return {valid: false, error: "OPTIONS is null!"};
	}
	const validKeys = ["COLUMNS", "ORDER"];  // Valid keys list
	let keys = Object.keys(options);
	if (keys.length === 0) {
		return {valid: false, error: "OPTIONS is empty"};
	}
	// Check for unexpected keys
	const unexpectedKeys = Object.keys(options).filter((key) => !validKeys.includes(key));
	if (unexpectedKeys.length > 0) {
		return {valid: false, error: `Unexpected key(s) in options: ${unexpectedKeys.join(", ")}`};
	}

	if (!("COLUMNS" in options)) {
		return {valid: false, error: "OPTIONS does not contain COLUMNS"};
	}

	let columns = options.COLUMNS;
	if (!Array.isArray(columns) || !columns.every((col) => typeof col === "string")) {
		return {valid: false, error: "COLUMN is not an array or contains non-string elements"};
	}

	if (!validateColumns(columns, loadedDatasets).valid) {
		return {valid: false, error: "COLUMNS is not valid"};
	}

	if ("ORDER" in options) {
		let order = options.ORDER;
		if (typeof order === "string") {
			let res = validateOrder(order, options.COLUMNS as string[], loadedDatasets);
			if (res.valid) {
				if (!(options.COLUMNS as string[]).includes(order)) {
					return {valid: false, error: "ORDER is not in COLUMNS"};
				}
			} else {
				return res;
			}
		} else {
			return {valid: false, error: "ORDER is not a string"};
		}
	}

	return {valid: true};
}

function validateColumns(columns: string[], loadedDatasets: string[]): ValidationResult {
	if (columns.length === 0) {
		return {valid: false, error: "COLUMNS is empty"};
	}

	let datasetId = columns[0].split("_")[0];
	if (!loadedDatasets.includes(datasetId)) {
		return {valid: false, error: "COLUMNS contains columns from unloaded dataset"};
	}
	let columnSet = new Set(); // Used to check duplicates

	for (let column of columns) {
		let fragment = column.split("_");
		if (fragment.length !== 2) {
			return {valid: false, error: "COLUMNS contains invalid column"};
		}
		if (fragment[0] !== datasetId) {
			return {valid: false, error: "COLUMNS contains columns from multiple datasets"};
		}
		if (!loadedDatasets.includes(datasetId)) {
			return {valid: false, error: "COLUMNS contains columns from unloaded dataset"};
		}
		columnSet.add(fragment[1]);
	}
	if (columnSet.size !== columns.length) {
		return {valid: false, error: "COLUMNS contains duplicate entries"};
	}
	const mfields = new Set(["avg", "pass", "fail", "audit", "year"]);
	const sfields = new Set(["dept", "id", "instructor", "title", "uuid"]);
	for (let column of columns) {
		let fieldType = column.split("_")[1];
		if (!mfields.has(fieldType) && !sfields.has(fieldType)) {
			return {valid: false, error: "COLUMNS contains an unrecognized field"};
		}
	}
	return {valid: true};
}

function validateOrder(order: string, columns: string[], loadedDatasets: string[]): ValidationResult{
	let targetID = columns[0].split("_")[0];
	let actualID = order.split("_")[0];
	if (targetID !== actualID) {
		return {valid: false, error: "ORDER does not match COLUMNS"};
	}
	if (!loadedDatasets.includes(targetID)) {
		return {valid: false, error: "ORDER references unloaded dataset"};
	}
	const mfields = new Set(["avg", "pass", "fail", "audit", "year"]);
	const sfields = new Set(["dept", "id", "instructor", "title", "uuid"]);

	let fieldType = order.split("_")[1];
	if (!mfields.has(fieldType) && !sfields.has(fieldType)) {
		return {valid: false, error: "ORDER contains an unrecognized field"};
	}
	return {valid: true};
}
