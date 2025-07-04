FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
# Copy package.json and package-lock.json first for better caching
COPY frontend/package*.json ./
RUN npm install
# Copy frontend source code and build
COPY frontend/ ./
RUN npm run build

FROM golang:1.24-alpine AS backend-builder
WORKDIR /app
# Copy go.mod and go.sum first for better caching
COPY backend/go.mod backend/go.sum ./
RUN go mod download
# Copy backend source code and build
COPY backend/ ./
RUN CGO_ENABLED=0 GOOS=linux go build -o slideshow-server .

# Final stage
FROM alpine:3.17
RUN apk --no-cache add ca-certificates
WORKDIR /app
# Copy the built artifacts
COPY --from=backend-builder /app/slideshow-server .
COPY --from=frontend-builder /app/frontend/build ./frontend/build

# Set environment variables
ENV PORT=8080

# Expose the port
EXPOSE 8080

# Run the application
CMD ["/app/slideshow-server"]
