FROM node:20-alpine AS build
WORKDIR /app/frontend

ARG VITE_DEFAULT_API_BASE=https://kunitake.net/
ARG VITE_BUILD_OUTDIR=/app/frontend/viewer
ENV VITE_DEFAULT_API_BASE=${VITE_DEFAULT_API_BASE}
ENV VITE_BUILD_OUTDIR=${VITE_BUILD_OUTDIR}

COPY frontend/package*.json ./
RUN npm install

COPY frontend ./
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=build $VITE_BUILD_OUTDIR /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
