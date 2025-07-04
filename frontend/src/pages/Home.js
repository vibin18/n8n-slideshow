import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="home-container">
      <h1>Live Slideshow API Demo</h1>
      <p>
        This application demonstrates a live-updating slideshow powered by WebSockets.
        Send API requests to update the slideshow in real-time.
      </p>
      <p>
        <Link to="/slideshow">View Slideshow</Link>
      </p>
      <div className="api-info">
        <h2>API Documentation</h2>
        <pre>{`
POST /api/slideshow

Request Body:
{
  "image": "base64 encoded image", 
  "text": [
    { "content": "Welcome!", "x": 100, "y": 150, "fontSize": 24 },
    { "content": "Slide animations made easy", "x": 100, "y": 200 }
  ],
  "text-color": "white",
  "transition-effect": "fade",
  "transition-time": 20 
}
        `}</pre>
      </div>
    </div>
  );
};

export default Home;
