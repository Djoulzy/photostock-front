# Étape de build avec Node.js
FROM node:18-alpine AS build

WORKDIR /app

# Copier les fichiers de configuration et installer les dépendances
COPY package.json package-lock.json ./
RUN npm install

# Copier le reste du code et construire l'application
COPY . .
RUN npm run build

# Étape de production avec Nginx
FROM nginx:alpine

# Copier les fichiers build de React dans le dossier Nginx
COPY --from=build /app/build /usr/share/nginx/html
LABEL Name=photostock-front Version=0.0.1

# Exposer le port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]