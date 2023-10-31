import {Section} from "./Courses";
// this class is designed by shibo and implemented by chatgpt with the promot written by shibo
export class QueryResult {
	public sections: Section[];
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

	public prettyPrint(): void {
		this.sections.forEach((section, index) => {
			console.log(`--- Section ${index + 1} ---`);

			if (section.avg !== -1) {
				console.log(`Avg: ${section.avg}`);
			}
			if (section.dept !== "") {
				console.log(`Dept: ${section.dept}`);
			}
			if (section.id !== "") {
				console.log(`ID: ${section.id}`);
			}
			if (section.instructor !== "") {
				console.log(`Instructor: ${section.instructor}`);
			}
			if (section.title !== "") {
				console.log(`Title: ${section.title}`);
			}
			if (section.pass !== -1) {
				console.log(`Pass: ${section.pass}`);
			}
			if (section.fail !== -1) {
				console.log(`Fail: ${section.fail}`);
			}
			if (section.audit !== -1) {
				console.log(`Audit: ${section.audit}`);
			}
			if (section.uuid !== "") {
				console.log(`UUID: ${section.uuid}`);
			}
			if (section.year !== -1) {
				console.log(`Year: ${section.year}`);
			}

			console.log("\n"); // Adding an empty line for better readability between sections
		});
	}
}
