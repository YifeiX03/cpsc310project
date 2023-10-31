import http from "http";

let teamURL = "http://cs310.students.cs.ubc.ca:11316/api/v1/project_team142/";
export async function getGeolocations(buildings: any[]) {
	let requests: any[] = [];
	for (let building of buildings) {
		requests.push(getGeolocationRequest(building.address));
	}
	let responses = await Promise.all(requests);
	for (let index in responses) {
		buildings[index].lat = responses[index].lat;
		buildings[index].lon = responses[index].lon;
	}
}

export function getGeolocationRequest(address: string) {
	let requestURL = teamURL.concat(encodeURIComponent(address));
	return new Promise((resolve, reject) => {
		http.get(requestURL, (res) => {
			let error;
			if (res.statusCode !== 200) {
				error = new Error("Request failed" + res.statusCode);
			}
			if (error) {
				console.error(error.message);
				res.resume();
				reject(error);
			}
			let data = "";
			res.on("data", (chunk) => {
				data += chunk;
			});

			res.on("end", () => {
				resolve(JSON.parse(data));
			});

			res.on("error", (err) => {
				reject(err);
			});
		});
	});
}
