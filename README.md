# Articles Blog with Docker Compose

This project is a simple articles management application built with a Node.js backend, a static frontend, a MySQL database, and several monitoring and observability services. It is fully containerized with Docker Compose for easy local development and deployment.

## Features

- Create and view articles through a simple web interface
- REST API for article management
- MySQL database persistence
- Nginx as the main entry point
- Monitoring with Prometheus, Grafana, and cAdvisor
- Container health checks and restart policies

## Project Structure

```text
.
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── Dockerfile
│   ├── app.js
│   ├── index.html
│   ├── nginx.conf
│   └── styles.css
├── grafana/
│   └── provisioning/
│       └── datasources/
│           └── datasource.yml
├── mysql/
│   └── init.sql
├── nginx/
│   └── nginx.conf
├── prometheus/
│   └── prometheus.yml
├── docker-compose.yml
└── README.md
```

## Architecture

The application consists of the following services:

- Frontend: serves the web UI using Nginx
- Backend: Node.js/Express API
- Database: MySQL 8.0
- Nginx: routes requests between frontend and backend
- Prometheus: collects metrics
- Grafana: visualizes metrics
- cAdvisor: monitors container performance
- Node Exporter: exposes system metrics

## Prerequisites

Make sure the following are installed on your machine:

- Docker
- Docker Compose

## Getting Started

1. Clone the repository:

```bash
git clone <repository-url>
cd app
```

2. Start all services:

```bash
docker compose up --build -d
```

3. Check running containers:

```bash
docker compose ps
```

## Access the Application

Once the containers are running, you can access the app at:

- Frontend UI: http://localhost
- Backend API: http://localhost/api
- Health check: http://localhost/api/health
- Grafana: http://localhost:3001
- Prometheus: http://localhost:9090
- cAdvisor: http://localhost:8082
- Node Exporter: http://localhost:9100

## API Endpoints

### Health Check

- GET /api/health

Returns the current health status of the backend service.

### Get All Articles

- GET /api/articles

Returns a list of articles ordered by creation date in descending order.

### Create an Article

- POST /api/articles

Request body:

```json
{
  "title": "Example Title",
  "description": "Example description"
}
```

## Database

The MySQL database is initialized automatically using the SQL script in [mysql/init.sql](mysql/init.sql). It creates the articles table with the following structure:

- id
- title
- description
- created_at

## Monitoring

The monitoring stack is configured as follows:

- Prometheus scrapes metrics from cAdvisor and Node Exporter
- Grafana uses Prometheus as its datasource
- Grafana is provisioned with a datasource configuration from [grafana/provisioning/datasources/datasource.yml](grafana/provisioning/datasources/datasource.yml)

## Stopping the Services

To stop all containers:

```bash
docker compose down
```

To stop and remove volumes as well:

```bash
docker compose down -v
```

## Notes

- The frontend communicates with the backend through the Nginx reverse proxy.
- The backend waits for the MySQL database to become ready before starting.
- Default database credentials are configured in [docker-compose.yml](docker-compose.yml).
