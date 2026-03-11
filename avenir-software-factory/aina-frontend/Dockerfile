# Etape 1 : Build de l'application React
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

# Argument pour brancher le front sur le bon backend à la compilation
ARG VITE_API_BASE
ENV VITE_API_BASE=$VITE_API_BASE

RUN npm run build

# Etape 2 : Service via Nginx ultra-léger
FROM nginx:alpine
# Copie de la configuration personnalisée Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copie des fichiers buildés
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
