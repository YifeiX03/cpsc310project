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
					resultObj[outerKey] = countSections(group);
					break;
				case "SUM":
					resultObj[outerKey] = sumOfProperty(group, property);
					break;
			}
			const firstSection = group.getResult()[0] as any;

			for (let mycol of groupColumns) {
				let umy = mycol.split("_")[1];
				resultObj[umy] = firstSection[umy];
			}

		}

		results.push(resultObj);
	}

	return results;
}
// Returns the maximum value of the specified property across all sections in the QueryResult
function maxOfProperty(queryResult: QueryResult, property: string): number {
	const actualProperty = property.split("_")[1];
	return Math.max(...queryResult.getResult().map((section) => (section as any)[actualProperty]));
}

// Returns the minimum value of the specified property across all sections in the QueryResult
function minOfProperty(queryResult: QueryResult, property: string): number {
	const actualProperty = property.split("_")[1];
	return Math.min(...queryResult.getResult().map((section) => (section as any)[actualProperty]));
}

// Returns the average value of the specified property across all sections in the QueryResult
function avgOfProperty(queryResult: QueryResult, property: string): number {
	const actualProperty = property.split("_")[1];
	const sections = queryResult.getResult();
	const total = sections.reduce((sum, section) => sum + (section as any)[actualProperty], 0);
	return total / sections.length;
}

// Returns the count of sections in the QueryResult
function countSections(queryResult: QueryResult): number {
	return queryResult.getResult().length;
}

// Returns the sum of the values of the specified property across all sections in the QueryResult
function sumOfProperty(queryResult: QueryResult, property: string): number {
	const actualProperty = property.split("_")[1];
	return queryResult.getResult().reduce((sum, section) => sum + (section as any)[actualProperty], 0);
}

function groupQueryResultsByProperties(queryResult: QueryResult, properties: string[]): QueryResult[] {
	const sections = queryResult.getResult();

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
		result.addSectionList(sectionList);
		return result;
	});

	return groupedQueryResults;
}


