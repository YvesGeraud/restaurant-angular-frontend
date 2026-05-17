# Etapa 1: Construcción
FROM node:lts-alpine as build-step
WORKDIR /usr/src/app

# Copiar configuración y dependencias primero para aprovechar el caché
COPY package*.json ./
RUN npm ci

# Copiar el resto del código y compilar para producción
COPY . .
RUN npm run build -- --configuration=production

# Etapa 2: Servidor Web (Nginx) para servir archivos estáticos
FROM nginx:stable-alpine

# Copiar el resultado del build al directorio por defecto de Nginx
# Ajustado a 'dist/Frontend/browser' basado en la estructura de Angular 18
COPY --from=build-step /usr/src/app/dist/Frontend/browser /usr/share/nginx/html

# Copiar configuración personalizada de Nginx para manejar el routing de Angular
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Informar que el puerto 80 estará expuesto
EXPOSE 80

# Iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
