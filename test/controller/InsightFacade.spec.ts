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

		it("should reject with an empty dataset id (1.1)", function () {
			const result = facade.addDataset("", smallSec, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should reject with an empty dataset id (1.2)", function () {
			const result = facade.addDataset("   ", smallSec, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should reject with an empty dataset id (1.3)", function () {
			const result = facade.addDataset("UBC_Sections", smallSec, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should reject with an empty dataset id (1.4)", function () {
			const result = facade.addDataset("UBC", inval1Sec, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should reject with an empty dataset id (1.5)", function () {
			const result = facade.addDataset("UBC", inval2Sec, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should reject with an empty dataset id (1.6)", function () {
			const result = facade.addDataset("UBC", inval3Sec, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should successfully add a dataset (2.1)", function () {
			const result = facade.addDataset("ubc", smallSec, InsightDatasetKind.Sections);
			return expect(result).to.eventually.have.members(["ubc"]);
		});

		it("should unsuccessfully add a dataset (2.2)", async function () {
			await facade.addDataset("ubc", smallSec, InsightDatasetKind.Sections);
			const result = facade.addDataset("ubc", smallSec, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should successfully add a dataset (2.3)", async function () {
			await facade.addDataset("ubc", smallSec, InsightDatasetKind.Sections);
			const result = facade.addDataset("ubc1", smallSec, InsightDatasetKind.Sections);
			return expect(result).to.eventually.have.deep.members(["ubc", "ubc1"]);
		});

		it("should unsuccessfully remove a dataset (3.1)", function () {
			const result = facade.removeDataset("ubc");
			return expect(result).to.eventually.be.rejectedWith(NotFoundError);
		});

		it("should successfully add a dataset (3.2)", function () {
			const result = facade.addDataset("ubc", smallSec, InsightDatasetKind.Sections);
			return expect(result).to.eventually.have.members(["ubc"]);
		});

		it("should unsuccessfully remove a dataset (3.3)", function () {
			const result = facade.removeDataset("ub_c");
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should unsuccessfully remove a dataset (3.3.5)", function () {
			const result = facade.removeDataset("  ");
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should successfully remove a dataset (3.4)", async function () {
			await facade.addDataset("ubc", smallSec, InsightDatasetKind.Sections);
			const result = facade.removeDataset("ubc");
			return expect(result).to.eventually.equal("ubc");
		});

		it("should successfully remove a dataset from two (3.5)", async function () {
			await facade.addDataset("ubc1", smallSec, InsightDatasetKind.Sections);
			await facade.addDataset("ubc2", smallSec, InsightDatasetKind.Sections);
			const result = facade.removeDataset("ubc1");
			return expect(result).to.eventually.equal("ubc1");
		});

		it("should successfully remove a dataset from two (3.5.1)", async function () {
			await facade.addDataset("ubc1", smallSec, InsightDatasetKind.Sections);
			await facade.addDataset("ubc2", smallSec, InsightDatasetKind.Sections);
			await facade.removeDataset("ubc1");
			const result = facade.addDataset("ubc3", smallSec, InsightDatasetKind.Sections);
			return expect(result).to.eventually.have.deep.members(["ubc2", "ubc3"]);
		});

		it("should unsuccessfully remove a dataset (3.6)", async function () {
			await facade.addDataset("ubc", smallSec, InsightDatasetKind.Sections);
			const result = facade.removeDataset("sections");
			return expect(result).to.eventually.be.rejectedWith(NotFoundError);
		});

		it("should successfully add a dataset (3.7)", async function () {
			await facade.addDataset("ubc", smallSec, InsightDatasetKind.Sections);
			await facade.removeDataset("ubc");
			const result = facade.addDataset("ubc", smallSec, InsightDatasetKind.Sections);
			return expect(result).to.eventually.have.members(["ubc"]);
		});

		it("should successfully return empty list of datasets (5.1)", function () {
			const result = facade.listDatasets();
			return expect(result).to.eventually.be.an("array").that.is.empty;
		});

		it("should successfully return an array of datasets (5.2)", async function () {
			await facade.addDataset("ubc", smallSec, InsightDatasetKind.Sections);
			const result = facade.listDatasets();
			return expect(result).to.eventually.have.deep.members([
				{
					id: "ubc",
					kind: InsightDatasetKind.Sections,
					numRows: 2,
				},
			]);
		});

		it("should successfully return an array of datasets (5.3)", async function () {
			await facade.addDataset("ubc", smallSec, InsightDatasetKind.Sections);
			await facade.addDataset("ubc2", smallSec, InsightDatasetKind.Sections);
			const result = facade.listDatasets();
			return expect(result).to.eventually.have.deep.members([
				{
					id: "ubc",
					kind: InsightDatasetKind.Sections,
					numRows: 2,
				},
				{
					id: "ubc2",
					kind: InsightDatasetKind.Sections,
					numRows: 2,
				},
			]);
		});

		it("should successfully return an array of datasets (5.4)", async function () {
			await facade.addDataset("ubc", smallSec, InsightDatasetKind.Sections);
			await facade.addDataset("ubc2", smallSec, InsightDatasetKind.Sections);
			await facade.removeDataset("ubc");
			const result = facade.listDatasets();
			return expect(result).to.eventually.have.deep.members([
				{
					id: "ubc2",
					kind: InsightDatasetKind.Sections,
					numRows: 2,
				},
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
			clearDisk();
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

		it("should unsuccessfully query a database (6.1)", function () {
			const result = facade.performQuery({INVALID: "TEST"});
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		// ResultTooLargeError, querying from database that doesn't exist, reference multiple datasets
		it("should unsuccessfully query a database (6.2)", function () {
			const result = facade.performQuery({
				WHERE: {},
				OPTIONS: {
					COLUMNS: ["sections_avg"],
				},
			});
			return expect(result).to.eventually.be.rejectedWith(ResultTooLargeError);
		});

		it("should unsuccessfully query a database (6.3)", function () {
			const result = facade.performQuery({
				WHERE: {},
				OPTIONS: {
					COLUMNS: ["mystery_avg"],
				},
			});
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should unsuccessfully query a database (6.4)", function () {
			const result = facade.performQuery({
				WHERE: {},
				OPTIONS: {
					COLUMNS: ["sections_avg", "mystery_title"],
				},
			});
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should unsuccessfully query a database (6.5)", function () {
			const result = facade.performQuery({
				WHERE: {
					IS: {
						sections_title: "**geog*",
					},
				},
				OPTIONS: {
					COLUMNS: ["sections_title", "sections_id", "sections_dept", "sections_avg"],
					ORDER: "sections_avg",
				},
			});
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should unsuccessfully query a database (6.6)", function () {
			const result = facade.performQuery({
				WHERE: {
					IS: {
						sections_title: "comp*",
					},
				},
				OPTIONS: {
					COLUMNS: [],
					ORDER: "sections_avg",
				},
			});
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("shouldn't be able to query from the wrong dataset (6.7)", async function () {
			await facade.addDataset("ubc", smallSec, InsightDatasetKind.Sections);
			const result = facade.performQuery({
				WHERE: {
					IS: {
						ubc_title: "comptn, progrmng",
					},
				},
				OPTIONS: {
					COLUMNS: ["ubc_title", "ubc_avg"],
					ORDER: "ubc_avg",
				},
			});
			return expect(result).to.eventually.be.an("array").that.is.empty;
		});

		it("should successfully query everything from small dataset (6.8)", async function () {
			// await facade.addDataset("ubc", smallSec, InsightDatasetKind.Sections);
			const result = facade.performQuery({
				WHERE: {},
				OPTIONS: {
					COLUMNS: ["ubc_title", "ubc_avg"],
					ORDER: "ubc_avg",
				},
			});
			return expect(result).to.eventually.have.deep.members([
				{ubc_title: "rsrch methdlgy", ubc_avg: 94.44},
				{ubc_title: "rsrch methdlgy", ubc_avg: 94.44},
			]);
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

		folderTest<Input, Output, Error>("Successful Query Tests", target, "./test/resources/queries", {
			errorValidator,
			assertOnError,
			assertOnResult,
		});

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

describe("InsightFacade", function()  {
	describe("addDataset", function() {
		let sections: string;
		let facade: InsightFacade;

		before(function() {
			console.log("bbb");
			sections = getContentFromArchives("smol-pair.zip"); // load the small archive to avoid timeout
		});

		beforeEach(function() {
			console.log("cccc");
			clearDisk();
			facade = new InsightFacade();
		});

		it ("should reject with an dataset id only has one space", function() {
			const result = facade.addDataset(" ", sections, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it ("should reject with an dataset id has multiple white spaces", function() {
			const result = facade.addDataset("     ", sections, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it ("should reject with an dataset id only has one underscore", function() {
			const result = facade.addDataset("myid_", sections, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it ("should reject with an dataset id has multiple underscores", function() {
			const result = facade.addDataset("the_way_i_name_variables", sections, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});


		// --------------- the work below were all done by ChatGPT!
		// checked and fixed
		it("should resolve a dataset id with a white space correctly and remove it successfully", async function() {
			const result = await facade.addDataset("no white space", sections, InsightDatasetKind.Sections);
			const listDatasetsBefore = await facade.listDatasets(); // Before removal
			const removeResult = await facade.removeDataset("no white space");
			const listDatasetsAfter = await facade.listDatasets(); // After removal

			expect(result).to.deep.equal(["no white space"]); // Including the whitespace
			expect(listDatasetsBefore).to.deep.equal(
				[{id: "no white space", kind: InsightDatasetKind.Sections, numRows: 61}]
			);
			expect(removeResult).to.equal("no white space"); // Ensure successful removal
			expect(listDatasetsBefore).to.have.lengthOf(1);
			expect(listDatasetsAfter).to.deep.equal([]); // Should be empty after removal

		});


		// Test adding a dataset and then removing it successfully
		it("should add and then remove a dataset successfully", async function() {
			const addResult = await facade.addDataset("addThenRemove", sections, InsightDatasetKind.Sections);
			let datasetsAfterAdd = await facade.listDatasets();
			const removeResult = await facade.removeDataset("addThenRemove");
			let datasetsAfterRemove = await facade.listDatasets();
			expect(addResult).to.deep.equal(["addThenRemove"]);
			expect(datasetsAfterAdd).to.deep.equal([
				{id: "addThenRemove", kind: InsightDatasetKind.Sections, numRows: 61}
			]);
			expect(datasetsAfterAdd).to.have.lengthOf(1);
			expect(removeResult).to.equal("addThenRemove");
			expect(datasetsAfterRemove).to.deep.equal([]);
		});

		// Test adding two datasets and then removing them successfully
		// Test adding two datasets and then removing them successfully
		it("should add two datasets and then remove them successfully",   async function() {
			const firstAddResult = await facade.addDataset("firstToAdd", sections, InsightDatasetKind.Sections);
			const datasetsAfterFirstAdd = await facade.listDatasets();
			const secondAddResult = await facade.addDataset("secondToAdd", sections, InsightDatasetKind.Sections);
			const datasetsAfterSecondAdd = await facade.listDatasets();
			const firstRemoveResult = await facade.removeDataset("firstToAdd");
			const datasetsAfterFirstRemove = await facade.listDatasets();
			const secondRemoveResult =  await facade.removeDataset("secondToAdd");
			const datasetsAfterSecondRemove = await facade.listDatasets();
			expect(firstAddResult).to.deep.equal(["firstToAdd"]);
			expect(datasetsAfterFirstAdd).to.deep.equal(
				[{id: "firstToAdd", kind: InsightDatasetKind.Sections , numRows: 61}]
			);
			expect(secondAddResult).to.deep.equal(["firstToAdd", "secondToAdd"]);
			expect(datasetsAfterSecondAdd).to.deep.equal([
				{id: "firstToAdd", kind: InsightDatasetKind.Sections , numRows: 61},
				{id: "secondToAdd", kind: InsightDatasetKind.Sections , numRows: 61}
			]);
			expect(datasetsAfterSecondAdd).to.have.lengthOf(2);
			expect(firstRemoveResult).to.equal("firstToAdd");
			expect(datasetsAfterFirstRemove).to.deep.equal(
				[{id: "secondToAdd", kind: InsightDatasetKind.Sections , numRows: 61}]
			);
			expect(datasetsAfterFirstRemove).to.have.lengthOf(1);
			expect(secondRemoveResult).to.equal("secondToAdd");
			expect(datasetsAfterSecondRemove).to.deep.equal([]);
		});


		// Test adding two datasets, remove one, and then check for the other one
		it("should add two datasets, remove one, and then check for the other one",  async function() {
			await facade.addDataset("firstToAdd", sections, InsightDatasetKind.Sections);
			await facade.addDataset("secondToAdd", sections, InsightDatasetKind.Sections);
			const firstRemoveResult = await facade.removeDataset("firstToAdd");
			const datasetsAfterFirstRemove = await facade.listDatasets();
			expect(firstRemoveResult).to.equal("firstToAdd");
			expect(datasetsAfterFirstRemove).to.deep.equal([
				{id: "secondToAdd", kind: InsightDatasetKind.Sections , numRows: 61}
			]);
			expect(datasetsAfterFirstRemove).to.have.lengthOf(1);
		});


		// Test adding, removing, and then re-adding the same dataset
		it("should add, remove, and then re-add the same dataset successfully", async function() {
			await facade.addDataset("addRemoveAdd", sections, InsightDatasetKind.Sections);
			await facade.removeDataset("addRemoveAdd");
			const secondAddResult = await facade.addDataset("addRemoveAdd", sections, InsightDatasetKind.Sections);
			const datasetsAfterSecondAdd = await facade.listDatasets();

			expect(secondAddResult).to.deep.equal(["addRemoveAdd"]);
			expect(datasetsAfterSecondAdd).to.deep.equal([
				{id: "addRemoveAdd", kind: InsightDatasetKind.Sections , numRows: 61}
			]);
			expect(datasetsAfterSecondAdd).to.have.lengthOf(1);
		});

		it("should return empty array when there are no datasets added", function() {
			const result = facade.listDatasets();
			return expect(result).to.eventually.be.deep.equal([]);
		});

// ---------------- test the not legit behaviours, checked and fixed by shibo

		// should reject adding a dataset with an invalid .zip
		it("should reject adding a dataset with an invalid .zip ", function() {
			const fakeMsg = "Trust me bro, im an authentic zip file!";
			const result = facade.addDataset("nonZipFormat", fakeMsg, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should reject adding a dataset that does not have a folder courses", function() {
			let invalid: string = getContentFromArchives("invalid-dataset1.zip");
			const result = facade.addDataset("nonZipFormat", invalid, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should reject adding a dataset that does not contain a valid json file", function() {
			let invalid: string = getContentFromArchives("invalid-dataset2.zip");
			const result = facade.addDataset("nonZipFormat", invalid, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should reject adding a dataset that only contains invalid courses", function() {
			let invalid: string = getContentFromArchives("invalid-dataset4.zip");
			const result = facade.addDataset("nonZipFormat", invalid, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		// Test rejecting adding a dataset with duplicate id
		it("should reject adding a dataset with duplicate id and does not add the redundant dataset", async function() {
			await facade.addDataset("duplicateId", sections, InsightDatasetKind.Sections);
			const addDuplicate = facade.addDataset("duplicateId", sections, InsightDatasetKind.Sections);
			return expect(addDuplicate).to.eventually.be.rejectedWith(InsightError);
			/*
			const listDatasets = await facade.listDatasets();
			expect(listDatasets).to.deep.equal([{ id: "duplicateId", kind: InsightDatasetKind.Sections , numRows: 61}])
			*/

		});

		it("should reject removing a dataset with a name that does not exist", function() {
			const nonExistentName = "nameDoesNotExist";
			const removeResult = facade.removeDataset(nonExistentName);
			const listDatasets = facade.listDatasets();  // To ensure no datasets are there

			return Promise.all([
				expect(removeResult).to.eventually.be.rejectedWith(NotFoundError),
				expect(listDatasets).to.eventually.deep.equal([])
			]);
		});

		it("should reject removing a dataset with a name containing an underscore", function() {
			const invalidName = "name_with_underscore";
			const removeResult = facade.removeDataset(invalidName);
			const listDatasets = facade.listDatasets(); // To ensure no datasets are there

			return Promise.all([
				expect(removeResult).to.eventually.be.rejectedWith(InsightError),
				expect(listDatasets).to.eventually.deep.equal([])
			]);
		});

		// {"result":[],"rank":0}

		/*
		A valid section:
		Contains every field which can be used by a query (see the "Valid Query Keys" section below).
		If a field you use in a section is present in the JSON but contains something counter-intuitive like empty string, it is valid.
		 */

		it("should reject removing a dataset with a name containing only a single whitespace", function() {
			const invalidName = " ";
			const removeResult = facade.removeDataset(invalidName);
			const listDatasets = facade.listDatasets(); // To ensure no datasets are there

			return Promise.all([
				expect(removeResult).to.eventually.be.rejectedWith(InsightError),
				expect(listDatasets).to.eventually.deep.equal([])
			]);
		});

		it("should reject removing a dataset with a name containing only multiple whitespaces", function() {
			const invalidName = "      ";
			const removeResult = facade.removeDataset(invalidName);
			const listDatasets = facade.listDatasets(); // To ensure no datasets are there

			return Promise.all([
				expect(removeResult).to.eventually.be.rejectedWith(InsightError),
				expect(listDatasets).to.eventually.deep.equal([])
			]);
		});

// --- now testing query and EBNF
		it("should read datasets from a new instance of InsightFacade", async function() {
			await facade.addDataset("persistentDataset", sections, InsightDatasetKind.Sections);
			const newFacade = new InsightFacade();// Simulate InsightFacade crashes
			const listDatasets = await newFacade.listDatasets();
			expect(listDatasets).to.deep.equal([
				{id: "persistentDataset", kind: InsightDatasetKind.Sections , numRows: 61}
			]);
			expect(listDatasets).to.have.lengthOf(1);
		});

		// Test Logic Comparison (AND)
		it("should accept a query with an AND logic comparison", async function() {
			await facade.addDataset("sections", sections, InsightDatasetKind.Sections);
			const query = {
				WHERE: {
					AND: [
						{
							GT: {
								sections_avg: 90
							}
						},
						{
							LT: {
								sections_avg: 91
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
			const result = facade.performQuery(query);
			return expect(result).to.eventually.be.fulfilled;
		});

		// Test Logic Comparison (OR)
		// work from ChatGPT
		it("should accept a query with an OR logic comparison", async function() {
			await facade.addDataset("sections", sections, InsightDatasetKind.Sections);
			const query = {
				WHERE: {
					OR: [
						{
							GT: {
								sections_avg: 98
							}
						},
						{
							LT: {
								sections_avg: 50
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
			const result = facade.performQuery(query);
			return expect(result).to.eventually.be.fulfilled;
		});

		// Test MCOMPARISON (LT)
		// work from ChatGPT
		it("should accept a query with an LT comparison", async function() {
			await facade.addDataset("sections", sections, InsightDatasetKind.Sections);
			const query = {
				WHERE: {

					LT: {
						sections_avg: 50
					}

				},
				OPTIONS: {
					COLUMNS: [
						"sections_dept",
						"sections_avg"
					],
					ORDER: "sections_avg"
				}
			};
			const result = facade.performQuery(query);
			return expect(result).to.eventually.be.fulfilled;
		});

		// Test MCOMPARISON (GT)
		// work from ChatGPT
		it("should accept a query with a GT comparison", async function() {
			await facade.addDataset("sections", sections, InsightDatasetKind.Sections);
			const query = {
				WHERE: {
					GT: {
						sections_avg: 97
					}
				},
				OPTIONS: {
					COLUMNS: [
						"sections_dept",
						"sections_avg"
					],
					ORDER: "sections_avg"
				}
			};

			const result = facade.performQuery(query);
			return expect(result).to.eventually.be.fulfilled;
		});

		// Test MCOMPARISON (EQ)
		// work from ChatGPT
		it("should accept a query with an EQ comparison", async function() {
			await facade.addDataset("sections", sections, InsightDatasetKind.Sections);
			const query = {
				WHERE: {
					EQ: {
						sections_avg: 70
					}
				},
				OPTIONS: {
					COLUMNS: [
						"sections_dept",
						"sections_avg"
					],
					ORDER: "sections_avg"
				}
			};
			const result = facade.performQuery(query);
			return expect(result).to.eventually.be.fulfilled;
		});

		// Test SCOMPARISON (IS)
		// work from ChatGPT
		it("should accept a query with an IS comparison", async function() {
			await facade.addDataset("sections", sections, InsightDatasetKind.Sections);
			const query = {
				WHERE: {
					IS: {
						sections_dept: "envr"
					}
				},
				OPTIONS: {
					COLUMNS: [
						"sections_dept",
						"sections_avg"
					],
					ORDER: "sections_avg"
				}
			};
			const result = facade.performQuery(query);
			return expect(result).to.eventually.be.fulfilled;
		});

		// work from ChatGPT
		// Test NEGATION (NOT)
		it("should accept a query with a NOT filter", async function() {
			await facade.addDataset("sections", sections, InsightDatasetKind.Sections);
			const query = {
				WHERE: {
					NOT: {
						GT:{sections_avg: 50}
					}
				},
				OPTIONS: {
					COLUMNS: [
						"sections_dept",
						"sections_avg"
					],
					ORDER: "sections_avg"
				}
			};
			const result = facade.performQuery(query);
			return expect(result).to.eventually.be.fulfilled;
		});


		it("should reject if ther's no OPTIONS", async function() {
			await facade.addDataset("sections", sections, InsightDatasetKind.Sections);
			const query = {
				WHERE: {
					NOT: {
						GT:{sections_avg: 50}
					}
				}
			};
			return expect(facade.performQuery(query)).to.eventually.be.rejectedWith(InsightError);
		});

		it("should accept when has no ORDER", async function() {
			await facade.addDataset("sections", sections, InsightDatasetKind.Sections);
			const query = {
				WHERE: {
					NOT: {
						GT:{sections_avg: 50}
					}
				},
				OPTIONS: {
					COLUMNS: [
						"sections_dept",
						"sections_avg"
					]
				}
			};
			const result = facade.performQuery(query);
			return expect(result).to.eventually.be.fulfilled;
		});

		it("should reject if ther's no COLUMN", async function() {
			await facade.addDataset("sections", sections, InsightDatasetKind.Sections);
			const query = {
				WHERE: {
					NOT: {
						GT:{sections_avg: 50}
					}
				},
				OPTIONS: {
					ORDER: "sections_avg"
				}
			};
			return expect(facade.performQuery(query)).to.eventually.be.rejectedWith(InsightError);
		});


		it("should reject if reference multiple datasets", async function() {
			await facade.addDataset("sections", sections, InsightDatasetKind.Sections);
			await facade.addDataset("sections2", sections, InsightDatasetKind.Sections);
			const query = {
				WHERE: {
					GT: {
						sections2_avg: 99
					}
				},
				OPTIONS: {
					COLUMNS: [
						"sections_dept",
						"sections2_avg"
					],
					ORDER: "sections_avg"
				}
			};
			return expect(facade.performQuery(query)).to.eventually.be.rejectedWith(InsightError);
		});

		it("should reject if reference non-exist dataset", async function() {
			const query = {
				WHERE: {
					GT: {
						sections_avg: 99
					}
				},
				OPTIONS: {
					COLUMNS: [
						"sections_dept",
						"sections_avg"
					],
					ORDER: "sections_avg"
				}
			};
			return expect(facade.performQuery(query)).to.eventually.be.rejectedWith(InsightError);
		});

		it("should reject when QUERY is more than BODY and OPTIONS", async function() {
			await facade.addDataset("sections", sections, InsightDatasetKind.Sections);
			const query = {
				WHERE: {
					GT: {
						sections_avg: 99
					}
				},
				OPTIONS: {
					COLUMNS: [
						"sections_dept",
						"sections_avg"
					],
					ORDER: "sections_avg"
				}, EXTRAS: {
					action: "praise spez"
				}
			};
			return expect(facade.performQuery(query)).to.eventually.be.rejectedWith(InsightError);
		});

		it("should reject if body does not have a WHERE:", async function() {
			await facade.addDataset("sections", sections, InsightDatasetKind.Sections);
			const query = {
				HERE: {
					GT: {
						sections_avg: 99
					}
				}, OPTIONS: {
					COLUMNS: [
						"sections_dept",
						"sections_avg"
					],
					ORDER: "sections_avg"
				}
			};
			return expect(facade.performQuery(query)).to.eventually.be.rejectedWith(InsightError);
		});

		it("Test filter, use non-exist one:", async function() {
			await facade.addDataset("sections", sections, InsightDatasetKind.Sections);
			const query = {
				WHERE: {
					ATT: {
						sections_avg: 99
					}
				}, OPTIONS: {
					COLUMNS: [
						"sections_dept",
						"sections_avg"
					],
					ORDER: "sections_avg"
				}
			};
			return expect(facade.performQuery(query)).to.eventually.be.rejectedWith(InsightError);
		});

		it("should reject when breaking filter LOGICCOMPARISON, rule FILTER_LIST", async function() {
			await facade.addDataset("sections", sections, InsightDatasetKind.Sections);
			const query = {
				WHERE: {
					AND:[
						{
							GT:{
								sections_avg:90
							}
						},
						"sections_dept"
					]
				}, OPTIONS: {
					COLUMNS: [
						"sections_dept",
						"sections_avg"
					],
					ORDER: "sections_avg"
				}
			};
			return expect(facade.performQuery(query)).to.eventually.be.rejectedWith(InsightError);
		});

		it("should reject if break the rule MCOMPARATOR", async function() {
			await facade.addDataset("sections", sections, InsightDatasetKind.Sections);
			const query = {
				WHERE: {
					GT: {
						sections_avg: "string"
					}
				}, OPTIONS: {
					COLUMNS: [
						"sections_dept",
						"sections_avg"
					],
					ORDER: "sections_avg"
				}
			};
			return expect(facade.performQuery(query)).to.eventually.be.rejectedWith(InsightError);
		});

		it("should reject if break the rule NEGATION", async function() {
			await facade.addDataset("sections", sections, InsightDatasetKind.Sections);
			const query = {
				WHERE: {
					NOT: {
						aa: {
							aa: "aa"
						}
					}
				}, OPTIONS: {
					COLUMNS: [
						"sections_dept",
						"sections_avg"
					],
					ORDER: "sections_avg"
				}};
			return expect(facade.performQuery(query)).to.eventually.be.rejectedWith(InsightError);
		});

		it("should reject if break the rule mkey", async function() {
			await facade.addDataset("sections", sections, InsightDatasetKind.Sections);
			const query = {
				WHERE: {
					GT: {
						"sections-avg": 88
					}
				}, OPTIONS: {
					COLUMNS: [
						"sections_dept",
						"sections_avg"
					],
					ORDER: "sections_avg"
				}
			};
			return expect(facade.performQuery(query)).to.eventually.be.rejectedWith(InsightError);
		});

		it("last test", async function() {
			await facade.addDataset("sections", sections, InsightDatasetKind.Sections);
			const query = {
				WHERE: {
					GT: {
						sections_avg: 99
					}
				},
				OPTIONS: {
					COLUMNS: [
						"sections_dept aaa",
						"sections_avg"
					],
					ORDER: "sections_avg"
				}
			};
			return expect(facade.performQuery(query)).to.eventually.be.rejectedWith(InsightError);
		});

	});
});

describe("InsightFacadeRooms", function() {
	let facade: InsightFacade;

	let rooms: string;
	let roomsNoIndex: string;
	let roomsNoCampus: string;
	let roomsNoBuildings: string;
	// still need to check for things like if a folder is missing but there are still buildings in the wrong folder
	// other checks on what makes a room/building/index file invalid, need to look more deeply at the spec

	// ///////////wtitten by shibo///////////
	let noBuildinHtml: string;
	// ////////////////////end//////////////

	before(function() {
		rooms = getContentFromArchives("campus.zip");
		roomsNoIndex = getContentFromArchives("campus_no_index.zip");
		roomsNoCampus = getContentFromArchives("campus_no_campus.zip");
		roomsNoBuildings = getContentFromArchives("campus_no_buildings.zip");

		// ///////////wtitten by shibo///////////
		noBuildinHtml = getContentFromArchives("campus_no_building_html.zip");
		// ////////////////////end//////////////
		clearDisk();
	});
	describe("Add/Remove/List DatasetRooms", function() {
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
		it("should successfully add a rooms dataset", function() {
			const result = facade.addDataset("rooms", rooms, InsightDatasetKind.Rooms);
			return expect(result).to.eventually.have.members(["rooms"]);
		});
		it("should successfully remove a rooms dataset", async function() {
			await facade.addDataset("rooms", rooms, InsightDatasetKind.Rooms);
			const result = facade.removeDataset("rooms");
			return expect(result).to.eventually.equal("rooms");
		});
		// it("should successfully persist the removal of a rooms dataset", async function() {
		// 	await facade.addDataset("rooms", rooms, InsightDatasetKind.Rooms);
		// 	await facade.removeDataset("rooms");
		// 	facade = new InsightFacade();
		// 	const result = facade.addDataset("rooms", rooms, InsightDatasetKind.Rooms);
		// 	return expect(result).to.eventually.have.members(["rooms"]);
		// });
		it("should successfully list a rooms dataset", async function() {
			await facade.addDataset("rooms", rooms, InsightDatasetKind.Rooms);
			const result = facade.listDatasets();
			return expect(result).to.eventually.have.deep.members([
				{
					id: "rooms",
					kind: InsightDatasetKind.Rooms,
					numRows: 364,
				}
			]);
		});
		it("should successfully persist a rooms dataset", async function() {
			await facade.addDataset("rooms", rooms, InsightDatasetKind.Rooms);
			facade = new InsightFacade();
			const result = facade.listDatasets();
			return expect(result).to.eventually.have.deep.members([
				{
					id: "rooms",
					kind: InsightDatasetKind.Rooms,
					numRows: 364,
				}
			]);
		});
		it("should unsuccessfully add an invalid rooms dataset", function() {
			const result = facade.addDataset("rooms", roomsNoIndex, InsightDatasetKind.Rooms);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});
		it("should unsuccessfully add an invalid rooms dataset", function() {
			const result = facade.addDataset("rooms", roomsNoCampus, InsightDatasetKind.Rooms);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});
		it("should unsuccessfully add an invalid rooms dataset", function() {
			const result = facade.addDataset("rooms", roomsNoBuildings, InsightDatasetKind.Rooms);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		// ///////////wtitten by shibo///////////
		it("should successfully add a rooms dataset even one hyperlink links to" +
		"a building html that does not exist", async function() {
			await facade.addDataset("rooms", rooms, InsightDatasetKind.Rooms);
			const result = facade.listDatasets();
			return expect(result).to.eventually.have.deep.members([
				{
					id: "rooms",
					kind: InsightDatasetKind.Rooms,
					numRows: 303,
				}
			]);
		});

		it("should successfully add a dataset with only one valid room", async function() {
			await facade.addDataset("rooms", getContentFromArchives("campus_only_one_room.zip"),
				InsightDatasetKind.Rooms);
			const result = facade.listDatasets();
			return expect(result).to.eventually.have.deep.members([
				{
					id: "rooms",
					kind: InsightDatasetKind.Rooms,
					numRows: 1,
				}
			]);
		});

		it("should unsuccessfully add a dataset with no valid room", async function() {
			let ret = facade.addDataset("rooms", getContentFromArchives("campus_no_room.zip"),
				InsightDatasetKind.Rooms);
			return expect(ret).to.eventually.be.rejectedWith(InsightError);
		});

		it("should unsuccessfully add a dataset with invalid folder name", async function() {
			let ret = facade.addDataset("rooms",
				getContentFromArchives("campus_invalid_folder.zip"),
				InsightDatasetKind.Rooms);
			return expect(ret).to.eventually.be.rejectedWith(InsightError);
		});


		// ////////////////////end//////////////


	});
});


/*
 * the structure of the folder test is borrowed from provided project AdditionCalculator,
 * the queries used in text two sets of tests is retrieved and modified from the given examples on the course website
 */

describe("folder-test-one", function() {
	describe("test perform query", function () {
		type Output = InsightResult[]
		type Input = unknown
		type Error = "ResultTooLargeError"
		let sections: string;
		let facade: InsightFacade;
		before(async function () {
			clearDisk();
			sections = getContentFromArchives("pair.zip");
			facade = new InsightFacade();
			await facade.addDataset("sections", sections, InsightDatasetKind.Sections);
		});

		function assertOnResult(actual: unknown, expected: Output): void {
			expect(actual).have.deep.members(expected);
			// add length assert
			expect((actual as unknown[]).length).to.equal(expected.length);
		}
		function target(input: Input): Promise<Output> {
			return facade.performQuery(input);
		}

		function assertOnError(actual: any, expected: Error): void {
			if (expected === "ResultTooLargeError") {
				expect(actual).to.be.instanceof(ResultTooLargeError);
			} else {
				expect.fail("UNEXPECTED ERROR");
			}
		}
		function errorValidator(error: any): error is Error {
			return error === "ResultTooLargeError";
		}

		folderTest<Input, Output, Error>(
			"Add Dynamic",
			target,
			"./test/resources/json",
			{
				errorValidator,
				assertOnError,
				assertOnResult
			}
		);
	});
});

describe("folder-test-two", function() {
	describe("test EBNF", function () {
		type Output = InsightResult[]
		type Input = unknown
		type Error = "InsightError" | "ResultTooLargeError"
		let sections: string;
		let facade: InsightFacade;
		before(async function () {
			clearDisk();
			sections = getContentFromArchives("smol-pair.zip");
			facade = new InsightFacade();
			await facade.addDataset("sections", sections, InsightDatasetKind.Sections);
		});

		function assertOnResult(actual: unknown, expected: Output): void {
			return;
		}
		function target(input: Input): Promise<Output> {
			return facade.performQuery(input);
		}

		function assertOnError(actual: any, expected: Error): void {
			if (expected === "InsightError") {
				expect(actual).to.be.instanceof(InsightError);
			} else if (expected === "ResultTooLargeError") {
				expect(actual).to.be.instanceof(ResultTooLargeError);
			}else {
				expect.fail("UNEXPECTED ERROR");
			}
		}
		function errorValidator(error: any): error is Error {
			return error === "InsightError" || error === "ResultTooLargeError";
		}

		folderTest<Input, Output, Error>(
			"Add Dynamic 2",
			target,
			"./test/resources/fail-json",
			{
				errorValidator,
				assertOnError,
				assertOnResult
			}
		);
	});
});

describe("folder-test-three", function() {
	describe("test EBNF c2", function () {
		type Output = InsightResult[]
		type Input = unknown
		type Error = "InsightError" | "ResultTooLargeError"
		let sections: string;
		let facade: InsightFacade;
		before(async function () {
			clearDisk();
			sections = getContentFromArchives("pair.zip");
			facade = new InsightFacade();
			await facade.addDataset("sections", sections, InsightDatasetKind.Sections);
			await facade.addDataset("rooms", sections, InsightDatasetKind.Rooms);
		});

		function assertOnResult(actual: unknown, expected: Output): void {
			return;
		}
		function target(input: Input): Promise<Output> {
			return facade.performQuery(input);
		}

		function assertOnError(actual: any, expected: Error): void {
			if (expected === "InsightError") {
				expect(actual).to.be.instanceof(InsightError);
			} else if (expected === "ResultTooLargeError") {
				expect(actual).to.be.instanceof(ResultTooLargeError);
			}else {
				expect.fail("UNEXPECTED ERROR");
			}
		}
		function errorValidator(error: any): error is Error {
			return error === "InsightError" || error === "ResultTooLargeError";
		}

		folderTest<Input, Output, Error>(
			"Add Dynamic 2",
			target,
			"./test/resources/room-enbf",
			{
				errorValidator,
				assertOnError,
				assertOnResult
			}
		);
	});
});

describe("folder-test-three-four", function() {
	describe("test EBNF c2 praise spez", function () {
		type Output = InsightResult[];
		type Input = unknown;
		type Error = "InsightError" | "ResultTooLargeError";
		let sections: string;
		let facade: InsightFacade;
		before(async function () {
			clearDisk();
			sections = getContentFromArchives("pair.zip");
			facade = new InsightFacade();
			await facade.addDataset("sections", sections, InsightDatasetKind.Sections);
			await facade.addDataset("rooms", sections, InsightDatasetKind.Rooms);
		});

		function assertOnResult(actual: unknown, expected: Output): void {
			return;
		}
		function target(input: Input): Promise<Output> {
			return facade.performQuery(input);
		}

		function assertOnError(actual: any, expected: Error): void {
			if (expected === "InsightError") {
				expect(actual).to.be.instanceof(InsightError);
			} else if (expected === "ResultTooLargeError") {
				expect(actual).to.be.instanceof(ResultTooLargeError);
			}else {
				expect.fail("UNEXPECTED ERROR");
			}
		}
		function errorValidator(error: any): error is Error {
			return error === "InsightError" || error === "ResultTooLargeError";
		}

		folderTest<Input, Output, Error>(
			"Add Dynamic 2",
			target,
			"./test/resources/room-test2",
			{
				errorValidator,
				assertOnError,
				assertOnResult
			}
		);
	});
});
