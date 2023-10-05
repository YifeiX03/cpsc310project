import {expect} from "chai";
import {
	toDisk,
	fromDisk,
	removeDisk
} from "../../src/helpers/diskHelpers";
import {getContentFromArchives} from "../TestUtil";

describe("test write to file", function() {
	// toDisk("ubc", getContentFromArchives("pair-small.zip"));
	// toDisk("ubc2", getContentFromArchives("pair-small.zip"));
	removeDisk("ubc");
});
