# Dockerfile for Nexora Linux Agent

FROM golang:1.21-alpine AS builder

WORKDIR /build

# Install dependencies
RUN apk add --no-cache git ca-certificates

# Copy source
COPY go.mod ./
RUN go mod download

# Copy source
COPY agent.go ./

# Build
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o agent agent.go

# Final image
FROM alpine:latest

# Install ca-certificates for HTTPS
RUN apk --no-cache add ca-certificates tzdata

WORKDIR /app

# Copy binary
COPY --from=builder /build/agent /app/agent
COPY config.yaml /app/config.yaml

# Create directories
RUN mkdir -p /var/log/nexora /var/lib/nexora

# Make executable
RUN chmod +x /app/agent

# Non-root user
RUN adduser -D -u 1000 nexora
USER nexora


ENTRYPOINT ["/app/agent"]
CMD ["-config", "/app/config.yaml"]