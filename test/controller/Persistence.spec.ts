import InsightFacade from "../../src/controller/InsightFacade";
import {clearDisk, getContentFromArchives} from "../TestUtil";
import {InsightDatasetKind} from "../../src/controller/IInsightFacade";
import {expect, use} from "chai";
import chaiAsPromised from "chai-as-promised";
import {parseZip} from "../../src/helpers/ParseZip";
import {toDisk} from "../../src/helpers/DiskHelpers";

use(chaiAsPromised);

describe("Persistence testing", function () {
	let facade: InsightFacade;
	let sections: string;
	let smallSec: string;
	before( function () {
		sections = getContentFromArchives("pair.zip");
		smallSec = getContentFromArchives("pair-small.zip");
		clearDisk();
	});
	beforeEach( function () {
		clearDisk();
		facade = new InsightFacade();
	});
	after(function () {
		clearDisk();
	});
	describe("Testing", function () {
		it("Should successfully persist a single dataset", async function () {
			await facade.addDataset("ubc", smallSec, InsightDatasetKind.Sections);
			let datasets = facade.datasets;
			facade = new InsightFacade();
			return expect(facade.datasets).to.have.deep.members(datasets);
		});
		it("Should not successfully match a single dataset", async function () {
			await facade.addDataset("ubc", smallSec, InsightDatasetKind.Sections);
			let datasets = facade.datasets;
			facade = new InsightFacade();
			await facade.addDataset("ubc2", smallSec, InsightDatasetKind.Sections);
			return expect(facade.datasets).to.not.have.deep.members(datasets);
		});
		it("Should successfully persist multiple datasets", async function () {
			await facade.addDataset("ubc", smallSec, InsightDatasetKind.Sections);
			await facade.addDataset("ubc2", smallSec, InsightDatasetKind.Sections);
			let datasets = facade.datasets;
			facade = new InsightFacade();
			return expect(facade.datasets).to.have.deep.members(datasets);
		});
		it("Should successfully persist removal of datasets", async function () {
			await facade.addDataset("ubc", smallSec, InsightDatasetKind.Sections);
			await facade.addDataset("ubc2", smallSec, InsightDatasetKind.Sections);
			await facade.removeDataset("ubc");
			let datasets = facade.datasets;
			facade = new InsightFacade();
			return expect(facade.datasets).to.have.deep.members(datasets);
		});
		it("Should successfully persist a dataset that has been removed and re-added", async function () {
			await facade.addDataset("ubc", smallSec, InsightDatasetKind.Sections);
			await facade.addDataset("ubc2", smallSec, InsightDatasetKind.Sections);
			await facade.removeDataset("ubc");
			await facade.addDataset("ubc", smallSec, InsightDatasetKind.Sections);
			let datasets = facade.datasets;
			facade = new InsightFacade();
			return expect(facade.datasets).to.have.deep.members(datasets);
		});
	});
});

describe ("Manual check for persistence", async function () {
	// use ctrl+alt+l to reformat the json
	let dataset = await parseZip("sections", getContentFromArchives("pair-small-2.zip"));
	toDisk("sections", dataset);
});

describe("Manual removal of persisted data", function() {
	clearDisk();
});
