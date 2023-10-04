import * as fs from "fs";
import * as path from "path";
import {Course, Dataset, Section} from "../../src/helpers/courses";
import {ValidationResult} from "../../src/helpers/ValidationTypes";
import {requestValidator} from "../../src/helpers/RequestValidator";
import {expect} from "chai";
import {performQueryHelper} from "../../src/helpers/PerformQueryHelper";


export function createDatasetFromFolder(folderPath: string, datasetName: string): Dataset {
	const dataset = new Dataset(datasetName);

	// Read all files in the directory
	const files = fs.readdirSync(folderPath);

	for (const file of files) {
		const filePath = path.join(folderPath, file);
		const fileContent = fs.readFileSync(filePath, "utf-8");

		// Parse JSON content
		let jsonData;
		try {
			jsonData = JSON.parse(fileContent);
		} catch (error) {
			console.error(`Failed to parse content of ${file} as JSON. Skipping this file.`);
			continue; // Skip to the next file if the current one isn't a valid JSON
		}
		const result = jsonData.result || [];

		const courseName = path.basename(file); // No extension removal needed

		// Extracting department from the filename
		const deptMatch = courseName.match(/[A-Za-z]+/);
		const dept = (deptMatch && deptMatch[0].toLowerCase()) || "unknown";

		const course = new Course(courseName);

		for (const entry of result) {
			// Create a new Section instance for each entry in the result array using the mapped properties
			const section = new Section(
				entry.Avg,
				dept,
				entry.Course,          // Using "id" for "uuid"
				entry.Professor,   // Mapping "Professor" to "instructor"
				entry.Title,       // Title remains "Title"
				entry.Pass,        // Pass remains "Pass"
				entry.Fail,        // Fail remains "Fail"
				entry.Audit,       // Audit remains "Audit"
				entry.id,
				entry.Year         // Year remains "Year"
			);
			course.addSection(section);
		}

		dataset.addCourse(course);
	}

	return dataset;
}

describe("test request validator", function() {
	describe("general test", function () {
		let dataset: Dataset;

		before(function() {
			const folderPath = "test/courses";
			dataset = createDatasetFromFolder(folderPath, "sections");
		});

		it("should handle request ", () => {
			let datasets = [dataset];
			let query  = {
				WHERE: {
					AND: [
						{GT: {
							sections_avg: 92
						}},
						{
							IS: {
								sections_dept: "cp*"
							}
						}
					]
				},
				OPTIONS: {
					COLUMNS: [
						"sections_dept",
						"sections_avg"
					],
					ORDER: "sections_avg"
				}
			};
			// console.log(requestValidator(query, ["sections"]));
			let res = performQueryHelper(query, datasets);
			console.log(res);
		});

	});
});

