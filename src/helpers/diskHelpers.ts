import * as fs from "fs-extra";
import {
	Dataset,
	Course,
	Section
} from "./courses";
import InsightFacade from "../controller/InsightFacade";

const persistDir = "./data";

export function toDisk(dataset: Dataset): void {
	let courses: object[] = [];
	dataset.courses.forEach((course) => {
		let sections: object[] = [];
		course.sections.forEach((section) => {
			const sectionObj = {
				avg: section.avg,
				dept: section.dept,
				id: section.id,
				instructor: section.instructor,
				title: section.title,
				pass: section.pass,
				fail: section.fail,
				audit: section.audit,
				uuid: section.uuid,
				year: section.year
			};
			sections.push(sectionObj);
		});
		const courseObj = {
			courseName: course.courseName,
			sections: sections
		};
		courses.push(courseObj);
	});

	const dsObj = {
		datasetName: dataset.datasetName,
		courses: courses
	};
	// TODO: parse object as json (or string?)
	// TODO: write json/string(?) to disk
	return;
}

export function fromDisk(insightFacade: InsightFacade): void {
	return;
}

export function removeDisk(name: string): void {
	return;
}
