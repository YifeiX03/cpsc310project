import {expect} from "chai";
import {parseHTML} from "../../src/helpers/ParseHTML";
import {getContentFromArchives} from "../TestUtil";

describe("test parseHTML", function() {
	parseHTML("campus", getContentFromArchives("campus.zip"));
});
