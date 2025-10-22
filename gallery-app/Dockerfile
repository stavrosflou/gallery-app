# Multi-stage build for Angular app
FROM node:18-alpine as builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --silent
COPY . .
# use the correct angular cli flag name
RUN npm run build -- --output-path=dist

FROM nginx:stable-alpine
# Copy built files to nginx html folder
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
