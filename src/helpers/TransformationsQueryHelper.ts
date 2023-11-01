import {Section} from "./Courses";
import {QueryResult} from "./QueryTypes";

export function queryTransformations(trans: any, result: QueryResult): object[] {
	let groupColumns = trans.GROUP;
	let groups: QueryResult[] = groupQueryResultsByProperties(result, groupColumns);
	let ret = handleApply(trans.APPLY, groups, groupColumns);
	return ret;
}

function handleApply(apply: any, groups: QueryResult[], groupColumns: string[]): any[] {
	const results: any[] = [];

	for (const group of groups) {
		const resultObj: any = {};

		for (const applyObj of apply) {
			// Get the outer key (e.g., "overallAvg")
			const outerKey = Object.keys(applyObj)[0];

			// Get the inner key (e.g., "AVG") and its value (e.g., "sections_avg")
			const innerKey = Object.keys(applyObj[outerKey])[0];
			const property = applyObj[outerKey][innerKey];

			// Compute the value based on the inner key and assign it to the result object
			switch (innerKey) {
				case "MAX":
					resultObj[outerKey] = maxOfProperty(group, property);
					break;
				case "MIN":
					resultObj[outerKey] = minOfProperty(group, property);
					break;
				case "AVG":
					resultObj[outerKey] = avgOfProperty(group, property);
					break;
				case "COUNT":
					resultObj[outerKey] = countSections(group, property);
					break;
				case "SUM":
					resultObj[outerKey] = sumOfProperty(group, property);
					break;
			}
		}
		const firstSection = group.getElements()[0] as any;
		for (let mycol of groupColumns) {
			let umy = mycol.split("_")[1];
			resultObj[umy] = firstSection[umy];
		}

		results.push(resultObj);
	}

	return results;
}
// Returns the maximum value of the specified property across all sections in the QueryResult
function maxOfProperty(queryResult: QueryResult, property: string): number {
	const actualProperty = property.split("_")[1];
	return Math.max(...queryResult.getElements().map((section) => (section as any)[actualProperty]));
}

// Returns the minimum value of the specified property across all sections in the QueryResult
function minOfProperty(queryResult: QueryResult, property: string): number {
	const actualProperty = property.split("_")[1];
	return Math.min(...queryResult.getElements().map((section) => (section as any)[actualProperty]));
}

// Returns the average value of the specified property across all sections in the QueryResult
import Decimal from "decimal.js";

function avgOfProperty(queryResult: QueryResult, property: string): number {
	const actualProperty = property.split("_")[1];
	const sections = queryResult.getElements();

	// Initialize a new Decimal for the total
	let total = new Decimal(0);

	// Sum up all the values as Decimal
	sections.forEach((section) => {
		const value = new Decimal((section as any)[actualProperty]);
		total = total.add(value);
	});

	// Calculate the average
	const average = total.toNumber() / sections.length;

	// Round the average to two decimal places and convert it back to a number
	const result = Number(average.toFixed(2));

	return result;
}


// Returns the count of sections in the QueryResult
function countSections(queryResult: QueryResult, property: string): number {
	const actualProperty = property.split("_")[1];
	const sections = queryResult.getElements();

	// Use a Set to store unique values
	const uniqueValues = new Set();

	// Iterate through the sections and add property values to the Set
	sections.forEach((section) => {
		const value = (section as any)[actualProperty];
		uniqueValues.add(value);
	});

	// The size of the Set represents the count of unique values
	return uniqueValues.size;
}


// Returns the sum of the values of the specified property across all sections in the QueryResult
function sumOfProperty(queryResult: QueryResult, property: string): number {
	const actualProperty = property.split("_")[1];
	const sections = queryResult.getElements();

	// Initialize a new Decimal for the total
	let total = new Decimal(0);

	// Sum up all the values as Decimal
	sections.forEach((section) => {
		const value = new Decimal((section as any)[actualProperty]);
		total = total.add(value);
	});

	// Round the total to two decimal places and convert it back to a number
	const result = Number(total.toFixed(2));

	return result;
}

function groupQueryResultsByProperties(queryResult: QueryResult, properties: string[]): QueryResult[] {
	const sections = queryResult.getElements();

	// A map to group sections by the unique key generated based on properties' values
	const groupedMap: Map<string, Section[]> = new Map();

	for (const section of sections) {
		// Create a unique key for each group based on the specified properties' values
		const groupKey = properties.map((property) => {
			const propertyName = property.split("_")[1];
			return (section as any)[propertyName];
		}).join("|");

		// If the key doesn't exist in the map, initialize it with an empty array
		if (!groupedMap.has(groupKey)) {
			groupedMap.set(groupKey, []);
		}

		// Push the section to the appropriate group in the map
		const group = groupedMap.get(groupKey);
		if (group) {
			group.push(section);
		}
	}

	// Convert each group in the map to a QueryResult instance
	const groupedQueryResults: QueryResult[] = [...groupedMap.values()].map((sectionList) => {
		const result = new QueryResult();
		result.addElementList(sectionList);
		return result;
	});

	return groupedQueryResults;
}


