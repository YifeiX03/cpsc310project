/*
 * this file's design is done by shibo and improved by Yifei, and, the implementation of the functions are assisted by copilot
 * The design means the field, function signatures
 */
import {InsightDatasetKind} from "../controller/IInsightFacade";

export class Dataset {
	public datasetName: string;
	public courses: Course[];
	public buildings: Building[];
	public type: InsightDatasetKind;
	constructor(datasetName: string, type: InsightDatasetKind = InsightDatasetKind.Sections) {
		this.datasetName = datasetName;
		this.courses = [];
		this.buildings = [];
		this.type = type;
	}

	public addCourse(course: Course): void {
		this.courses.push(course);
	}
}

export class Course {
	public courseName: string;
	public sections: Section[];
	constructor(courseName: string) {
		this.courseName = courseName;
		this.sections = [];
	}

	public addSection(section: Section): void {
		this.sections.push(section);
	}
}

export class Section {
	public avg: number;
	public dept: string;
	public id: string;
	public instructor: string;
	public title: string;
	public pass: number;
	public fail: number;
	public audit: number;
	public uuid: string;
	public year: number;
	constructor(avg: number, dept: string, id: string, instructor: string, title: string, pass: number, fail: number,
		audit: number, uuid: string, year: number) {
		this.avg = avg;
		this.dept = dept;
		this.id = id;
		this.instructor = instructor;
		this.title = title;
		this.pass = pass;
		this.fail = fail;
		this.audit = audit;
		this.uuid = uuid;
		this.year = year;
	}
}

export class Building {
	public fullname: string;
	public shortname: string;
	public address: string;
	public lat: number;
	public lon: number;
	public rooms: Room[];
	constructor(fullname: string, shortname: string, address: string, lat: number, lon: number) {
		this.fullname = fullname;
		this.shortname = shortname;
		this.address = address;
		this.lat = lat;
		this.lon = lon;
		this.rooms = [];
	}
}

export class Room {
	public number: string;
	public name: string;
	public seats: number;
	public type: string;
	public furniture: string;
	public href: string;
	constructor(number: string, name: string, seats: number, type: string, furniture: string, href: string) {
		this.number = number;
		this.name = name;
		this.seats = seats;
		this.type = type;
		this.furniture = furniture;
		this.href = href;
	}
}
