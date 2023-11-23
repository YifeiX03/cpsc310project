import React from 'react';

interface SectionProps {
	average: number;
	pass: number;
	fail: number;
	instructor: string;
}

const Section: React.FC<SectionProps> = ({ average, pass, fail, instructor }) => {
	const total = pass + fail;
	const passPercentage = total > 0 ? (pass / total) * 100 : 0;
	const failPercentage = total > 0 ? (fail / total) * 100 : 0;

	return (
		<div style={{ background: 'lightblue', padding: '15px', margin: '15px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
			<h3 style={{ color: '#333' }}>Instructor: {instructor}</h3>
			<p style={{ margin: '5px 0', fontWeight: 'bold' }}>Average: {average}</p>
			<div style={{ display: 'flex', width: '100%', background: '#ddd', borderRadius: '5px', overflow: 'hidden' }}>
				<div style={{ width: `${passPercentage}%`, background: 'green', padding: '5px 0', textAlign: 'center', color: 'white' }}>Pass: {pass}</div>
				<div style={{ width: `${failPercentage}%`, background: 'red', padding: '5px 0', textAlign: 'center', color: 'white' }}>Fail: {fail}</div>
			</div>
			<div style={{ marginTop: '10px', fontSize: '0.8em', color: '#555' }}>Total Students: {total}</div>
		</div>
	);
};

export default Section;
