package main

import (
	"log"
	"net/http"
	"os"
	"slideshow/api"
	"slideshow/handlers"
)

func main() {
	// Create a new slideshow handler
	slideshowHandler := handlers.NewSlideshowHandler()

	// Create CORS middleware handler
	corsMiddleware := api.CorsMiddleware

	// Define API routes with CORS
	http.Handle("/api/slideshow", corsMiddleware(http.HandlerFunc(slideshowHandler.UpdateSlide)))
	http.Handle("/api/slideshow/current", corsMiddleware(http.HandlerFunc(slideshowHandler.GetCurrentSlide)))
	http.Handle("/ws", corsMiddleware(http.HandlerFunc(slideshowHandler.HandleWebSocket)))

	// Serve static files for the frontend
	// Try different paths for flexibility between local dev and Docker environments
	staticDir := "../frontend/build" // Default for local development
	
	// Check if we're in Docker environment where path is different
	_, err := os.Stat("./frontend/build")
	if err == nil {
		staticDir = "./frontend/build" // Use Docker path
	}
	
	log.Printf("Using static file directory: %s", staticDir)
	fs := http.FileServer(http.Dir(staticDir))
	
	// Create a handler that serves static files but falls back to index.html for routes
	// This is necessary for React Router to work correctly
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// Special handling for known files
		if r.URL.Path == "/manifest.json" || r.URL.Path == "/favicon.ico" || 
		   r.URL.Path == "/asset-manifest.json" || r.URL.Path == "/test-form.html" || 
		   r.URL.Path == "/robots.txt" || 
		   r.URL.Path == "/logo192.png" || r.URL.Path == "/logo512.png" {
			fs.ServeHTTP(w, r)
			return
		}
		
		// Check if this is a static asset (CSS/JS files)
		if len(r.URL.Path) > 8 && r.URL.Path[:8] == "/static/" {
			fs.ServeHTTP(w, r)
			return
		}
		
		// For all other paths, serve index.html to support client-side routing
		http.ServeFile(w, r, staticDir+"/index.html")
	})

	// Start the server
	log.Println("Starting server on port 7070...")
	err = http.ListenAndServe(":7070", nil)
	if err != nil {
		log.Fatal("Error starting server: ", err)
	}
}
