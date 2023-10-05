import {expect} from "chai";
import {requestValidator} from "../../src/helpers/RequestValidator";
import {ValidationResult} from "../../src/helpers/ValidationTypes";
import fs from "fs";
import path from "path";


function loadJsonFromFolder(folderPath: string): object[] {
	const jsonObjects: object[] = [];

	const filenames = fs.readdirSync(folderPath);
	for (const filename of filenames) {
		if (path.extname(filename) === ".json") {
			const fileContent = fs.readFileSync(path.join(folderPath, filename), "utf-8");
			jsonObjects.push(JSON.parse(fileContent));
		}
	}

	return jsonObjects;
}
interface FolderTest {
	title: string;
	input: object;
	errorExpected: boolean;
	expected: string;
}

describe("test request validator", function() {
	describe("general test", function () {
		let allJsonData: FolderTest[];
		before(function() {
			const folderPath = "test/resources/queries";
			allJsonData = loadJsonFromFolder(folderPath) as FolderTest[];
		});
		it("should handle request ", () => {
			let counter = 0;
			for (const json of allJsonData) {
				if (json.expected === "ResultTooLargeError") {
					continue;
				}
				++counter;
				console.log("test " + counter + ": " + json.title);
				const result: ValidationResult = requestValidator(json.input, ["sections"]);
				console.log(result);
				expect(result.valid).to.equal(!json.errorExpected);

			}
		});


		it("smol test", () => {
			let query = {
				WHERE: {},
				OPTIONS: {
					COLUMNS: [
						"sections_dept"
					],
					ORDER: "sections_dept"
				}
			};

			let result: ValidationResult = requestValidator(query, ["sections"]);
			console.log(result);
		});
	});
});
