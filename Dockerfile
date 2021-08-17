#Usar la imagen oficial, fase y alias: development
FROM node:14.15-alpine
#dependencias
RUN apk update && apk add bash && apk add mysql-client
#carpeta de trabajo dentro del container
WORKDIR /nestjs
#copiar a la carpeta de trabajo
COPY package*.json ./
#Instalar solo dependencias 
RUN npm install 