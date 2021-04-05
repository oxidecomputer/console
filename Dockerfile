# build environment
FROM node:14-alpine as build
ARG api_url=https://console-git-main.internal.oxide.computer/api
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json ./
COPY yarn.lock ./
RUN yarn
COPY . ./
ENV API_URL=${api_url}
RUN yarn build

# production environment
FROM nginx:stable-alpine
COPY --from=build /app/dist/apps/web-console /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
