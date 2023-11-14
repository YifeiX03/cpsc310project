import Server from "../../src/rest/Server";
import InsightFacade from "../../src/controller/InsightFacade";

import {expect} from "chai";
import request, {Response} from "supertest";
import {clearDisk, getContentFromArchives} from "../TestUtil";
import * as fs from "fs";
// import JSON = Mocha.reporters.JSON;

describe("Facade D3", function () {

	let facade: InsightFacade;
	let server: Server;
	let sections: Buffer;
	let serverUrl = "localhost:4321";

	before(function () {

		facade = new InsightFacade();
		server = new Server(4321);
		sections = fs.readFileSync("test/resources/archives/pair.zip");
		server.start();
		// TODO: start server here once and handle errors properly
	});

	after(function () {
		// TODO: stop server here once!

		server.stop();
	});

	beforeEach(function () {
		// might want to add some process logging here to keep track of what is going on
		clearDisk();
	});

	afterEach(function () {
		// might want to add some process logging here to keep track of what is going on
	});

	// Sample on how to format PUT requests

	it("PUT test for courses dataset", function () {
		try {
			return request(serverUrl)
				.put("/dataset/sections/sections")
				.send(sections)
				.set("Content-Type", "application/x-zip-compressed")
				.then(function (res: Response) {
					// some logging here please!
					expect(res.status).to.be.equal(200);
				})
				.catch(function (err) {
					// some logging here please!
					console.log(err);
					expect.fail();
				});
		} catch (err) {
			// console.log(err);
			// and some more logging here!
		}
	});

	it("PUT should reject with correct err msg", async function () {
		try {
			await request(serverUrl)
				.put("/dataset/sections/sections")
				.send(sections)
				.set("Content-Type", "application/x-zip-compressed")
				.then(function (res: Response) {
					// some logging here please!
					expect(res.status).to.be.equal(200);
				})
				.catch(function (err) {
					// some logging here please!
					console.log(err);
					expect.fail();
				});

			return request(serverUrl)
				.put("/dataset/sections/sections")
				.send(sections)
				.set("Content-Type", "application/x-zip-compressed")
				.then(function (res: Response) {
					// some logging here please!
					console.log(res.body);
					expect(res.status).to.be.equal(400);
				})
				.catch(function (err) {
					// some logging here please!
					console.log(err);
					expect.fail();
				});
		} catch (err) {
			// console.log(err);
			// and some more logging here!
		}
	});

	it("DELETE should successfully delete a dataset", async function() {
		await request(serverUrl)
			.put("/dataset/sections/sections")
			.send(sections)
			.set("Content-Type", "application/x-zip-compressed")
			.then(function (res: Response) {
				// some logging here please!
				expect(res.status).to.be.equal(200);
			})
			.catch(function (err) {
				// some logging here please!
				console.log(err);
				expect.fail();
			});
		return request(serverUrl)
			.delete("/dataset/sections")
			.then(function (res: Response) {
				// some logging here please!
				expect(res.status).to.be.equal(200);
			})
			.catch(function (err) {
				// some logging here please!
				console.log(err);
				expect.fail();
			});
	});

	it("DELETE should return 404 properly", async function() {
		return request(serverUrl)
			.delete("/dataset/sections")
			.then(function (res: Response) {
				// some logging here please!
				console.log(res.body);
				expect(res.status).to.be.equal(404);
			})
			.catch(function (err) {
				// some logging here please!
				console.log(err);
				expect.fail();
			});
	});

	it("DELETE should return 400 properly", async function() {
		return request(serverUrl)
			.delete("/dataset/my_sections")
			.then(function (res: Response) {
				// some logging here please!
				console.log(res.body);
				expect(res.status).to.be.equal(400);
			})
			.catch(function (err) {
				// some logging here please!
				console.log(err);
				expect.fail();
			});
	});

	it("POST should correctly perform the query", async function() {
		await request(serverUrl)
			.put("/dataset/sections/sections")
			.send(sections)
			.set("Content-Type", "application/x-zip-compressed")
			.then(function (res: Response) {
				// some logging here please!
				expect(res.status).to.be.equal(200);
			})
			.catch(function (err) {
				// some logging here please!
				console.log(err);
				expect.fail();
			});

		let req =  {
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

		return request(serverUrl)
			.post("/query")
			.send(JSON.stringify(req))
			.then(function (res: Response) {
				// some logging here please!
				console.log(res.body);
				expect(res.status).to.be.equal(200);
			})
			.catch(function (err) {
				// some logging here please!
				console.log(err);
				expect.fail();
			});
	});

	it("POST should correctly perform the query when server stop and start in between", async function() {
		await request(serverUrl)
			.put("/dataset/sections/sections")
			.send(sections)
			.set("Content-Type", "application/x-zip-compressed")
			.then(function (res: Response) {
				// some logging here please!
				expect(res.status).to.be.equal(200);
			})
			.catch(function (err) {
				// some logging here please!
				console.log(err);
				expect.fail();
			});

		await server.stop();
		await server.start();

		let req =  {
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

		return request(serverUrl)
			.post("/query")
			.send(JSON.stringify(req))
			.then(function (res: Response) {
				// some logging here please!
				console.log(res.body);
				expect(res.status).to.be.equal(200);
			})
			.catch(function (err) {
				// some logging here please!
				console.log(err);
				expect.fail();
			});
	});

	it("POST reject when err occurs", async function() {
		let req =  {
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

		return request(serverUrl)
			.post("/query")
			.send(JSON.stringify(req))
			.then(function (res: Response) {
				// some logging here please!
				console.log(res.body);
				expect(res.status).to.be.equal(400);
			})
			.catch(function (err) {
				// some logging here please!
				console.log(err);
				expect.fail();
			});
	});

	it("get should work when no datasets loaded", function () {
		return request(serverUrl)
			.get("/datasets")
			.then(function (res: Response) {
				// some logging here please!
				console.log(res.body);
				expect(res.status).to.be.equal(200);
			})
			.catch(function (err) {
				// some logging here please!
				console.log(err);
				expect.fail();
			});
	});

	it("get should work when datasets are loaded", async function () {
		await request(serverUrl)
			.put("/dataset/sections/sections")
			.send(sections)
			.set("Content-Type", "application/x-zip-compressed")
			.then(function (res: Response) {
				// some logging here please!
				expect(res.status).to.be.equal(200);
			})
			.catch(function (err) {
				// some logging here please!
				console.log(err);
				expect.fail();
			});

		return request(serverUrl)
			.get("/datasets")
			.then(function (res: Response) {
				// some logging here please!
				console.log(res.body);
				expect(res.status).to.be.equal(200);
			})
			.catch(function (err) {
				// some logging here please!
				console.log(err);
				expect.fail();
			});
	});
	// The other endpoints work similarly. You should be able to find all instructions at the supertest documentation
});
