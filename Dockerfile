# Étape de build avec Node.js
FROM node:23-alpine3.21 AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
COPY .env.docker ./.env
RUN npm run build

# Étape de production avec Nginx
# FROM nginx:alpine
# COPY --from=build /app/build /usr/share/nginx/html
# LABEL Name=photostock-front Version=0.0.1
# EXPOSE 80
# CMD ["nginx", "-g", "daemon off;"]

FROM node:23-alpine3.21
RUN apk add --no-cache xsel
WORKDIR /app
COPY --from=build /app/build ./build
RUN npm install -g serve
LABEL Name=photostock-front Version=0.0.1
EXPOSE 80
CMD ["serve", "-n", "-l",  "80", "-s", "build"]