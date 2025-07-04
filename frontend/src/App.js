import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Slideshow from './pages/Slideshow';
import Home from './pages/Home';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/slideshow" element={<Slideshow />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
