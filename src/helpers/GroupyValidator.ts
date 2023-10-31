import {mfields, roomMfields, roomSfields, sfields, ValidationResult} from "./ValidationTypes";
import {getDatasetType, validateKeys} from "./DatasetHelper";
import {Dataset} from "./Courses";

export function validateGroup(group: any, datasetName: string, datasets: Dataset[]): ValidationResult {
	// Check if group is a non-empty array
	if (!Array.isArray(group) || group.length === 0) {
		return {valid: false, error: "group must be an array"};
	}

	// Check if all members of group are strings and have valid keys
	for (const item of group) {
		if (typeof item !== "string") {
			return {valid: false, error: "All members of group must be strings"};
		}

		const parts = item.split("_");
		if (parts.length !== 2) {
			return {valid: false, error: "Each member must have exactly one '_' character"};
		}

		// Split the part before and after '_'
		const [firstPart, secondPart] = parts;

		// Check if the first part equals the dataset
		if (firstPart !== datasetName) {
			return {valid: false, error: `The first part of the member '${item}' must be equal to the dataset`};
		}

		// Use the helper function to validate the keys
		if (!validateKeys(datasets, datasetName, secondPart, "both")) {
			return {valid: false, error: `The key '${item}' is not valid for the '${datasetName}' dataset`};
		}
	}
	return {valid: true};
}

