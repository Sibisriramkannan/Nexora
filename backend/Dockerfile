FROM node:18-alpine

RUN apk add --no-cache python3 make g++
WORKDIR /app

# package.json + lockfile are the dependency contract. npm ci is deterministic and installs automatically.
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY . .
RUN mkdir -p logs

EXPOSE 8080 50051
CMD ["npm", "start"]
