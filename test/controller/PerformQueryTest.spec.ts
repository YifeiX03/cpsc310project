import {Course, Dataset, Section} from "../../src/helpers/Courses";
import {requestValidator} from "../../src/helpers/RequestValidator";
import {performQueryHelper} from "../../src/helpers/PerformQueryHelper";
import {clearDisk, getContentFromArchives} from "../TestUtil";
import InsightFacade from "../../src/controller/InsightFacade";
import {InsightDatasetKind} from "../../src/controller/IInsightFacade";

describe("test request validator", function() {
	describe("general test", function () {
		clearDisk();
		let dataset: Dataset;
		it("should handle request ", async () => {
			let sections = getContentFromArchives("pair.zip");
			let facade = new InsightFacade();
			await facade.addDataset("sections", sections, InsightDatasetKind.Sections);
			let a = await facade.listDatasets();
			let query = {
				WHERE: {},
				OPTIONS: {
					COLUMNS: [
						"sections_title",
						"sections_dept",
						"overallAvg"
					]
				},
				TRANSFORMATIONS: {
					GROUP: [
						"sections_title",
						"sections_dept"
					],
					APPLY: [
						{
							overallAvg: {
								AVG: "sections_avg"
							}
						}
					]
				}
			};
			let res = performQueryHelper(query,  facade.datasets);
			// let res = requestValidator(query,  facade.datasets);
			console.log(res);
		});

	});
});

describe("test request validator 2", function() {
	describe("general test 2", function () {
		clearDisk();
		let dataset: Dataset;
		it("should handle request 2", async () => {
			let sections = getContentFromArchives("pair.zip");
			let facade = new InsightFacade();
			await facade.addDataset("sections", sections, InsightDatasetKind.Sections);
			let query = {
				WHERE: {},
				OPTIONS: {
					COLUMNS: [
						"sections_title"
					]
				},
				TRANSFORMATIONS: {
					GROUP: [
						"sections_title"
					],
					APPLY: []
				}
			};
			let res = requestValidator(query, facade.datasets);
			console.log(res);
		});

	});
});

