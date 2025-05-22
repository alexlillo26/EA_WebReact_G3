# Dockerfile para EA_WebReact_G3
FROM node:20-alpine AS build

# Verificar versiones
RUN node -v
RUN npm -v

WORKDIR /app

# Copia package.json y package-lock.json del subdirectorio reactweb del contexto
COPY reactweb/package*.json ./reactweb/
WORKDIR /app/reactweb 

# Instala dependencias. Usa --verbose para más detalle.
RUN npm install --verbose 

# --- Comandos de Diagnóstico (Importantes si npm install o el build fallan) ---
RUN echo "DIAGNÓSTICO WEBREACT: Contenido de /app/reactweb/ (post-install):" && ls -la && pwd
RUN echo "DIAGNÓSTICO WEBREACT: Contenido de /app/reactweb/node_modules/ (primer nivel, si existe):" && (ls -la node_modules/ | head -n 20) || echo "DIAGNÓSTICO WEBREACT: node_modules no encontrado o ls falló"
RUN echo "DIAGNÓSTICO WEBREACT: Buscando .bin en node_modules (si existe):" && (ls -la node_modules/.bin/) || echo "DIAGNÓSTICO WEBREACT: node_modules/.bin/ no encontrado"
RUN echo "DIAGNÓSTICO WEBREACT: Buscando react-scripts en .bin (si existe):" && (ls -la node_modules/.bin/react-scripts) || echo "DIAGNÓSTICO WEBREACT: node_modules/.bin/react-scripts no encontrado"
# --- Fin Comandos de Diagnóstico ---

# Copia el resto del código fuente de la app React (del subdirectorio reactweb del contexto)
COPY reactweb/ ./ 

# Ejecuta el build de React directamente usando la ruta relativa al ejecutable
RUN ./node_modules/.bin/react-scripts build

# Etapa de producción con nginx
FROM nginx:alpine
COPY --from=build /app/reactweb/build /usr/share/nginx/html
# Asegúrate que nginxWeb.conf esté en la raíz de tu contexto EA_WebReact_G3
COPY nginxWeb.conf /etc/nginx/conf.d/default.conf 
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]