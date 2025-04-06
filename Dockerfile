# Build frontend
FROM node:18-alpine AS frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# Build backend
FROM golang:1.21-alpine AS backend
WORKDIR /app/backend
COPY backend/go.mod backend/go.sum ./
RUN go mod download
COPY backend/ .
RUN go build -o main ./cmd/main.go

# Final stage
FROM alpine:latest
WORKDIR /app

# Copy frontend build
COPY --from=frontend /app/frontend/.next /app/frontend/.next
COPY --from=frontend /app/frontend/public /app/frontend/public
COPY --from=frontend /app/frontend/package*.json /app/frontend/
COPY --from=frontend /app/frontend/node_modules /app/frontend/node_modules

# Copy backend binary
COPY --from=backend /app/backend/main /app/backend/main

# Install Node.js for running frontend
RUN apk add --no-cache nodejs npm

# Set environment variables
ENV PORT=8080
ENV NODE_ENV=production

# Start both services
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

CMD ["/app/start.sh"] 