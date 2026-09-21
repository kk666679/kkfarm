FROM node:20-alpine AS builder

WORKDIR /app

COPY apps/web/package.json ./
RUN npm install

COPY apps/web/tsconfig*.json ./
COPY apps/web/vite.config.ts ./
COPY apps/web/tailwind.config.js ./
COPY apps/web/postcss.config.js ./
COPY apps/web/index.html ./
COPY apps/web/src ./src

RUN npm run build --workspace=apps/web

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY infrastructure/docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 5173
CMD ["nginx", "-g", "daemon off;"]
