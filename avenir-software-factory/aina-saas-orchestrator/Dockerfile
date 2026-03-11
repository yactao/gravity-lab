FROM node:20-alpine

WORKDIR /app

# Installation de OpenSSL, requis par Prisma sur Alpine
RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm install

# Copier le schéma Prisma et générer le client
COPY prisma ./prisma
RUN npx prisma generate

# Copier le reste du code
COPY . .

# On compile le TypeScript et on démarre (Utilisation de ts-node en fallback si pas de build structuré)
CMD ["npx", "ts-node", "src/server.ts"]
