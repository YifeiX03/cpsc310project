import {Dataset, Section} from "./courses";
import {QueryResult} from "./QueryTypes";
import {intersectionOfQueryResults, unionOfQueryResults} from "./SectionHelper";

export function queryWhere(where: any, dataset: Dataset): QueryResult {
	let key = where.keys[0];
	if (key === "GT" || key === "LT" || key === "EQ") {
		return queryCmp(key, where[key], dataset);
	}
	if (key === "IS") {
		let cmp = where["IS"];
		let field = cmp.keys[0].split("_")[1];
		let target = cmp[cmp.keys[0]] as string;
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
	let field = cmp.keys[0].split("_")[1];
	let target = cmp[cmp.keys[0]] as number;
	let res: Section[] = filterSectionsByField(dataset, key, field, target);
	let qres = new QueryResult();
	qres.addSectionList(res);
	return qres;
}

function filterSectionsByField(dataset: Dataset, comparison: string, fieldName: keyof Section,
							   value: number): Section[]{
	let result: Section[] = [];

	for (let course of dataset.courses) {
		for (let section of course.sections) {
			if (comparison === "GT" && section[fieldName] > value) {
				result.push(section);
			} else if (comparison === "LT" && section[fieldName] < value) {
				result.push(section);
			} else if (comparison === "EQ" && section[fieldName] === value) {
				result.push(section);
			}
		}
	}
	return result;
}

function queryIs (dataset: Dataset, fieldName: keyof Section, value: string): QueryResult{
	let result: Section[] = [];
	for (let course of dataset.courses) {
		for (let section of course.sections) {
			if (section[fieldName] === value) {
				result.push(section);
			}
		}
	}
	let qres = new QueryResult();
	qres.addSectionList(result);
	return qres;
}
