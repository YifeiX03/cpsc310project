import {
	IInsightFacade,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError,
	ResultTooLargeError,
} from "../../src/controller/IInsightFacade";
import InsightFacade from "../../src/controller/InsightFacade";

import {folderTest} from "@ubccpsc310/folder-test";
import {expect, use} from "chai";
import chaiAsPromised from "chai-as-promised";
import {clearDisk, getContentFromArchives} from "../TestUtil";

use(chaiAsPromised);

describe("InsightFacade", function () {
	let facade: IInsightFacade;

	// Declare datasets used in tests. You should add more datasets like this!
	let sections: string;
	let smallSec: string;
	let inval1Sec: string;
	let inval2Sec: string;
	let inval3Sec: string;

	before(function () {
		// This block runs once and loads the datasets.
		sections = getContentFromArchives("pair.zip");
		smallSec = getContentFromArchives("pair-small.zip");
		// sections = getContentFromArchives("pair-small.zip");
		inval1Sec = getContentFromArchives("pair-inval1.zip");
		inval2Sec = getContentFromArchives("pair-inval2.zip");
		inval3Sec = getContentFromArchives("pair-inval3.zip");


		// Just in case there is anything hanging around from a previous run of the test suite
		clearDisk();
	});

	describe("Add/Remove/List Dataset", function () {
		before(function () {
			console.info(`Before: ${this.test?.parent?.title}`);
		});

		beforeEach(function () {
			// This section resets the insightFacade instance
			// This runs before each test
			console.info(`BeforeTest: ${this.currentTest?.title}`);
			facade = new InsightFacade();
		});

		after(function () {
			console.info(`After: ${this.test?.parent?.title}`);
		});

		afterEach(function () {
			// This section resets the data directory (removing any cached data)
			// This runs after each test, which should make each test independent of the previous one
			console.info(`AfterTest: ${this.currentTest?.title}`);
			clearDisk();
		});

		// This is a unit test. You should create more like this!
		it("should reject with  an empty dataset id", function () {
			const result = facade.addDataset("", smallSec, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it ("should reject with an empty dataset id (1.1)", function() {
			const result = facade.addDataset("", smallSec, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it ("should reject with an empty dataset id (1.2)", function() {
			const result = facade.addDataset("   ", smallSec, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it ("should reject with an empty dataset id (1.3)", function() {
			const result = facade.addDataset("UBC_Sections", smallSec, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it ("should reject with an empty dataset id (1.4)", function() {
			const result = facade.addDataset("UBC", inval1Sec, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it ("should reject with an empty dataset id (1.5)", function() {
			const result = facade.addDataset("UBC", inval2Sec, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it ("should reject with an empty dataset id (1.6)", function() {
			const result = facade.addDataset("UBC", inval3Sec, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it ("should successfully add a dataset (2.1)", function() {
			const result = facade.addDataset("ubc", smallSec, InsightDatasetKind.Sections);
			return expect(result).to.eventually.have.members(["ubc"]);
		});

		it ("should unsuccessfully add a dataset (2.2)", async function() {
			await facade.addDataset("ubc", smallSec, InsightDatasetKind.Sections);
			const result = facade.addDataset("ubc", smallSec, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it ("should successfully add a dataset (2.3)", async function() {
			await facade.addDataset("ubc", smallSec, InsightDatasetKind.Sections);
			const result = facade.addDataset("ubc1", smallSec, InsightDatasetKind.Sections);
			return expect(result).to.eventually.have.deep.members(["ubc", "ubc1"]);
		});

		it ("should unsuccessfully remove a dataset (3.1)", function() {
			const result = facade.removeDataset("ubc");
			return expect(result).to.eventually.be.rejectedWith(NotFoundError);
		});

		it ("should successfully add a dataset (3.2)", function() {
			const result = facade.addDataset("ubc", smallSec, InsightDatasetKind.Sections);
			return expect(result).to.eventually.have.members(["ubc"]);
		});

		it ("should unsuccessfully remove a dataset (3.3)", function() {
			const result = facade.removeDataset("ub_c");
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it ("should unsuccessfully remove a dataset (3.3.5)", function() {
			const result = facade.removeDataset("  ");
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it ("should successfully remove a dataset (3.4)", async function() {
			await facade.addDataset("ubc", smallSec, InsightDatasetKind.Sections);
			const result = facade.removeDataset("ubc");
			return expect(result).to.eventually.equal("ubc");
		});

		it ("should successfully remove a dataset from two (3.5)", async function() {
			await facade.addDataset("ubc1", smallSec, InsightDatasetKind.Sections);
			await facade.addDataset("ubc2", smallSec, InsightDatasetKind.Sections);
			const result = facade.removeDataset("ubc1");
			return expect(result).to.eventually.equal("ubc1");
		});

		it ("should successfully remove a dataset from two (3.5.1)", async function() {
			await facade.addDataset("ubc1", smallSec, InsightDatasetKind.Sections);
			await facade.addDataset("ubc2", smallSec, InsightDatasetKind.Sections);
			await facade.removeDataset("ubc1");
			const result = facade.addDataset("ubc3", smallSec, InsightDatasetKind.Sections);
			return expect(result).to.eventually.have.deep.members(["ubc2", "ubc3"]);
		});

		it ("should unsuccessfully remove a dataset (3.6)", async function() {
			await facade.addDataset("ubc", smallSec, InsightDatasetKind.Sections);
			const result = facade.removeDataset("sections");
			return expect(result).to.eventually.be.rejectedWith(NotFoundError);
		});

		it ("should successfully add a dataset (3.7)", async function() {
			await facade.addDataset("ubc", smallSec, InsightDatasetKind.Sections);
			await facade.removeDataset("ubc");
			const result = facade.addDataset("ubc", smallSec, InsightDatasetKind.Sections);
			return expect(result).to.eventually.have.members(["ubc"]);
		});

		it ("should successfully return empty list of datasets (5.1)", function() {
			const result = facade.listDatasets();
			return expect(result).to.eventually.be.an("array").that.is.empty;
		});

		it ("should successfully return an array of datasets (5.2)", async function() {
			await facade.addDataset("ubc", smallSec, InsightDatasetKind.Sections);
			const result = facade.listDatasets();
			return expect(result).to.eventually.have.deep.members([
				{
					id: "ubc",
					kind: InsightDatasetKind.Sections,
					numRows: 2
				}
			]);
		});

		it ("should successfully return an array of datasets (5.3)", async function() {
			await facade.addDataset("ubc", smallSec, InsightDatasetKind.Sections);
			await facade.addDataset("ubc2", smallSec, InsightDatasetKind.Sections);
			const result = facade.listDatasets();
			return expect(result).to.eventually.have.deep.members([
				{
					id: "ubc",
					kind: InsightDatasetKind.Sections,
					numRows: 2
				},
				{
					id: "ubc2",
					kind: InsightDatasetKind.Sections,
					numRows: 2
				}
			]);
		});

		it ("should successfully return an array of datasets (5.4)", async function() {
			await facade.addDataset("ubc", smallSec, InsightDatasetKind.Sections);
			await facade.addDataset("ubc2", smallSec, InsightDatasetKind.Sections);
			await facade.removeDataset("ubc");
			const result = facade.listDatasets();
			return expect(result).to.eventually.have.deep.members([
				{
					id: "ubc2",
					kind: InsightDatasetKind.Sections,
					numRows: 2
				}
			]);
		});
	});

	/*
	 * This test suite dynamically generates tests from the JSON files in test/resources/queries.
	 * You should not need to modify it; instead, add additional files to the queries directory.
	 * You can still make tests the normal way, this is just a convenient tool for a majority of queries.
	 */
	describe("PerformQuery", () => {
		before(function () {
			console.info(`Before: ${this.test?.parent?.title}`);

			facade = new InsightFacade();

			// Load the datasets specified in datasetsToQuery and add them to InsightFacade.
			// Will *fail* if there is a problem reading ANY dataset.
			const loadDatasetPromises = [facade.addDataset("sections", sections, InsightDatasetKind.Sections)];

			return Promise.all(loadDatasetPromises);
		});

		after(function () {
			console.info(`After: ${this.test?.parent?.title}`);
			clearDisk();
		});

		// type PQErrorKind = "ResultTooLargeError" | "InsightError";

		type Input = any;
		type Output = InsightResult[];
		type Error = "InsightError" | "ResultTooLargeError";
		function errorValidator(error: any): error is Error {
			return error === "InsightError" || error === "ResultTooLargeError";
		}

		function assertOnError(actual: any, expected: Error): void {
			if (expected === "InsightError") {
				expect(actual).to.be.instanceof(InsightError);
			} else if (expected === "ResultTooLargeError") {
				expect(actual).to.be.instanceof(ResultTooLargeError);
			} else {
				// this should be unreachable
				expect.fail("UNEXPECTED ERROR");
			}
		}

		function assertOnResult(actual: unknown, expected: Output): void {
			expect(actual).to.have.deep.members(expected);
		}
		async function target(input: Input): Promise<Output> {
			// const facade = new InsightFacade();
			return await facade.performQuery(input);
		}

		folderTest<Input, Output, Error>(
			"Successful Query Tests",
			target,
			"./test/resources/queries",
			{
				errorValidator,
				assertOnError,
				assertOnResult
			}
		);

		// folderTest<unknown, Promise<InsightResult[]>, PQErrorKind>(
		// 	"Dynamic InsightFacade PerformQuery tests",
		// 	(input) => facade.performQuery(input),
		// 	"./test/resources/queries",
		// 	{
		// 		assertOnResult: (actual, expected) => {
		// 			// TODO add an assertion!
		// 			expect(actual).to.deep.equal(expected);
		// 		},
		// 		errorValidator: (error): error is PQErrorKind =>
		// 			error === "ResultTooLargeError" || error === "InsightError",
		// 		assertOnError: (actual, expected) => {
		// 			// TODO add an assertion!
		// 			if (expected === "InsightError") {
		// 				expect(actual).to.be.instanceof(InsightError);
		// 			} else if (expected === "ResultTooLargeError") {
		// 				expect(actual).to.be.instanceof(ResultTooLargeError);
		// 			} else {
		// 				// this should be unreachable
		// 				expect.fail("UNEXPECTED ERROR");
		// 			}
		// 		},
		// 	}
		// );
	});
});
