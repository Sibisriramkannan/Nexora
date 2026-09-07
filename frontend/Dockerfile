FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
# Frontend currently ships without a lockfile. Install from package.json automatically;
# once frontend/package-lock.json is committed, this can safely become npm ci.
RUN npm install --omit=dev
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
