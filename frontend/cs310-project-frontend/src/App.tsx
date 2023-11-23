import React from 'react';
import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Home";
import About from "./About";
import CompareCourses from "./CompareCourses";

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/about" element={<About />} />
				{/* add more routes here */}
				<Route path="/compareCourses" element={<CompareCourses />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
