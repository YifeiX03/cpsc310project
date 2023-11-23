import React from 'react';
import logo from './logo.svg';
import './App.css';

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from "./Home";
import About from "./About";
import CompareSections from "./CompareSections";

const Redirect = () => {
	React.useEffect(() => {
		window.location.href = 'https://www.youtube.com/watch?v=SVnF3x44rvU';
	}, []);
	return null;
};


function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/about" element={<About />} />
				<Route path="/compareSections" element={<CompareSections />} />
				<Route
					path="/awsome_stuff"
					element={
						<Redirect />
					}
				/>
				<Route path="/compareCourses" element={<CompareCourses />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
