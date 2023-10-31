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
			let sections = getContentFromArchives("campus.zip");
			let facade = new InsightFacade();
			await facade.addDataset("rooms", sections, InsightDatasetKind.Rooms);
			let a = await facade.listDatasets();
			let query = {
				WHERE: {
					NOT: {
						NOT: {
							AND: [{
								IS: {
									rooms_furniture: "*Tables*"
								}
							}, {
								GT: {
									rooms_seats: 300
								}
							}]
						}}},
				OPTIONS: {
					COLUMNS: [
						"rooms_shortname",
						"maxSeats"
					],
					ORDER: {
						dir: "DOWN",
						keys: ["maxSeats"]
					}
				},
				TRANSFORMATIONS: {
					GROUP: ["rooms_shortname"],
					APPLY: [{
						maxSeats: {
							MAX: "rooms_seats"
						}
					}]
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
						"sections_title",
						"aaa"
					],
					ORDER: {
						dir: "DOWN",
						keys: [
							"aaa"
						]
					}
				},
				TRANSFORMATIONS: {
					GROUP: [
						"sections_title"
					],
					APPLY: [
						{
							aaa: {
								AVG: "sections_avg"
							}
						},
						{
							aaa: {
								AVG: "sections_avg"
							}
						}
					]
				}
			};
			let res = requestValidator(query, facade.datasets);
			console.log(res);
		});

	});
});

