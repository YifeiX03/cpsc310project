import {Request, Response} from "express";
import InsightFacade from "../../src/controller/InsightFacade";
import {InsightDatasetKind, InsightError, NotFoundError} from "../controller/IInsightFacade";

let facade: InsightFacade | null = null;

export async function putDataset(req: Request, res: Response) {
	try {
		checkFacade();
		let zip: string = Buffer.from(req.body).toString("base64");
		const result = await facade?.addDataset(
			req.params.id,
			zip,
			(req.params.kind as InsightDatasetKind));
		if (result !== null) {
			res.status(200).json({result: result});
		} else {
			res.status(400).json({error: "Facade is null"});
		}
	} catch (err) {
		res.status(400).json({error: (err as any).message});
	}
}

export async function deleteDataset(req: Request, res: Response) {
	try {
		checkFacade();
		let result = await facade?.removeDataset(req.params.id);
		if (result !== null) {
			res.status(200).json({result: result});
		} else {
			res.status(400).json({error: "Facade is null"});
		}
	} catch (err) {
		if (err instanceof InsightError) {
			res.status(400).json({error: (err as any).message});
		} else if (err instanceof NotFoundError) {
			res.status(404).json({error: (err as any).message});
		} else {
			res.status(400).json({error: (err as any).message});
		}
	}
}

export async function postQuery(req: Request, res: Response) {
	try {
		checkFacade();
		let result = await facade?.performQuery(JSON.parse(req.body));
		if (result !== null) {
			res.status(200).json({result: result});
		} else {
			res.status(400).json({error: "Facade is null"});
		}
	} catch (err) {
		res.status(400).json({error: (err as any).message});
	}
}

export async function getDatasets(req: Request, res: Response) {
	try {
		checkFacade();
		let result = await facade?.listDatasets();
		if (result !== null) {
			res.status(200).json({result: result});
		} else {
			res.status(400).json({error: "Facade is null"});
		}
	} catch (err) {
		res.status(400).json({error: (err as any).message});
	}
}

function checkFacade() {
	if (facade === null) {
		facade = new InsightFacade();
	}
}
