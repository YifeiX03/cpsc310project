import {Dataset} from "./Courses";
import {ValidationResult} from "./ValidationTypes";
import {validateApply} from "./ApplyValidator";
import {validateGroup} from "./GroupyValidator";

export function validateTransformations(transformations: any, datasetName: string,
	datasets: Dataset[]): ValidationResult {
	// Check if transformations is an object
	if (typeof transformations !== "object") {
		return {valid: false, error: "Expected 'transformations' to be an object, but received a different type."};
	}

	const expectedKeys = ["GROUP", "APPLY"];
	const transformationKeys = Object.keys(transformations);

	// Check if transformations has exactly two properties called GROUP and APPLY
	if (transformationKeys.length !== 2 || !expectedKeys.every((key) => transformationKeys.includes(key))) {
		return {valid: false, error: "The 'transformations' object must have exactly two keys: 'GROUP' and 'APPLY'."};
	}

	// Validate GROUP using the validateGroup function
	const groupValidationResult = validateGroup(transformations.GROUP, datasetName, datasets);
	if (!groupValidationResult.valid) {
		return groupValidationResult;
	}

	// Validate APPLY using the validateApply function
	const applyValidationResult = validateApply(transformations.APPLY, datasetName, datasets);
	if (!applyValidationResult.valid) {
		return applyValidationResult;
	}

	return {valid: true};
}

