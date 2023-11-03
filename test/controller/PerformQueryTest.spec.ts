import {Course, Dataset, Section} from "../../src/helpers/Courses";
import {requestValidator} from "../../src/helpers/RequestValidator";
import {performQueryHelper} from "../../src/helpers/PerformQueryHelper";
import {clearDisk, getContentFromArchives} from "../TestUtil";
import InsightFacade from "../../src/controller/InsightFacade";
import {InsightDatasetKind, InsightError} from "../../src/controller/IInsightFacade";
import {expect, use} from "chai";
import chaiAsPromised from "chai-as-promised";
use(chaiAsPromised);

describe("test request validator", function() {
	describe("general test", function () {
		clearDisk();
		let dataset: Dataset;
		it("should handle request ", async () => {
			let sections = getContentFromArchives("pair.zip");
			let facade = new InsightFacade();
			let a = facade.addDataset("sections", sections, InsightDatasetKind.Rooms);
			// let a = facade.listDatasets();
			return expect(a).to.eventually.be.rejectedWith("InsightError");
			/*
			let query = {
				WHERE: {
					AND: [
						{
							IS: {
								rooms_furniture: "*Tables*"
							}
						},
						{
							GT: {
								rooms_seats: 300
							}
						}
					]
				},
				OPTIONS: {
					COLUMNS: [
						"rooms_lat",
						"rooms_lon",
						"rooms_seats",
						"rooms_shortname"
					]
				}
			};
			let res = performQueryHelper(query,  facade.datasets);
			// let res = requestValidator(query,  facade.datasets);
			console.log(res);
			*/
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

