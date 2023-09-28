import {Section} from "./Courses";

export class QueryResult {
	private sections: Section[];
	constructor() {
		this.sections = [];
	}
	public addSection(section: Section): void {
		this.sections.push(section);
	}
	public hasSection(section: Section): boolean {
		return this.sections.includes(section);
	}
	public getResult(): Section[] {
		return this.sections;
	}
	public addSectionList(sectionList: Section[]): void {
		this.sections.push(...sectionList);
	}
}
