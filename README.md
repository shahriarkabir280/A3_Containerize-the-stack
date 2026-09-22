# A3_Containerize-the-stack

A containerized to-do list CRUD API built with Node.js, Express, PostgreSQL, and Docker Compose.

This is Assignment A3 for the FlyRank Internship Backend Track. It packages the A2 Postgres-backed CRUD API into containers so the API, database, and optional database viewer can be started with one command.

## Stack

- API: Node.js, Express, `pg`
- Database: PostgreSQL
- Docs: Swagger UI at `/docs`
- Containers: Dockerfile + Docker Compose
- Optional DB viewer: pgweb

## Files Added For A3

- `Dockerfile` builds the production API image.
- `docker-compose.yml` runs the API and Postgres together.
- `.dockerignore` keeps local-only files out of the image.
- `.env.example` documents the Compose environment variables.

## Run With Docker Compose

```bash
cp .env.example .env
docker compose up --build
```

Then open:

- API info: http://localhost:3000/
- Health check: http://localhost:3000/health
- Tasks: http://localhost:3000/tasks
- Swagger UI: http://localhost:3000/docs

The API waits for Postgres to pass its health check before starting. On first startup, the app creates the `tasks` table and seeds three sample tasks if the table is empty.

## Run With pgweb

pgweb is included as an optional Compose profile:

```bash
docker compose --profile tools up --build
```

Then open http://localhost:8081 to inspect the `tasks_db` database.

## Useful Commands

```bash
docker compose ps
docker compose logs api
docker compose down
docker compose down -v
```

Use `docker compose down -v` only when you want to delete the Postgres volume and reset the database data.

## API Endpoints

- `GET /` - API metadata
- `GET /health` - health check
- `GET /tasks` - list tasks
- `GET /tasks/filter?done=true` - filter tasks by completion status
- `GET /tasks/:id` - get one task
- `POST /tasks` - create a task
- `PUT /tasks/:id` - update a task
- `DELETE /tasks/:id` - delete a task
