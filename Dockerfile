# Étape de build avec Node.js
FROM node:23.10-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
COPY .env.docker ./.env
RUN npm run build

# Étape de production avec Nginx
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
LABEL Name=photostock-front Version=0.0.1

# Exposer le port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]