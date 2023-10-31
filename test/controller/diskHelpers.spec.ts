import {expect} from "chai";
import {
	toDisk,
	fromDisk,
	removeDisk
} from "../../src/helpers/DiskHelpers";
import {getContentFromArchives} from "../TestUtil";
import {parseHTML} from "../../src/helpers/ParseHTML";

describe("test write to file", async function() {
	// toDisk("ubc", getContentFromArchives("pair-small.zip"));
	// toDisk("ubc2", getContentFromArchives("pair-small.zip"));
	// removeDisk("ubc");
	// let dataset = await parseHTML("ubc", getContentFromArchives("campus.zip"));
	// toDisk("ubc", dataset);
	// removeDisk("ubc");
});

