import {Dataset, Section} from "./Courses";
import {QueryResult} from "./QueryTypes";
import {unionOfQueryResults, intersectionOfQueryResults} from "./SectionHelper";
import {ResultTooLargeError} from "../controller/IInsightFacade";

export function performQueryHelper(query: any, datasets: Dataset[]): any[]{
	let option = processOptions(query.OPTIONS);
	const foundDataset = datasets.find((dataset) => dataset.datasetName === option.datasetName);
	let fields = option.fields;
	let middle = queryWhere(query.WHERE, foundDataset as Dataset);
	let final = sortedAndFilteredQueryResult(option.order === "" ? null : option.order, middle, fields);
	if (final.length > 5000) {
		throw new ResultTooLargeError("Too many results!");
	}
	return sortedAndFilteredQueryResult(option.order === "" ? null : option.order, middle, fields);
}

function sortedAndFilteredQueryResult(order: string | null, queryResult: QueryResult, columns: string[]): any[] {
	let sectionsCopy = [...queryResult.getResult()];

	if (order !== null) {
		let newOrder = order.split("_")[1] as string;
		sectionsCopy.sort((a, b) => {
			const aValue = (a as any)[newOrder];
			const bValue = (b as any)[newOrder];

			if (aValue > bValue) {
				return 1;
			}
			if (aValue < bValue) {
				return -1;
			}
			return 0;
		});
	}

	const prefix = order ? order.split("_")[0] + "_" : "";
	const result: any[] = [];

	for (let section of sectionsCopy) {
		let obj: any = {};
		for (let key of columns) {
			obj[prefix + key] = (section as any)[key];
		}
		result.push(obj);
	}
	return result;
}

function processOptions(options: any): any {
	let res: {datasetName: string; fields: string[]; order: string} = {datasetName: "", fields: [], order: ""};
	let columns = options.COLUMNS;
	for (let column of columns) {
		let fragment = column.split("_") as string[];
		res.fields.push(fragment[1]);
		res.datasetName = fragment[0];
	}
	if ("ORDER" in options) {
		res.order = options.ORDER;
	} else {
		res.order = "";
	}
	return res;
}

export function queryWhere(where: any, dataset: Dataset): QueryResult {
	let keys = Object.keys(where);
	let key = keys[0];

	if (key === "GT" || key === "LT" || key === "EQ") {
		return queryCmp(key, where[key], dataset);
	}

	if (key === "IS") {
		let cmp = where["IS"];
		let cmpKeys = Object.keys(cmp);
		let field = cmpKeys[0].split("_")[1];
		let target = cmp[cmpKeys[0]] as string;
		return queryIs(dataset, field, target);
	}

	return queryLogic(key, where[key], dataset);
}


function queryLogic(key: string, logic: any, dataset: Dataset): QueryResult {
	let results: QueryResult[] = [];
	for (let filter of logic) {
		let res: QueryResult = queryWhere(filter, dataset);
		results.push(res);
	}
	if (results.length === 0) {
		return new QueryResult();
	}
	let res = results[0];
	if (key === "OR") {
		for (let i = 1; i < results.length; i++) {
			res = unionOfQueryResults(res, results[i]);
		}
		return res;
	} else {
		for (let i = 1; i < results.length; i++) {
			res = intersectionOfQueryResults(res, results[i]);
		}
		return res;
	}

}

function queryCmp(key: string, cmp: any, dataset: Dataset): QueryResult {
	// Retrieve the keys of the cmp object
	let fieldKeys = Object.keys(cmp);
	let field = fieldKeys[0].split("_")[1];
	let target = cmp[fieldKeys[0]] as number;

	let res: Section[] = filterSectionsByField(dataset, key, field, target);
	let qres = new QueryResult();
	qres.addSectionList(res);
	return qres;
}

function filterSectionsByField(dataset: Dataset, comparison: string, fieldName: string,
	value: number): Section[]{
	let result: Section[] = [];

	for (let course of dataset.courses) {
		for (let section of course.sections) {
			if (comparison === "GT" && (section as any)[fieldName] > value) {
				result.push(section);
			} else if (comparison === "LT" && (section as any)[fieldName] < value) {
				result.push(section);
			} else if (comparison === "EQ" && (section as any)[fieldName] === value) {
				result.push(section);
			}
		}
	}
	return result;
}

function queryIs(dataset: Dataset, fieldName: string, value: string): QueryResult {
	let result: Section[] = [];
	const isWildcardStart = value.startsWith("*");
	const isWildcardEnd = value.endsWith("*");
	const trimmedValue = value.replace(/^\*|\*$/g, ""); // remove asterisks at the start and end

	for (let course of dataset.courses) {
		for (let section of course.sections) {
			const sectionValue = (section as any)[fieldName];

			// Check based on wildcard conditions
			if (isWildcardStart && isWildcardEnd && sectionValue.includes(trimmedValue)) {
				result.push(section);
			} else if (isWildcardStart && sectionValue.endsWith(trimmedValue)) {
				result.push(section);
			} else if (isWildcardEnd && sectionValue.startsWith(trimmedValue)) {
				result.push(section);
			} else if (!isWildcardStart && !isWildcardEnd && sectionValue === value) {
				result.push(section);
			}
		}
	}

	let qres = new QueryResult();
	qres.addSectionList(result);
	return qres;
}


