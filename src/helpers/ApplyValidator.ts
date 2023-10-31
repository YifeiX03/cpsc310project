import {applyToken, ValidationResult} from "./ValidationTypes";
import {Dataset} from "./Courses";
import {validateKeys} from "./DatasetHelper";

export function validateApply(apply: any, datasetName: string, datasets: Dataset[]): ValidationResult {
	if (!Array.isArray(apply)) {
		return {valid: false, error: "apply must be an array"};
	}

	for (const applyItem of apply) {
		const validationResult = validateApplyList(applyItem, datasetName, datasets);
		if (!validationResult.valid) {
			return validationResult;  // Return the error immediately if any applyItem is invalid
		}
	}

	return {valid: true};  // Return valid if all applyItems passed the validation
}

function validateApplyList(applyList: any, datasetName: string, datasets: Dataset[]): ValidationResult {
	if (typeof applyList !== "object" || applyList === null) {
		return {valid: false, error: "apply must be an object"};
	}

	const applyKeys = Object.keys(applyList);
	if (applyKeys.length !== 1) {
		return {valid: false, error: "apply must have exactly one key"};
	}

	const applyKey = applyKeys[0];
	if (applyKey.includes("_")) {
		return {valid: false, error: "apply key should not contain any '_' character"};
	}

	const applyValueValidation = validateApplyValue(applyList[applyKey], datasetName, datasets);
	if (!applyValueValidation.valid) {
		return applyValueValidation;
	}

	return {valid: true};  // Return valid if the applyList passed the validation
}


export function validateApplyValue(applyValue: any, datasetName: string, datasets: Dataset[]): ValidationResult {
	if (typeof applyValue !== "object" || applyValue === null) {
		return {valid: false, error: "apply value must be an object"};
	}

	const applyKeys = Object.keys(applyValue);
	if (applyKeys.length !== 1) {
		return {valid: false, error: "apply value must have exactly one key"};
	}

	const applyKey = applyKeys[0];
	if (!applyToken.has(applyKey)) {
		return {valid: false, error: `The apply key '${applyKey}' is not a valid apply token`};
	}

	const keyValue = applyValue[applyKey];
	if (typeof keyValue !== "string") {
		return {valid: false, error: "The value of the apply key should be a string"};
	}

	const keyValueParts = keyValue.split("_");
	if (keyValueParts.length !== 2) {
		return {valid: false, error: "The value of the apply key should contain exactly one '_' character"};
	}

	const [firstPart, secondPart] = keyValueParts;
	if (firstPart !== datasetName) {
		return {valid: false, error: `The first part of the value '${keyValue}' should be equal to the datasetName`};
	}

	const keyValidation = validateKeys(datasets, datasetName, secondPart, "mkey");
	if (!keyValidation) {
		return {valid: false, error: "Invalid key in the apply value"};
	}

	return {valid: true};
}