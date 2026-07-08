# Dockerized Articles App

This project is a full-stack articles management application containerized with Docker Compose. It includes a Node.js backend, a static frontend, a MySQL database, and an observability stack with Prometheus, Grafana, Loki, and Promtail.

## Overview

The application allows users to create and view articles through a simple web interface. The frontend communicates with the backend through Nginx, and the backend stores article data in MySQL.

## Features

- Create and view articles from a simple UI
- REST API for article management
- MySQL persistence for application data
- Reverse proxy with Nginx
- Monitoring and logging with Prometheus, Grafana, Loki, and Promtail
- Docker-based setup for local development and deployment

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
│   └── provisioning/datasources/datasource.yml
├── monitoring/
│   ├── loki-config.yml
│   └── promtail-config.yml
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

The system is composed of the following services:

- Frontend: serves the web UI using Nginx
- Backend: Node.js API built with Express
- Database: MySQL 8.0
- Nginx: routes requests between the frontend and backend
- Prometheus: collects metrics
- Grafana: visualizes metrics and dashboards
- Loki/Promtail: collect and ship logs
- cAdvisor: monitors container performance
- Node Exporter: exposes host and container system metrics

## Prerequisites

Make sure the following tools are installed:

- Docker
- Docker Compose

## Getting Started

1. Clone the repository:

```bash
git clone <repository-url>
cd app
```

2. Build and start all services:

```bash
docker compose up --build -d
```

3. Check the running containers:

```bash
docker compose ps
```

## Access the Application

Once the containers are running, you can access:

- Frontend UI: http://localhost
- Backend API: http://localhost/api
- Health check: http://localhost/api/health
- Grafana: http://localhost:3001
- Prometheus: http://localhost:9090
- cAdvisor: http://localhost:8082
- Node Exporter: http://localhost:9100
- Loki: http://localhost:3100

## API Endpoints

### Health Check

- GET /api/health

Returns the health status of the backend service.

### Get All Articles

- GET /api/articles

Returns all articles ordered by creation date descending.

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

The MySQL database is initialized automatically using [mysql/init.sql](mysql/init.sql). It creates an articles table with the following columns:

- id
- title
- description
- created_at

## Monitoring and Logging

The monitoring stack is configured as follows:

- Prometheus scrapes metrics from cAdvisor and Node Exporter
- Grafana uses Prometheus as the default data source
- Loki and Promtail collect and forward container logs

## Stopping the Services

To stop all running containers:

```bash
docker compose down
```

To stop and remove volumes as well:

```bash
docker compose down -v
```

## Notes

- The frontend communicates with the backend through the Nginx reverse proxy.
- The backend waits for MySQL to become ready before starting.
- Default database credentials are configured in [docker-compose.yml](docker-compose.yml).
