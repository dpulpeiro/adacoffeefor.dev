ARG NODE_VERSION=16.17.0-slim
FROM node:$NODE_VERSION  as build
WORKDIR /app

COPY package*.json .

RUN npm ci
COPY . .
RUN npm run build

ARG NGINX_VERSION=1.23.1-alpine

FROM nginx:1.23.1-alpine

EXPOSE 80
COPY --from=build /app/build/ /usr/share/nginx/html
COPY ./devops/prod/nginx.conf /etc/nginx/conf.d/default.conf
