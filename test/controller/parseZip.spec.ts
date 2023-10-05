import {expect} from "chai";
import {parseZip} from "../../src/helpers/ParseZip";
import {getContentFromArchives} from "../TestUtil";
import * as JSZip from "jszip";
import {Course, Dataset, Section} from "../../src/helpers/Courses";
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
/*
describe("test parseZip 2", async function() {
	let buffer = Buffer.from(getContentFromArchives("pair-small.zip"), "base64");
	let zip = await JSZip.loadAsync(buffer);
	let courses: any = zip.folder("courses");
	// let a = 0;
	for (const fileName of Object.keys(courses.files)) {
		let data = await courses.files[fileName].async("String");
		let courseObj = JSON.parse(data);
		let i = 2;
		for (const sec of courseObj.result) {
			fs.writeFileSync("./data/section" + i + ".txt", "");
			fs.appendFileSync("./data/section" + i + ".txt", JSON.stringify(sec.Avg) + "\n");
			fs.appendFileSync("./data/section" + i + ".txt", JSON.stringify(sec.Subject) + "\n");
			fs.appendFileSync("./data/section" + i + ".txt", JSON.stringify(sec.Course) + "\n");
			fs.appendFileSync("./data/section" + i + ".txt", JSON.stringify(sec.Professor) + "\n");
			fs.appendFileSync("./data/section" + i + ".txt", JSON.stringify(sec.Title) + "\n");
			fs.appendFileSync("./data/section" + i + ".txt", JSON.stringify(sec.Pass) + "\n");
			fs.appendFileSync("./data/section" + i + ".txt", JSON.stringify(sec.Fail) + "\n");
			fs.appendFileSync("./data/section" + i + ".txt", JSON.stringify(sec.Audit) + "\n");
			fs.appendFileSync("./data/section" + i + ".txt", JSON.stringify(sec.id) + "\n");
			fs.appendFileSync("./data/section" + i + ".txt", JSON.stringify(sec.Year) + "\n");
			// for (const property of Object.keys(sec)) {
			// 	fs.appendFileSync(
			// 		"./data/section" + i + ".txt",
			// 		property + " : " + JSON.stringify(sec[property]) + "\n");
			// }
			i++;
			// a++;
		}
	}
	// fs.writeFileSync("./data/help.txt", a.toString());
});*/


describe ("ParseZip", async function () {
	let dataset = await parseZip("sections", getContentFromArchives("pair-small-2.zip"));
	const {...object} = dataset;
	fs.writeFileSync("./data/test1.json", JSON.stringify(object));
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
