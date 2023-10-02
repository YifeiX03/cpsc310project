import {
	Dataset,
	Course,
	Section
} from "./courses";
import * as JSZip from "jszip";
import {getContentFromArchives} from "../../test/TestUtil";

interface FileSection {
	Avg: number,
	Subject: string,
	Course: string,
	Professor: string,
	Title: string,
	Pass: number,
	Fail: number,
	Audit: number,
	id: string,
	Year: number
}

let secProps = ["Avg", "Subject", "Course", "Professor", "Title", "Pass", "Fail", "Audit", "id", "Year"];

// parses and validates a serialized zip and turns it into a dataset
// returns Dataset
// Partially uses code from
// https://stackoverflow.com/questions/39322964/extracting-zipped-files-using-jszip-in-javascript
export async function parseZip(id: string, dataZip: string): Promise<Dataset> {
	let buffer = Buffer.from(dataZip, "base64");
	let dataset = new Dataset(id);
 	let zip = await JSZip.loadAsync(buffer);
	let courses: any = zip.folder("courses");
	errorCheck(courses === null, "No folder named courses found");
	// check if courses folder is empty
	errorCheck(Object.keys(courses.files).length === 0, "Nothing found in courses folder");
	for (let fileName of Object.keys(courses.files)) {
		let course = new Course(fileName);
		// eslint-disable-next-line no-await-in-loop
		let data: string = await courses.files[fileName].async("string");
		let courseObj = JSON.parse(data);
		// check if result is in courses
		errorCheck(!("result" in courseObj), "No results in section");
		// check if results is actually an array first
		errorCheck(!Array.isArray(courseObj.result), "Results in section not an array");
		courseObj.result.forEach((sec: FileSection) => {
			// check if the results actually have all these keys
			let hasAllKeys = true;
			secProps.forEach((property) => {
				if (!Object.hasOwn(sec, property)) {
					hasAllKeys = false;
				}
			});
			if (hasAllKeys) {
				let section = new Section(
					sec.Avg,
					sec.Subject,
					sec.Course,
					sec.Professor,
					sec.Title,
					sec.Pass,
					sec.Fail,
					sec.Audit,
					sec.id,
					sec.Year
				);
				course.addSection(section);
			}
		});
		if (course.sections.length !== 0) {
			dataset.addCourse(course);
		}
	}
	errorCheck(dataset.courses.length === 0, "No valid sections");
	return dataset;
}

function errorCheck (input: boolean, message: string) {
	if (input) {
		throw new Error(message);
	}
}
