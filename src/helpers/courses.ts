export class Dataset {
	public datasetName: string;
	public courses: Course[];
	constructor(datasetName: string) {
		this.datasetName = datasetName;
		this.courses = [];
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
