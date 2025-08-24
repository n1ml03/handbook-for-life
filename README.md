# Handbook

A modern, full-stack handbook and data management system for DOAXVV (Dead or Alive Xtreme Venus Vacation), featuring a robust Bun/Express backend and a beautiful React 19 frontend.

---

## 🚀 Overview

- **Backend**: High-performance RESTful API (Bun + Express + TypeScript + MySQL)
- **Frontend**: Modern, responsive SPA (React 19 + Vite + Tailwind CSS)
- **Monorepo**: Both apps in a single repository for easy development and deployment

---

## 📦 Project Structure

```
handbook-for-life/
├── backend/    # Bun/Express API server (see backend/README.md)
├── frontend/   # React 19 SPA (see frontend/README.md)
├── package.json
├── README.md   # (this file)
└── ...
```

---

## ⚡ Quick Start

### Prerequisites
- [Bun](https://bun.sh/) >= 1.0
- [Node.js](https://nodejs.org/) >= 18 (for frontend compatibility)
- [MySQL](https://www.mysql.com/) >= 8.0

### 1. Clone & Install
```bash
git clone <repository-url>
cd handbook-for-life
bun run install:all
```

### 2. Setup Environment
- Copy `.env.example` to `.env` in both `backend/` and `frontend/` and adjust as needed.
- See each app's README for details.

### 3. Database Setup
- Create a MySQL database and user (see backend/README.md for SQL commands).
- Run migrations and seeds:
```bash
cd backend
bun run local-setup --seed
```

### 4. Start Development
```bash
# Set up with sample data
bun run local-setup --seed

# Start development with debug support
bun run dev:debug

# Start with verbose SQL logging
bun run dev:verbose
```

---

## 📚 Documentation

- **Backend API**: [backend/README.md](./backend/README.md)
- **Frontend App**: [frontend/README.md](./frontend/README.md)
- **API Docs (Swagger)**: http://localhost:3001/api-docs (when backend is running)