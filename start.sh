#!/bin/bash

# Store the base directory
BASE_DIR="$(pwd)"

# Start the backend server
echo "Starting Go backend server..."
cd "$BASE_DIR/backend" && go run main.go &
BACKEND_PID=$!

# Wait for backend to start
sleep 2

echo "Backend server started on http://localhost:7070"
echo "Access slideshow at http://localhost:7070/slideshow"

# Start the frontend development server
echo "Starting React frontend development server..."
cd "$BASE_DIR/frontend" && npm start &
FRONTEND_PID=$!

echo "Frontend development server started on http://localhost:3000"
echo "Access development mode slideshow at http://localhost:3000/slideshow"
echo "Access the test form at http://localhost:3000/test-form.html"

# Handle script termination
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT TERM
wait
