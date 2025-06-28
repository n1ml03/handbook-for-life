# DOAXVV Handbook Backend API

A modern, high-performance backend API for the DOAXVV Handbook, built with Bun, TypeScript, Express, and MySQL. This backend manages all game data, provides RESTful endpoints, and supports robust database management with migrations, seeding, and CSV import.

---

## 🟢 For Absolute Beginners: Quick Setup Guide

If you don't know anything about code, just follow these steps exactly. Copy and paste each command into your terminal (one at a time):

1. **Install Bun (if you haven't):**
   - Visit https://bun.sh/docs/installation and follow the instructions for your operating system.

2. **Go to the backend folder:**
   ```sh
   cd backend
   ```

3. **Install all required packages:**
   ```sh
   bun install
   ```

4. **Set up the database (create tables and sample data):**
   ```sh
   bun run setup
   ```

5. **(Optional) Import data from CSV files:**
   ```sh
   bun run import-csv
   ```

6. **Check if the server is running correctly:**
   ```sh
   bun run health-check
   ```

7. **Start the server in development mode:**
   ```sh
   bun run dev
   ```

8. **If you want to reset everything (delete and recreate all data):**
   ```sh
   bun run reset
   ```

---

## 📋 Table of Contents
- [DOAXVV Handbook Backend API](#doaxvv-handbook-backend-api)
  - [📋 Table of Contents](#-table-of-contents)
  - [🚀 Quick Start](#-quick-start)
  - [🏗️ Project Structure](#️-project-structure)
  - [🗄️ Database Management](#️-database-management)
    - [Key Scripts](#key-scripts)
  - [🔌 API Endpoints](#-api-endpoints)
  - [🛠️ Development Workflow](#️-development-workflow)
  - [🚨 Troubleshooting](#-troubleshooting)
  - [📚 Resources](#-resources)

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
cd backend
bun install

# 2. Configure environment
cp .env.example .env
nano .env  # Edit DB credentials, etc.

# 3. Setup database (migrate + seed sample data)
bun run db:setup

# 4. (Optional) Import CSV data
echo 'Place your CSV files in ./src/database/csv_data/'
bun run db:csv:import

# 5. Start development server
bun run dev
# Server: http://localhost:3001
```

---

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── config/         # App, DB, logger config
│   ├── database/       # Migrations, seeds, CSV import, README
│   ├── middleware/     # Error handling, validation
│   ├── models/         # Data models (Character, Swimsuit, etc.)
│   ├── routes/         # API route handlers
│   ├── services/       # Business logic
│   ├── types/          # TypeScript types
│   ├── utils/          # Helpers
│   └── server.ts       # App entry point
├── package.json        # Scripts & dependencies
├── .env.example        # Env template
└── README.md           # This file
```

---

## 🗄️ Database Management

**All database documentation, schema, and import instructions are in:**
- [`src/database/README.md`](src/database/README.md)

### Key Scripts

| Script                | Description                                 |
|-----------------------|---------------------------------------------|
| `db:migrate`          | Run DB migrations                           |
| `db:seed`             | Seed DB with sample data                    |
| `db:reset`            | Migrate & seed (reset DB)                   |
| `db:csv:import`       | Import all CSV files in correct order       |
| `db:csv:validate`     | Validate CSV files only (no import)         |
| `db:csv:help`         | Show CSV import usage/help                  |
| `db:status`           | Show migration & seed status                |
| `db:setup`            | Full setup: migrate + seed                  |

**Example:**
```bash
bun run db:migrate         # Migrate schema
bun run db:seed            # Seed sample data
bun run db:csv:import      # Import CSV data (see database/README.md)
```

**Database features:**
- MySQL 8+, UTF8MB4, strict foreign keys
- Multi-language support (JP, EN, CN, TW, KR)
- Optimized indexes, computed columns
- Automated migrations & seeding
- CSV import with dependency order & validation

---

## 🔌 API Endpoints

RESTful endpoints under `/api/*`. All responses are JSON, paginated, and follow a consistent format.

**Core resources:**
- `/api/characters`      — List/search characters
- `/api/swimsuits`      — List/search swimsuits
- `/api/skills`         — List/search skills
- `/api/items`          — List/search items
- `/api/bromides`       — List/search bromides
- `/api/episodes`       — List/search episodes
- `/api/events`         — List/search events
- `/api/gachas`         — List/search gachas
- `/api/shop-listings`  — List/search shop items
- `/api/documents`      — List/search documents
- `/api/update-logs`    — List update logs
- `/api/health`         — Health check

**Response example:**
```json
{
  "success": true,
  "data": [...],
  "pagination": { "page": 1, "limit": 10, "total": 100, "totalPages": 10 }
}
```

---

## 🛠️ Development Workflow

- **Start dev server:** `bun run dev` (auto-reloads)
- **Build for prod:**   `bun run build`
- **Lint:**             `bun run lint` / `bun run lint:fix`
- **Health check:**     `bun run health` or visit `/api/health`
- **Test endpoints:**   Use `curl`, Postman, or your frontend

**Environment:**
- Configure `.env` for DB, CORS, etc. (see `.env.example`)
- Supports local and production setups

---

## 🚨 Troubleshooting

- **DB connection failed:**
  - Check MySQL is running, credentials in `.env`, and network access
- **Port in use:**
  - Change `PORT` in `.env` or kill the process using it
- **CORS issues:**
  - Ensure `CORS_ORIGINS` in `.env` matches your frontend URL
- **Migration/seed errors:**
  - Check logs, ensure DB is clean, see `src/database/README.md`
- **CSV import errors:**
  - Validate CSVs: `bun run db:csv:validate`
  - See detailed errors in console

---

## 📚 Resources
- [Database & Import Guide](src/database/README.md)
- [Express.js](https://expressjs.com/)
- [MySQL](https://dev.mysql.com/doc/)
- [Bun](https://bun.sh/docs)
- [TypeScript](https://www.typescriptlang.org/docs/)
- [Zod](https://zod.dev/)

---

**For full database schema, import order, and advanced usage, see [`src/database/README.md`](src/database/README.md).**