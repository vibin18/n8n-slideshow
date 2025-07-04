# Live Photo Slideshow Web Service

An API-driven live photo slideshow web service using Golang as backend and React as frontend. This application allows real-time updating of slideshow content through a REST API and WebSocket connections.

## Project Structure

```
slideshow-master/
├── backend/             # Golang backend
│   ├── api/             # API definitions
│   ├── handlers/        # HTTP handlers
│   ├── models/          # Data models
│   └── main.go          # Entry point
└── frontend/            # React frontend
    ├── public/          # Static files
    └── src/             # React source code
        ├── components/  # React components
        ├── pages/       # Page components
        └── utils/       # Utility functions
```

## Features

- REST API for updating slideshow content
- WebSocket-based real-time updates
- Support for base64-encoded images
- Customizable text overlays with positioning and styling
- Transition effects

## API Documentation

The backend API accepts POST requests to `/api/slideshow` with the following JSON schema:

```json
{
  "image": "base64 encoded image", 


,
  "text-color": "white",
  "transition-effect": "fade",
  "transition-time": 20 
}
```

## Getting Started

### Using Makefile

This project includes a Makefile to simplify common development tasks:

```bash
# Install dependencies
make deps

# Build the project
make build

# Run the application locally
make run

# Build Docker image
make docker-build

# Run in Docker container
make deploy

# Show all available commands
make help
```

### Using Docker

You can build and run the application using Docker:

```bash
# Build the Docker image
docker build -t slideshow-api .

# Run the container
docker run -p 8080:8080 slideshow-api
```

The Docker image uses a multi-stage build process to create a lightweight production image.

### Prerequisites

- Go 1.16+ 
- Node.js 14+ and npm

### Running the Backend

```bash
cd backend
go mod tidy
go run main.go
```

The backend server will start on port 8080.

### Running the Frontend

In a new terminal:

```bash
cd frontend
npm install
npm start
```

The React development server will start on port 3000.

### Viewing the Slideshow

Open your browser and navigate to:
- Development mode: http://localhost:3000/slideshow
- Production mode: http://localhost:8080/slideshow

### Updating the Slideshow

Send a POST request to `/api/slideshow` with the required JSON payload. For example:

```bash
curl -X POST http://localhost:8080/api/slideshow \
  -H "Content-Type: application/json" \
  -d '{
    "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD...",
    "text": [
      { "content": "Welcome!", "x": 100, "y": 150, "fontSize": 24 },
      { "content": "Slide animations made easy", "x": 100, "y": 200 }
    ],
    "text-color": "white",
    "transition-effect": "fade",
    "transition-time": 20
  }'
```

## Building for Production

### Frontend

```bash
cd frontend
npm run build
```

This will create optimized production files in the `frontend/build` directory.

### Backend

The Go backend will serve the static files from the `frontend/build` directory in production mode.

## License

MIT
