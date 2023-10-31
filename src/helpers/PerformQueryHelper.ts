import {Dataset, Section} from "./Courses";
import {QueryResult} from "./QueryTypes";
import {differenceOfQueryResults, intersectionOfQueryResults, unionOfQueryResults} from "./SectionHelper";
import {InsightDatasetKind, ResultTooLargeError} from "../controller/IInsightFacade";
import {roomSfields, sfields} from "./ValidationTypes";
import {queryTransformations} from "./TransformationsQueryHelper";
import {extractDatasetName} from "./DatasetHelper";

export function datasetToArray(dataset: Dataset, res: QueryResult) {
	for (let building of dataset.buildings) {
		for (let room of building.rooms) {
			let roomObj = {
				fullname: building.fullname,
				shortname: building.shortname,
				number: room.number,
				name: room.name,
				address: building.address,
				lat: building.lat,
				lon: building.lon,
				seats: room.seats,
				type: room.type,
				furniture: room.furniture,
				href: room.href
			};
			res.addElement(roomObj);
		}
	}
	return res;
}
export function performQueryHelper(query: any, datasets: Dataset[]): any[]{
	let option = processOptions(query);
	const foundDataset = datasets.find((dataset) => dataset.datasetName === option.datasetName);
	let fields = option.fields;
	let result = new QueryResult();
	if (foundDataset?.type === InsightDatasetKind.Sections) {
		for (let course of (foundDataset as Dataset).courses) {
			result.addElementList(course.sections);
		}
	} else {
		datasetToArray(foundDataset as Dataset, result);
	}
	let middle = queryWhere(query.WHERE, result);
	let notFinalYet: object[] = [];
	if ("TRANSFORMATIONS" in query) {
		notFinalYet = queryTransformations(query.TRANSFORMATIONS, middle);
	}
	let final = sortedAndFilteredQueryResult(foundDataset?.datasetName as string,
		query.OPTIONS.ORDER, notFinalYet.length === 0 ? [...middle.getElements()] :
			notFinalYet, fields, option.fields2);
	if (final.length > 5000) {
		throw new ResultTooLargeError("Too many results!");
	}
	return final;
}

/*
function sortedAndFilteredQueryResult(prefix: string, order: any, sectionsCopy: any[],
	columns: string[], fields2: []): any[] {
	if (order !== undefined && typeof order !== "object") {
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
	} else if (order !== undefined && typeof order === "object") {
		sectionsCopy.sort((a, b) => {
			for (let key of order.keys) {
				let newKey = key;
				// Split the key only if it contains "_"
				if (key.includes("_")) {
					newKey = key.split("_")[1];
				}
				const aValue = (a as any)[newKey];
				const bValue = (b as any)[newKey];

				// Compare values based on direction
				if (aValue !== bValue) {
					if (order.dir === "UP") {
						return aValue < bValue ? -1 : 1;
					} else {
						return aValue > bValue ? -1 : 1;
					}
				}
			}
			return 0;
		});
	}

	const result: any[] = [];
	for (let section of sectionsCopy) {
		let obj: any = {};
		for (let key of fields2) {
			let fragment = (key as string).split("_");
			if (sfields.has(key) || roomSfields.has(key)) {
				obj[key] = "" + (section as any)[fragment.length === 2 ? fragment[1] : fragment[0]];
			} else {
				obj[key] = (section as any)[fragment.length === 2 ? fragment[1] : fragment[0]];
			}
		}
		result.push(obj);
	}

	return result;
}

 */


function sortByString(sectionsCopy: any[], order: string): any[] {
	const curtis = order.split("_");
	let newOrder: string;
	if (curtis.length === 1) {
		newOrder = curtis[0];
	} else {
		newOrder = curtis[1];
	}
	return sectionsCopy.sort((a, b) => compareValues(a[newOrder], b[newOrder]));
}

function sortByObject(sectionsCopy: any[], order: {keys: string[], dir: string}): any[] {
	return sectionsCopy.sort((a, b) => {
		for (let key of order.keys) {
			const newKey = key.includes("_") ? key.split("_")[1] : key;
			const compareResult = compareValues(a[newKey], b[newKey], order.dir);
			if (compareResult !== 0) {
				return compareResult;
			}
		}
		return 0;
	});
}

function compareValues(aValue: any, bValue: any, dir: string = "UP"): number {
	if (aValue > bValue) {
		return dir === "UP" ? 1 : -1;
	}
	if (aValue < bValue) {
		return dir === "UP" ? -1 : 1;
	}
	return 0;
}

function transformAndFormatData(sectionsCopy: any[], fields2: string[]): any[] {
	const result: any[] = [];
	for (let section of sectionsCopy) {
		let obj: any = {};
		for (let key of fields2) {
			let fragment = key.split("_");
			const sectionKey = fragment.length === 2 ? fragment[1] : fragment[0];
			obj[key] = (sfields.has(key) || roomSfields.has(key)) ?
				String(section[sectionKey]) :
				section[sectionKey];
		}
		result.push(obj);
	}
	return result;
}


function sortedAndFilteredQueryResult(
	prefix: string,
	order: any,
	sectionsCopy: any[],
	columns: string[],
	fields2: string[]
): any[] {
	if (order !== undefined) {
		if (typeof order !== "object") {
			sectionsCopy = sortByString(sectionsCopy, order);
		} else {
			sectionsCopy = sortByObject(sectionsCopy, order);
		}
	}

	return transformAndFormatData(sectionsCopy, fields2);
}


function processOptions(options: any): any {
	let res: {datasetName: string; fields: string[]; fields2: string[];
		order: string} = {datasetName: "", fields: [], fields2:[], order: ""};
	let columns = options.OPTIONS.COLUMNS;
	res.datasetName = extractDatasetName(options) as string;
	for (let column of columns) {
		let fragment = column.split("_") as string[];
		if (fragment.length === 2) {
			res.fields.push(fragment[1]);
			res.fields2.push(column);
		} else {
			res.fields.push(fragment[0]);
			res.fields2.push(fragment[0]);
		}
	}
	return res;
}
export function queryWhere(where: any, myres: QueryResult): QueryResult {
	let keys = Object.keys(where);
	let key = keys[0];

	if (Object.keys(where).length === 0) {
		return myres;
	}
	if (key === "GT" || key === "LT" || key === "EQ") {
		return queryCmp(key, where[key], myres);
	}
	if (key === "IS") {
		let cmp = where["IS"];
		let cmpKeys = Object.keys(cmp);
		let field = cmpKeys[0].split("_")[1];
		let target = cmp[cmpKeys[0]] as string;
		return queryIs(myres, field, target);
	}
	if (key === "NOT") {
		let result = new QueryResult();
		result.addElementList(myres.getElements());
		return differenceOfQueryResults(result, queryWhere(where.NOT, myres));
	}
	return queryLogic(key, where[key], myres);
}
function queryLogic(key: string, logic: any, myres: QueryResult): QueryResult {
	let results: QueryResult[] = [];

	for (let filter of logic) {
		let res: QueryResult = queryWhere(filter, myres);
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
function queryCmp(key: string, cmp: any, myres: QueryResult): QueryResult {
	// Retrieve the keys of the cmp object
	let fieldKeys = Object.keys(cmp);
	let field = fieldKeys[0].split("_")[1];
	let target = cmp[fieldKeys[0]] as number;

	let res: Section[] = filterSectionsByField(myres, key, field, target);
	let qres = new QueryResult();
	qres.addElementList(res);
	return qres;
}

function filterSectionsByField(myres: QueryResult, comparison: string, fieldName: string,
	value: number): Section[]{
	let result: Section[] = [];
	for (let section of myres.getElements()) {
		let a = (section as any)[fieldName];
		if (comparison === "GT" && (section as any)[fieldName] > value) {
			result.push(section);
		} else if (comparison === "LT" && (section as any)[fieldName] < value) {
			result.push(section);
		} else if (comparison === "EQ" && (section as any)[fieldName] === value) {
			result.push(section);
		}
	}
	return result;
}
function queryIs(myres: QueryResult, fieldName: string, value: string): QueryResult {
	let result: any[] = [];
	const isWildcardStart = value.startsWith("*");
	const isWildcardEnd = value.endsWith("*");
	const trimmedValue = value.replace(/^\*|\*$/g, ""); // remove asterisks at the start and end
	// the wild card is implemented by chatgpt, by the prompt written by shibo
	for (let section of myres.getElements()) {
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
	let qres = new QueryResult();
	qres.addElementList(result);
	return qres;
}
