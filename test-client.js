// Simple test client for the slideshow API
// Usage: node test-client.js [path-to-image]

const fs = require('fs');
const http = require('http');
const path = require('path');

// Get the image path from command line args or use a default text message
const imagePath = process.argv[2];

// Prepare the API request data
const prepareRequestData = async () => {
  let imageBase64 = '';
  
  // If an image path is provided, read and encode the image
  if (imagePath && fs.existsSync(imagePath)) {
    const imageBuffer = fs.readFileSync(imagePath);
    imageBase64 = imageBuffer.toString('base64');
    console.log(`Image loaded and encoded: ${imagePath}`);
  } else {
    console.log('No image provided or file not found. Sending text-only slide.');
  }

  // Prepare the request data
  const requestData = {
    image: imageBase64,
    text: [
      { content: "Welcome to the Live Slideshow!", x: 100, y: 150, fontSize: 32 },
      { content: `Current time: ${new Date().toLocaleTimeString()}`, x: 100, y: 200, fontSize: 24 },
      { content: "API-driven animations made easy", x: 100, y: 250, fontSize: 18 }
    ],
    "text-color": "white",
    "transition-effect": "fade",
    "transition-time": 5
  };

  return requestData;
};

// Send the API request
const sendApiRequest = async () => {
  try {
    const requestData = await prepareRequestData();
    
    // Convert the request data to JSON
    const jsonData = JSON.stringify(requestData);
    
    // Prepare the request options
    const options = {
      hostname: 'localhost',
      port: 7070,
      path: '/api/slideshow',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': jsonData.length
      }
    };
    
    // Send the request
    const req = http.request(options, (res) => {
      console.log(`Status Code: ${res.statusCode}`);
      
      res.on('data', (chunk) => {
        console.log(`Response: ${chunk}`);
      });
    });
    
    req.on('error', (error) => {
      console.error(`Error: ${error.message}`);
    });
    
    // Write the request data
    req.write(jsonData);
    req.end();
    
    console.log('API request sent successfully.');
  } catch (error) {
    console.error('Error sending API request:', error);
  }
};

// Execute the API request
sendApiRequest();
