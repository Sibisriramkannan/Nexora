FROM node:18-alpine

# Install system dependencies
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create logs directory
RUN mkdir -p logs

# Expose ports
EXPOSE 8080
EXPOSE 50051

# Start the application
CMD ["npm", "start"]