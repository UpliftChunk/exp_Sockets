FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
ARG BACKEND_CONTAINER_NAME
ENV REACT_APP_BACKEND_HOST_NAME=${BACKEND_CONTAINER_NAME}
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=build /app/build /app
EXPOSE 3000
CMD ["npx", "serve", "-s", "/app"]
