# A3_Containerize-the-stack

A containerized to-do list CRUD API built with Node.js, Express, PostgreSQL, Docker, and Docker Compose - create, read, update, and delete tasks with persistent storage, parameterized queries, interactive Swagger UI docs, and a reproducible multi-container setup.

Built as **Assignment A3 - Containerize the stack** for the [FlyRank Internship](https://internship.flyrank.ai/), Backend Track, Week 3. This is the direct sequel to **Assignment A2 - Connecting your CRUD to the database**: same API, same PostgreSQL-backed persistence, now packaged so the app and database can run together with Docker Compose.

## Why Docker

A2 required a local Node.js app plus a local PostgreSQL server. That works, but it depends on each developer's machine having the right Node version, database setup, database name, username, password, and ports available.

This assignment moves the stack into containers. Docker builds the API image, Compose starts the API and PostgreSQL together, and the services talk over Docker's internal network. The result is a more repeatable setup: clone the project, copy the environment file, and run one Compose command.

## Where the data lives

Tasks are stored in a `tasks` table inside the PostgreSQL container. The API connects through the `DATABASE_URL` env var:

```env
DATABASE_URL=postgresql://todo_user:todo_password@db:5432/tasks_db
```

Inside Docker Compose, `db` is the hostname of the PostgreSQL service. The database files are stored in the named Docker volume `postgres-data`, so data survives normal container restarts.

The `tasks` table and three seed rows are created automatically on API startup by [db.js](db.js). Restarting the stack does not duplicate the seed rows because seeding only happens when the table is empty.

## Running it

Make sure Docker Desktop is running, then:

```bash
cp .env.example .env
docker compose up --build
```

Then `GET http://localhost:3008/tasks` returns the seeded tasks from PostgreSQL.

Useful URLs:

- API info: http://localhost:3008/
- Health check: http://localhost:3008/health
- Tasks: http://localhost:3008/tasks
- Swagger UI: http://localhost:3008/docs

The API listens on port `3000` inside the container, but the Compose file publishes it to `3008` on the host machine:

```text
localhost:3008 -> api container:3000
```

If port `3008` is already busy, change `HOST_PORT` in `.env`, for example:

```env
HOST_PORT=3009
```

## Database viewer

pgweb is included as an optional Compose profile:

```bash
docker compose --profile tools up --build
```

Then open http://localhost:8081 to inspect the `tasks_db` database in the browser.

## Useful Docker commands

```bash
docker compose ps
docker compose logs api
docker compose logs db
docker compose down
docker compose down -v
```

Use `docker compose down -v` only when you want to delete the `postgres-data` volume and reset the database.

## API endpoints

- `GET /` - API metadata
- `GET /health` - health check
- `GET /tasks` - list all tasks
- `GET /tasks/filter?done=true` - filter tasks by completion status
- `GET /tasks/:id` - get a single task
- `POST /tasks` - create a task
- `PUT /tasks/:id` - update a task
- `DELETE /tasks/:id` - delete a task
