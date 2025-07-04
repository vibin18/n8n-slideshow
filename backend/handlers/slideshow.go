package handlers

import (
	"encoding/json"
	"net/http"
	"sync"

	"slideshow/models"

	"github.com/gorilla/websocket"
)

// SlideshowHandler manages slideshow data and client connections
type SlideshowHandler struct {
	// Current slide data
	currentSlide models.SlideData
	
	// Mutex for thread-safe operations
	mutex sync.RWMutex
	
	// Connected WebSocket clients
	clients map[*websocket.Conn]bool
	
	// Mutex to protect writes to each connection
	writeMutexes map[*websocket.Conn]*sync.Mutex
	
	// WebSocket upgrader
	upgrader websocket.Upgrader
}

// NewSlideshowHandler creates a new slideshow handler
func NewSlideshowHandler() *SlideshowHandler {
	return &SlideshowHandler{
		clients: make(map[*websocket.Conn]bool),
		writeMutexes: make(map[*websocket.Conn]*sync.Mutex),
		upgrader: websocket.Upgrader{
			ReadBufferSize:  1024,
			WriteBufferSize: 1024,
			// Allow all origins
			CheckOrigin: func(r *http.Request) bool { return true },
		},
	}
}

// UpdateSlide updates the current slide data and broadcasts to all clients
func (h *SlideshowHandler) UpdateSlide(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Decode the request body
	var slideData models.SlideData
	err := json.NewDecoder(r.Body).Decode(&slideData)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Update the current slide data
	h.mutex.Lock()
	h.currentSlide = slideData
	h.mutex.Unlock()

	// Broadcast to all clients
	h.broadcastToClients()

	// Return success response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "success"})
}

// HandleWebSocket handles WebSocket connections
func (h *SlideshowHandler) HandleWebSocket(w http.ResponseWriter, r *http.Request) {
	// Upgrade HTTP connection to WebSocket
	conn, err := h.upgrader.Upgrade(w, r, nil)
	if err != nil {
		http.Error(w, "Could not upgrade connection", http.StatusInternalServerError)
		return
	}

	// Register new client
	h.mutex.Lock()
	h.clients[conn] = true
	h.writeMutexes[conn] = &sync.Mutex{} // Create a dedicated mutex for this connection
	h.mutex.Unlock()

	// Send current slide data to new client
	h.sendCurrentSlide(conn)

	// Handle client disconnect
	go h.handleDisconnect(conn)
}

// GetCurrentSlide returns the current slide data
func (h *SlideshowHandler) GetCurrentSlide(w http.ResponseWriter, r *http.Request) {
	h.mutex.RLock()
	slideData := h.currentSlide
	h.mutex.RUnlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(slideData)
}

// broadcastToClients sends the current slide data to all connected clients
func (h *SlideshowHandler) broadcastToClients() {
	h.mutex.RLock()
	// Make a copy of what we need to work with while under the read lock
	slideData := h.currentSlide
	// Create a list of clients to avoid holding the lock while sending
	clients := make([]*websocket.Conn, 0, len(h.clients))
	for client := range h.clients {
		clients = append(clients, client)
	}
	h.mutex.RUnlock()

	// Send to each client with proper synchronization
	for _, client := range clients {
		// Get the write mutex for this connection
		h.mutex.RLock()
		mutex, exists := h.writeMutexes[client]
		h.mutex.RUnlock()
		
		if !exists {
			continue // Client may have disconnected
		}
		
		// Lock the connection's write mutex
		mutex.Lock()
		err := client.WriteJSON(slideData)
		mutex.Unlock()
		
		if err != nil {
			// If error occurs, remove client
			client.Close()
			
			// Clean up our maps
			h.mutex.Lock()
			delete(h.clients, client)
			delete(h.writeMutexes, client)
			h.mutex.Unlock()
		}
	}
}

// sendCurrentSlide sends the current slide data to a specific client
func (h *SlideshowHandler) sendCurrentSlide(conn *websocket.Conn) {
	// Get the current slide data
	h.mutex.RLock()
	slideData := h.currentSlide
	mutex, exists := h.writeMutexes[conn]
	h.mutex.RUnlock()
	
	if !exists {
		return // Client may have disconnected
	}
	
	// Lock the connection's write mutex
	mutex.Lock()
	defer mutex.Unlock()
	conn.WriteJSON(slideData)
}

// handleDisconnect handles client disconnection
func (h *SlideshowHandler) handleDisconnect(conn *websocket.Conn) {
	// Read messages until error occurs (disconnect)
	for {
		_, _, err := conn.ReadMessage()
		if err != nil {
			break
		}
	}

	// Remove client from maps
	h.mutex.Lock()
	delete(h.clients, conn)
	delete(h.writeMutexes, conn)
	h.mutex.Unlock()
	conn.Close()
}
