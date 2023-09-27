import {ValidationResult} from "./ValidationTypes";
import {findIndicesOfChar} from "./StringHelper";

type ValidatorFunc = (cmp: any, loadedDatasets: string[], datasetName: string) => ValidationResult;

const validators: {[key: string]: ValidatorFunc} = {
	GT: checkCmp,
	LT: checkCmp,
	EQ: checkCmp,
	IS: validateIS,
	AND: validateAnd,
	OR: validateOr,
	NOT: validateNot
};

function validateIS(is: any, loadedDatasets: string[], datasetName: string): ValidationResult {
	if (is == null) {
		return {valid: false, error: "IS is null"};
	}
	if (typeof is !== "object") {
		return {valid: false, error: "IS is not an object"};
	}
	if (Object.keys(is).length !== 1) {
		return {valid: false, error: "IS has more than one key"};
	}
	let key = Object.keys(is)[0];
	if (key.split("_").length !== 2) {
		return {valid: false, error: "IS has a key that is not a valid key"};
	}
	if (!loadedDatasets.includes(key.split("_")[0])) {
		return {valid: false, error: "IS references unloaded dataset"};

	}
	if (key.split("_")[0] !== datasetName) {
		return {valid: false, error: "IS references multiple datasets"};
	}

	let skey = ["dept", "id", "instructor", "title", "uuid"];
	if (!skey.includes(key.split("_")[1])) {
		return {valid: false, error: "IS has a key that is not a valid key"};
	}
	if (typeof is[key] !== "string") {
		return {valid: false, error: "IS has a value that is not a string"};
	}
	let indices = findIndicesOfChar(is[key], "*");
	for (let i of indices) {
		if ((i !== is[key].length - 1) && (i !== 0)) {
			return {valid: false, error: "IS has a * that is not at the end of the string"};
		}
	}

	if (typeof is[key] !== "string") {
		return {valid: false, error: "IS has a value that is not a string"};
	}
	return {valid: true};
}
function validateAnd(and: any, loadedDatasets: string[], datasetName: string): ValidationResult {
	if (and == null) {
		return {valid: false, error: "AND is null"};
	}
	if (!Array.isArray(and)) {
		return {valid: false, error: "AND is not an array"};
	}
	if (and.length === 0) {
		return {valid: false, error: "AND is empty"};
	}
	for (let filter of and) {
		let res = validateWhere(filter, loadedDatasets, datasetName);
		if (!res.valid) {
			return res;
		}
	}
	return {valid: true};
}

export function validateWhere(where: object, loadedDatasets: string[], datasetName: string): ValidationResult {
	if (where == null) {
		return {valid: false, error: "WHERE is null"};
	}

	const fields = ["AND", "OR", "NOT", "LT", "GT", "EQ", "IS"];
	const keys = Object.keys(where);
	if (keys.length > 1) {
		return {valid: false, error: "WHERE contains more than one key"};
	}

	let countFields = fields.filter((field) => field in where).length;
	if (countFields === 0) { // Check if WHERE is empty
		return {valid: false, error: "WHERE does not contain any of AND, OR, NOT, LT, GT, EQ, or IS"};
	}
	if (countFields > 1) {
		return {valid: false, error: "WHERE contains more than one of AND, OR, NOT, LT, GT, EQ, or IS"};
	}

	const validator = validators[keys[0]];
	if (validator) {
		// const result = validator(where[keys[0]], loadedDatasets, datasetName);
		const result = validator((where as any)[keys[0]], loadedDatasets, datasetName);
		if (!result.valid) {
			return result;
		}
	}

	return {valid: true};
}

function validateNot(not: any, loadedDatasets: string[], datasetName: string): ValidationResult {
	if (not === null) {
		return {valid: false, error: "NOT is null"};
	}
	if (typeof not !== "object") {
		return {valid: false, error: "NOT is not an object"};
	}
	if (Object.keys(not).length !== 1) {
		return {valid: false, error: "NOT has more than one key"};
	}
	return validateWhere(not, loadedDatasets, datasetName);
}

function validateOr(or: any, loadedDatasets: string[], datasetName: string): ValidationResult {
	if (or == null) {
		return {valid: false, error: "OR is null"};
	}
	if (!Array.isArray(or)) {
		return {valid: false, error: "OR is not an array"};
	}
	if (or.length === 0) {
		return {valid: false, error: "OR is empty"};
	}
	for (let filter of or) {
		let res = validateWhere(filter, loadedDatasets, datasetName);
		if (!res.valid) {
			return res;
		}
	}
	return {valid: true};
}

function checkCmp(cmp: any, loadedDatasets: string[], datasetName: string): ValidationResult {
	if (cmp == null) {
		return {valid: false, error: "GT, LT, or EQ is null"};
	}
	if (typeof cmp !== "object") {
		return {valid: false, error: "GT, LT, or EQ is not an object"};
	}
	if (Object.keys(cmp).length !== 1) {
		return {valid: false, error: "GT, LT, or EQ has more than one key"};
	}
	let key = Object.keys(cmp)[0];
	if (key.split("_").length !== 2) {
		return {valid: false, error: "GT, LT, or EQ has a key that is not a valid key"};
	}
	if (!loadedDatasets.includes(key.split("_")[0])) {
		return {valid: false, error: "GT, LT, or EQ references unloaded dataset"};

	}
	if (key.split("_")[0] !== datasetName) {
		return {valid: false, error: "GT, LT, or EQ references multiple datasets"};
	}

	let mkey = ["avg", "pass", "fail", "audit", "year"];
	if (!mkey.includes(key.split("_")[1])) {
		return {valid: false, error: "GT, LT, or EQ has a key that is not a valid key"};
	}
	if (typeof cmp[key] !== "number") {
		return {valid: false, error: "GT, LT, or EQ has a value that is not a number"};
	}
	return {valid: true};
}