# 🪙 Crypto Stream Pipeline

A backend Node.js app that simulates real-time crypto pricing using RabbitMQ, Redis, and PostgreSQL.  
It streams price updates for various crypto assets, stores them in Redis, and syncs the latest prices into a PostgreSQL database.

---

## 🚀 Features

- 📤 Publisher pushes simulated crypto price updates to RabbitMQ
- 📩 Consumer stores price updates in Redis (as a list/stream per asset)
- 🔁 Redis-to-DB worker consumes Redis streams and updates PostgreSQL
- 🐳 Full Docker Compose support
- 🔁 Supports local and container-based execution

---

## 📦 Stack

- Node.js + ES Modules
- RabbitMQ (AMQP) with quorum queue
- Redis (stream + list)
- PostgreSQL (with auto table creation)
- Docker + Docker Compose

---

## 📁 Project Structure

```
RABBIT-REDIS-PIPE/
├── config/              # App configuration
│   ├── config.js
│   ├── env.js           # Docker/local environment toggle
│   └── rascalConfig.js  # RabbitMQ Rascal config
│
├── db/
│   └── db.js            # PostgreSQL connection and auto table creation
│
├── workers/             # All pipeline workers
│   ├── consumer.js      # Reads from RabbitMQ, pushes to Redis
│   ├── publisher.js     # Sends fake crypto data to RabbitMQ
│   └── redisToDb.js     # BLPOPs Redis, updates PostgreSQL
│
├── app.js               # Runs all workers together (for local use)
```


---

## 🔧 Setup

### 1. Clone the repo

```bash
git clone https://github.com/DanielDimitrov5/crypto-pipeline.git
cd crypto-pipeline
```

---

### 2. 🧪 Run Locally (without Docker)

> Make sure RabbitMQ, Redis, and PostgreSQL are already running on your machine and mapped to:

- Redis → `localhost:6666`
- RabbitMQ → `localhost:3333`
- PostgreSQL → `localhost:5555`

#### Set the local flag

```js
// env.js
export default true;
```

#### Run the workers

```bash
node app.js
```

---

### 3. 🐳 Run with Docker Compose

#### Set the Docker flag

```js
// env.js
export default false;
```

#### Build and run everything

```bash
docker-compose up --build
```

This will:

- Start RabbitMQ (3333), Redis (6666), PostgreSQL (5555)
- Run all workers inside Docker
- Auto-create the `assets` table in Postgres

---

## 💻 Access

| Service      | URL / Port               |
|--------------|--------------------------|
| RabbitMQ UI  | http://localhost:4444    |
| Redis        | `localhost:6666`         |
| PostgreSQL   | `localhost:5555`         |

---

## 🗃 PostgreSQL Schema

```sql
CREATE TABLE assets (
  symbol TEXT PRIMARY KEY,
  price NUMERIC,
  updated_at TIMESTAMPTZ
);
```

This is auto-created by the app on first run.

---

## 🔐 Credentials

- **Postgres**: `postgres` / `yourpassword`
- **RabbitMQ**: `guest` / `guest`

---

## 🛠 To Do / Ideas

- Add REST API for querying asset prices
- WebSocket feed for live prices
- InfluxDB or TimescaleDB for historical tracking
- Tests with Jest or Vitest

---

## 📃 License

MIT — feel free to use, modify, or contribute.
