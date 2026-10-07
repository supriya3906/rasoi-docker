# Rasoi - Dockerized Full Stack (Short Version)

React (Vite) frontend + Node.js/Express backend, containerized with Docker.
Frontend runs on nginx (port 3000) and proxies `/api` to the backend (port 5000).

## Structure
```
rasoi-docker/
├── docker-compose.yml
├── backend/    (Dockerfile, .dockerignore, package.json, src/server.js)
└── frontend/   (Dockerfile, .dockerignore, nginx.conf, package.json,
                 vite.config.js, index.html, src/main.jsx, src/App.jsx, src/index.css)
```

## Run locally
```bash
docker compose build
docker compose up -d
```
Open http://localhost:3000  |  API health: http://localhost:5000/api/health

Stop: `docker compose down`

## Run without Docker (quick test)
```bash
cd backend  && npm install && npm start      # terminal 1
cd frontend && npm install && npm run dev    # terminal 2 -> http://localhost:5173
```

## Push source to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<github-username>/rasoi.git
git push -u origin main
```

## Push images to Docker Hub
```bash
docker login
docker tag rasoi-backend:latest  <dockerhub-username>/rasoi-backend:v1
docker push <dockerhub-username>/rasoi-backend:v1
docker tag rasoi-frontend:latest <dockerhub-username>/rasoi-frontend:v1
docker push <dockerhub-username>/rasoi-frontend:v1
```

## Validate (pull images)
```bash
docker pull <dockerhub-username>/rasoi-backend:v1
docker pull <dockerhub-username>/rasoi-frontend:v1
```
