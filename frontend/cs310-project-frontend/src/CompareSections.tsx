// this course is generated by ChatGPT under the prompts by shibo
import React, {useState, useCallback} from 'react';
import Section from './Section'; // Adjust the import path as needed

interface CourseSection {
	sections_avg: number;
	sections_pass: number;
	sections_fail: number;
	sections_instructor: string;
	sections_uuid: string; // Add other relevant fields as needed
}

const CompareSections = () => {
	const [splitterPosition, setSplitterPosition] = useState(30); // Percentage of left panel width
	const [isDragging, setIsDragging] = useState(false);
	const [year, setYear] = useState('');
	const [department, setDepartment] = useState('');
	const [courseId, setCourseId] = useState('');
	const serverUrl = "http://localhost:4321";
	const [isLoading, setIsLoading] = useState(false);
	const [noRecordsFound, setNoRecordsFound] = useState(false);

	const [sectionsData, setSectionsData] = useState<CourseSection[]>([]); // State to store sections data

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

	const handleSearch = () => {
		if (!year || !department || !courseId) {
			alert("All fields are required");
			return;
		}

		const yearNumber = parseInt(year);
		if (isNaN(yearNumber)) {
			alert("Year must be a number");
			return;
		}

		const query = {
			"WHERE": {
				"AND": [
					{
						"IS": {
							"sections_dept": department
						}
					},
					{
						"EQ": {
							"sections_year": yearNumber
						}
					},
					{
						"IS": {
							"sections_id": courseId
						}
					}
				]
			},
			"OPTIONS": {
				"COLUMNS": [
					"sections_avg",
					"sections_pass",
					"sections_fail",
					"sections_audit",
					"sections_year",
					"sections_dept",
					"sections_id",
					"sections_instructor",
					"sections_title",
					"sections_uuid"
				],
				"ORDER": "sections_avg"
			}
		};

		setIsLoading(true);
		fetch(`${serverUrl}/query`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(query)
		})
			.then(response => {
				if (response.status === 200) {
					return response.json();
				} else {
					throw new Error('Server responded with an error');
				}
			})
			.then(data => {
				setIsLoading(false);
				if (data.result.length === 0) {
					setNoRecordsFound(true);
					setSectionsData([]); // Clear any previous sections
				} else {
					setNoRecordsFound(false); // Records found
					const sortedData = data.result.sort((a: CourseSection, b: CourseSection) => b.sections_avg - a.sections_avg);
					setSectionsData(sortedData);
				}
			})
			.catch(error => {
				alert(error.message);
				setIsLoading(false);
			});
	};


	return (
		<div style={{ display: 'flex', height: '100vh' }}>
			{isLoading && (
				<div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255, 255, 255, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
					<div>Loading...</div> {/* Here you can replace with a loading logo */}
				</div>
			)}
			<div style={{ width: `${splitterPosition}%`, background: '#f0f0f0', padding: '10px' }}>
				<input
					type="text"
					placeholder="Year"
					value={year}
					onChange={e => setYear(e.target.value)}
					style={{ display: 'block', margin: '10px 0' }}
				/>
				<input
					type="text"
					placeholder="Department Name"
					value={department}
					onChange={e => setDepartment(e.target.value)}
					style={{ display: 'block', margin: '10px 0' }}
				/>
				<input
					type="text"
					placeholder="Course ID"
					value={courseId}
					onChange={e => setCourseId(e.target.value)}
					style={{ display: 'block', margin: '10px 0' }}
				/>
				<button onClick={handleSearch} style={{ display: 'block', margin: '10px 0' }}>
					Search
				</button>
			</div>
			<div
				style={{ width: '5px', cursor: 'ew-resize', background: '#888' }}
				onMouseDown={startDragging}
			/>
			<div style={{ flex: 1, background: '#fff', padding: '10px', overflowY: 'auto' }}>
				{noRecordsFound ? (
					<div>No records found</div>
				) : (
					sectionsData.map(section => (
						<Section
							key={section.sections_uuid}
							average={section.sections_avg}
							pass={section.sections_pass}
							fail={section.sections_fail}
							instructor={section.sections_instructor}
						/>
					))
				)}
			</div>
		</div>
	);
};


export default CompareSections;
