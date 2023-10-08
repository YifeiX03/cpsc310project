import {
	Dataset,
	Course,
	Section
} from "./Courses";
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
// work from chatgpt, it refactor the existing code
export async function parseZip(id: string, dataZip: string): Promise<Dataset> {
	let buffer = Buffer.from(dataZip, "base64");
	let dataset = new Dataset(id);
	let zip = await JSZip.loadAsync(buffer);
	let hasCourses = false;
	// check if courses folder is empty, might be redundant
	errorCheck(Object.keys(zip.files).length === 0, "Nothing found in courses folder");
	const promises = Object.keys(zip.files).map(async (fileName) => {
		if (!fileName.startsWith("courses/")) {
			return null;
		}
		hasCourses = true;
		let course = new Course(fileName.replace("courses/", ""));
		let data = await zip.files[fileName].async("string");
		if (data === "") {
			return null; // Skipping the file, returning null to filter it out later
		}
		let courseObj;
		try {
			courseObj = JSON.parse(data);
		} catch (e) {
			return null; // Invalid JSON, skipping the file
		}
		// check if result is in courses
		errorCheck(!("result" in courseObj), "No results in section");
		// check if results is actually an array first
		errorCheck(!Array.isArray(courseObj.result), "Results in section not an array");

		for (const sec of courseObj.result) {
			let hasAllKeys = secProps.every((property) => Object.hasOwn(sec, property));

			if (hasAllKeys) {
				let section = new Section(
					sec.Avg, sec.Subject, sec.Course, sec.Professor, sec.Title,
					sec.Pass, sec.Fail, sec.Audit, String(sec.id), Number(sec.Year)
				);
				course.addSection(section);
			}
		}

		if (course.sections.length !== 0) {
			return course;
		} else {
			return null;
		}
	});

	const validCourses = await Promise.all(promises);
	validCourses.filter((course) => course !== null).forEach((course) => dataset.addCourse(course as Course));

	errorCheck(dataset.courses.length === 0, "No valid sections");
	return dataset;
}

function errorCheck (input: boolean, message: string) {
	if (input) {
		throw new Error(message);
	}
}
