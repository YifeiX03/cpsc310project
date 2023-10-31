import {Section} from "./Courses";
// this class is designed by shibo and implemented by chatgpt with the promot written by shibo
export class QueryResult {
	public elements: any[];
	constructor() {
		this.elements = [];
	}

	public addElement(element: any): void {
		this.elements.push(element);
	}

	public hasElement(element: any): boolean {
		return this.elements.includes(element);
	}

	public getElements(): Section[] {
		return this.elements;
	}

	public addElementList(elementList: any[]): void {
		this.elements.push(...elementList);
	}
}
