import {Section} from "./Courses";
import {QueryResult} from "./QueryTypes";

export function areSectionsEqual(section1: Section, section2: Section): boolean {
	return section1.avg === section2.avg &&
		section1.dept === section2.dept &&
		section1.id === section2.id &&
		section1.instructor === section2.instructor &&
		section1.title === section2.title &&
		section1.pass === section2.pass &&
		section1.fail === section2.fail &&
		section1.audit === section2.audit &&
		section1.uuid === section2.uuid &&
		section1.year === section2.year;
}

export function unionOfQueryResults(res1: QueryResult, res2: QueryResult): QueryResult {
	const unionResult = new QueryResult();
	const allSections = [...res1.getResult(), ...res2.getResult()];
	for (const section of allSections) {
		if (!unionResult.hasSection(section)) {
			unionResult.addSection(section);
		}
	}
	return unionResult;
}

export function intersectionOfQueryResults(res1: QueryResult, res2: QueryResult): QueryResult {
	const intersectionResult = new QueryResult();
	for (const section1 of res1.getResult()) {
		if (res2.getResult().some((section2) => areSectionsEqual(section1, section2))) {
			intersectionResult.addSection(section1);
		}
	}
	return intersectionResult;
}