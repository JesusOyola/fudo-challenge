# Fudo Challenge App

Aplicación Angular desarrollada como parte de un desafío técnico. El proyecto incluye:

- Desarrollo con Angular 19
- Tests con Karma y Jasmine
- Build optimizado para producción
- Contenedor Docker con NGINX
- Despliegue automático a GitHub Pages usando GitHub Actions


### Requisitos

- Node.js 20+
- Angular CLI
- Docker (opcional, para servir en producción)
- Navegador moderno

##  Cómo levantar el proyecto localmente

### 1. Clonar el repositorio


git clone https://github.com/JesusOyola/fudo-challenge.git
cd fudo-challenge-app
- npm install
- npm start

##  Build Docker

- docker build -t fudo-challenge-app .
- docker run -p 80:80 fudo-challenge-app