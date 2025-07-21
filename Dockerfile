# Etapa 1: Compilar la aplicación Angular
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .
RUN npm run build 

# Etapa 2: Servir con Nginx
FROM nginx:stable-alpine

# Elimina la configuración por defecto de Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copia los archivos compilados de Angular
COPY --from=build /app/dist/fudo-challenge-app/browser /usr/share/nginx/html


# Opcional: reemplazar la config de Nginx con una custom (ver más abajo)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
