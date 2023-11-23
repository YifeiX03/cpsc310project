import React, {useState, useCallback} from "react";

interface Department {
	sections_dept: string
}

interface Course {
	sections_dept: string,
	sections_id: string,
	sections_title: string,
	avg: number
}

function CompareCourses() {
	const [splitterPosition, setSplitterPosition] = useState(30); // Percentage of left panel width
	const [isDragging, setIsDragging] = useState(false);
	const serverUrl = "http://localhost:4321";
	const [isLoading, setIsLoading] = useState(false);

	const dataset = "sections";
	const [departmentsData, setDepartmentsData] = useState<Department[]>([]);
	const [coursesData, setCoursesData] = useState<Course[]>([]);

	const startDragging = useCallback(() => {
		setIsDragging(true);
	}, []);

	const stopDragging = useCallback(() => {
		setIsDragging(false);
	}, []);

	const onDrag = useCallback((e: MouseEvent) => {
		if (isDragging) {
			const newWidth = (e.clientX / window.innerWidth) * 100;
			if (newWidth > 10 && newWidth < 90) {
				setSplitterPosition(newWidth);
			}
		}
	}, [isDragging]);

	React.useEffect(() => {
		window.addEventListener('mousemove', onDrag);
		window.addEventListener('mouseup', stopDragging);

		return () => {
			window.removeEventListener('mousemove', onDrag);
			window.removeEventListener('mouseup', stopDragging);
		};
	}, [onDrag, stopDragging]);

	const loadDataset = () => {
		setDepartmentsData([]);
		const query = {
			"WHERE": {},
			"OPTIONS": {
				"COLUMNS": [
					"sections_dept"
				]
			},
			"TRANSFORMATIONS": {
				"GROUP": [
					"sections_dept"
				],
				"APPLY": [
					{
						"count": {
							"COUNT": "sections_dept"
						}
					}
				]
			}
		}
		setIsLoading(true);
		fetch(`${serverUrl}/query`, {
			method: `POST`,
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(query)
		}).then(res => {
			if (res.status === 200) {
				return res.json();
			} else {
				throw new Error("Server responded with an error");
			}
		}).then(data => {
			setIsLoading(false);
			console.log(data);
			if (data.result.length === 0) {
				alert("There is no dataset with name Sections");
			} else {
				// sorting code from https://www.freecodecamp.org/news/how-to-sort-alphabetically-in-javascript/
				const trimmedData = data.result.sort(function (a: any,b: any) {
					if (a.sections_dept < b.sections_dept) {
						return -1;
					}
					if (a.sections_dept > b.sections_dept) {
						return 1;
					}
					return 0;
				});
				setDepartmentsData(trimmedData);
				console.log("Department Data follows:");
				console.log(departmentsData);
			}
		}).catch(error => {
			alert(error.message);
			setIsLoading(false);
		})
	}

	const getCourses = (dept: Department) => {
		console.log("Looking for courses in department:" + dept.sections_dept);
		setCoursesData([]);
		const query = {
			"WHERE": {
				"IS": {
					"sections_dept": dept.sections_dept
				}
			},
			"OPTIONS": {
				"COLUMNS": [
					"sections_id",
					"sections_title",
					"sections_dept",
					"avg"
				]
			},
			"TRANSFORMATIONS": {
				"GROUP": [
					"sections_id",
					"sections_title",
					"sections_dept"
				],
				"APPLY": [
					{
						"avg": {
							"AVG": "sections_avg"
						}
					}
				]
			}
		}
		setIsLoading(true);
		fetch(`${serverUrl}/query`, {
			method: "POST",
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(query)
		}).then(res => {
			if (res.status === 200) {
				return res.json();
			} else {
				throw new Error("Server responded with an error");
			}
		}).then(data => {
			setIsLoading(false);
			console.log(data);
			if (data.result.length === 0) {
				alert("We are sorry, but there's no matching info in the database.");
			} else {
				const sortedData = data.result.sort((a: any, b: any) => b.avg - a.avg)
				const filteredData = sortedData.filter((course: any) => (course.avg >= 0));
				setCoursesData(filteredData);
			}
		})
			.catch(error => {
				alert(error.message);
				setIsLoading(false);
			});
	}

	return (
		<div style={{ display: 'flex', height: '100%' }}>
			{isLoading && (
				<div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255, 255, 255, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
					<div>Loading...</div> {/* Here you can replace with a loading logo */}
				</div>
			)}
			<div style={{ width: `${splitterPosition}%`, background: '#f0f0f0', padding: '10px' }}>
				<button onClick={loadDataset} style={{ display: 'block', margin: '10px 0' }}>
					Load Dataset
				</button>
				<div>
					{departmentsData.map(department => (
						<button onClick={() => getCourses(department)} style={{ background: 'lightblue', padding: '15px', margin: '15px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)', display: 'flex', flexDirection: 'column', alignItems: 'center', width: "80%" }}>
							{department.sections_dept}
						</button>
					))}
				</div>
			</div>
			<div
				style={{ width: '5px', cursor: 'ew-resize', background: '#888' }}
				onMouseDown={startDragging}
			/>
			<div style={{ flex: 1, background: '#fff', padding: '10px' }}>
				<div>
					{coursesData.length === 0 ? (
						<div>No data about averages in this department</div>
					) : (
						coursesData.map(course => (
						<div style={{ background: 'lightblue', padding: '15px', margin: '15px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)', display: 'flex', flexDirection: 'column', alignItems: 'center', width: "80%" }}>
							<p style={{ margin: '5px 0', fontWeight: 'bold' }}>Course Code: {course.sections_dept} {course.sections_id}</p>
							<p style={{ margin: '5px 0', fontWeight: 'bold' }}>Course Name: {course.sections_title}</p>
							<p style={{ margin: '5px 0', fontWeight: 'bold' }}>Overall Average: {course.avg}</p>
						</div>
					)))}
				</div>
			</div>
		</div>
	);
}

export default CompareCourses;
