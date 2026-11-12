# Build the Vite app and serve the static bundle with nginx.
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Non-root nginx (listens on 8080), OS packages patched to fixed versions at build time.
FROM nginxinc/nginx-unprivileged:1-alpine
USER root
RUN apk upgrade --no-cache
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
USER 101
EXPOSE 8080
