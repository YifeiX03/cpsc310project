import {expect} from "chai";
import {parseHTML} from "../../src/helpers/ParseHTML";
import {getContentFromArchives} from "../TestUtil";

describe("test parseHTML", async function() {
	let result = await parseHTML("campus", getContentFromArchives("campus.zip"));
	console.log(result);
});
