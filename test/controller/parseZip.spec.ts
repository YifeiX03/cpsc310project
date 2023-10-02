import {expect} from "chai";
import {parseZip} from "../../src/helpers/parseZip";
import {getContentFromArchives} from "../TestUtil";
import * as JSZip from "jszip";
import {Course, Dataset, Section} from "../../src/helpers/courses";
import * as fs from "fs-extra";

// This is purely for testing how the jszip and fs modules work
describe("test parseZip", async function() {
	let buf = Buffer.from(getContentFromArchives("pair-small.zip"), "base64");
	await JSZip.loadAsync(buf).then( (zip) => {
		let courses: any = zip.folder("courses");
		if (courses === null) {
			return new Error("No file named courses found");
		}
		// check if courses folder is empty
		Object.keys(courses.files).forEach(async function (fileName) {
			let course = new Course(fileName);
			let data: string = await courses.files[fileName].async("string");
			let courseObj = JSON.parse(data);
			if (!("result" in courseObj)) {
				return new Error("No results in section");
			}
			// check if results is actually an array first?
			let i = 0;
			courseObj.result.forEach((sec: object) => {
				fs.writeFileSync("./data/section" + i + ".txt", JSON.stringify(sec));
				i++;
			});
		});
	});
});

describe ("ParseZip", async function () {
	let dataset = await parseZip("sections", getContentFromArchives("pair-small.zip"));
	const {...object} = dataset;
	fs.writeFileSync("./data/test.txt", JSON.stringify(object));
});

describe ("dataset", function () {
	let dataset = new Dataset("testing dataset");
	let course = new Course("testing course");
	let section = new Section(
		100,
		"dept",
		"id",
		"instructor",
		"title",
		100,
		100,
		100,
		"uuid",
		100);
	course.addSection(section);
	dataset.addCourse(course);
	const {...object} = dataset;
	fs.writeFileSync("./data/datasetTest.txt", JSON.stringify(object));
});
