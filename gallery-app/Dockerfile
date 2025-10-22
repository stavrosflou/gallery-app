# Multi-stage build for Angular app
FROM node:18-alpine as builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --silent
COPY . .
RUN npm run build -- --output-path=dist

FROM nginx:stable-alpine
# Copy build files directly into nginx root
COPY --from=builder /app/dist/browser/ /usr/share/nginx/html/

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
