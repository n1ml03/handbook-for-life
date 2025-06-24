# Handbook for Life

A comprehensive full-stack application for managing DOAXVV (Dead or Alive Xtreme Venus Vacation) game data with a modern React frontend and Node.js backend API.

## 🚀 Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd handbook-for-life

# Install all dependencies
bun run install:all

# Start development servers
bun run dev:backend   # Backend API (http://localhost:3001)
bun run dev:frontend  # Frontend App (http://localhost:5173)
```

## 📋 Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Development Workflow](#development-workflow)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Contributing](#contributing)

## 🌟 Overview

This project is a monorepo containing two main applications:

### **Backend API** (`/backend`)
- RESTful API server built with Express.js and TypeScript
- MySQL database with comprehensive game data schema
- Complete CRUD operations for all game entities
- Multi-language support (JP, EN, CN, TW, KR)
- Production-ready with proper error handling and validation

### **Frontend Application** (`/frontend`)
- Modern React 19 application with TypeScript
- Responsive design with Tailwind CSS
- Rich text editing with TipTap
- Advanced filtering and search capabilities
- Admin panel for content management
- Dark/Light theme support

## 🛠️ Technology Stack

### **Backend Technologies:**
- **Runtime**: Node.js with Bun
- **Framework**: Express.js 5.1.0
- **Language**: TypeScript 5.8.3
- **Database**: MySQL 8.0+ with mysql2 driver
- **Validation**: Zod for schema validation
- **CORS**: Configured for cross-origin requests

### **Frontend Technologies:**
- **Framework**: React 19.1.0 with TypeScript
- **Build Tool**: Vite 6.3.5
- **Styling**: Tailwind CSS 3.4.17
- **UI Components**: Radix UI primitives
- **Rich Text**: TipTap 2.14.0
- **State Management**: Zustand 5.0.5
- **Routing**: React Router DOM 7.6.2
- **Animations**: Framer Motion 12.18.1

## 🏗️ Project Structure

```
handbook-for-life/
├── backend/                    # Node.js API Server
│   ├── src/
│   │   ├── config/            # System configuration
│   │   ├── database/          # MySQL schema, migrations, seeds
│   │   ├── middleware/        # Error handling, validation
│   │   ├── models/            # 13 data models
│   │   ├── routes/            # 12 API route handlers
│   │   ├── services/          # 12 business logic services
│   │   ├── types/             # TypeScript definitions
│   │   ├── utils/             # Utility functions
│   │   └── server.ts          # Main application entry
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md              # Backend-specific documentation
│
├── frontend/                   # React Application
│   ├── src/
│   │   ├── components/        # UI Components
│   │   │   ├── admin/         # 8 admin components
│   │   │   ├── features/      # Feature-specific components
│   │   │   ├── layout/        # Layout components
│   │   │   └── ui/            # 14 reusable UI components
│   │   ├── contexts/          # React Context providers
│   │   ├── hooks/             # 5 custom React hooks
│   │   ├── pages/             # 16 main application pages
│   │   ├── services/          # API services & utilities
│   │   ├── styles/            # Global CSS and themes
│   │   ├── types/             # TypeScript definitions
│   │   ├── assets/            # Static assets
│   │   ├── App.tsx            # Main App component with routing
│   │   └── main.tsx           # Entry point
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── FRONTEND_README.md     # Frontend-specific documentation
│
├── package.json               # Workspace configuration
├── vercel.json                # Deployment configuration
└── README.md                  # This file
```

## 🚀 Installation & Setup

### Prerequisites
- **Node.js 18+** (recommended: use Bun for faster performance)
- **MySQL 8.0+**
- **Git**

### Step 1: Clone and Install Dependencies
```bash
# Clone the repository
git clone <repository-url>
cd handbook-for-life

# Install all dependencies (recommended)
bun run install:all

# Or install individually
bun run install:backend
bun run install:frontend
```

### Step 2: Database Setup
```bash
# Create MySQL database
mysql -u root -p
```

```sql
CREATE DATABASE doaxvv_handbook CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'doaxvv_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON doaxvv_handbook.* TO 'doaxvv_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Step 3: Environment Configuration

#### Backend Environment (`.env` in `/backend`)
```env
# Server Configuration
NODE_ENV=development
PORT=3001
HOST=0.0.0.0

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=doaxvv_handbook
DB_USER=doaxvv_user
DB_PASSWORD=your_password

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

#### Frontend Environment (`.env` in `/frontend`)
```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_APP_TITLE=Handbook for Life
```

### Step 4: Database Migration & Seeding
```bash
# Run database migrations
cd backend
bun run db:migrate

# Seed with sample data
bun run db:seed

# Or reset (migrate + seed)
bun run db:reset
```

### Step 5: Start Development Servers
```bash
# From root directory
bun run dev:backend   # Backend API (http://localhost:3001)
bun run dev:frontend  # Frontend App (http://localhost:5173)

# Or start individually
cd backend && bun run dev
cd frontend && bun run dev
```

## 💻 Development Workflow

### Available Scripts (Root Level)
```bash
# Development
bun run dev:frontend          # Start frontend dev server
bun run dev:backend           # Start backend dev server

# Building
bun run build:frontend        # Build frontend for production
bun run build:backend         # Build backend for production
bun run build:all             # Build both frontend and backend

# Installation
bun run install:frontend      # Install frontend dependencies
bun run install:backend       # Install backend dependencies
bun run install:all           # Install all dependencies

# Maintenance
bun run clean:frontend        # Clean frontend build artifacts
bun run clean:backend         # Clean backend build artifacts
bun run clean:all             # Clean everything including node_modules

# Code Quality
bun run lint:frontend         # Lint frontend code
bun run lint:backend          # Lint backend code
bun run lint:all              # Lint all code
```

### Backend Development
```bash
cd backend

# Development with hot reload
bun run dev

# Database operations
bun run db:migrate           # Run migrations
bun run db:seed              # Seed sample data
bun run db:reset             # Reset database

# Build & Production
bun run build               # Build for production
bun run start               # Start production server

# Health check
bun run health              # Check if server is running
```

### Frontend Development
```bash
cd frontend

# Development server
bun run dev                 # Start with hot reload
bun run dev --host         # Start with network access

# Building
bun run build              # Production build
bun run build:dev          # Development build
bun run build:analyze      # Build with bundle analysis

# Code Quality
bun run lint               # ESLint
bun run lint:fix           # ESLint with auto-fix
bun run type-check         # TypeScript type checking
bun run format             # Prettier formatting

# Preview
bun run preview            # Preview production build
bun run preview:host       # Preview with network access
```

## 🔌 API Documentation

### Core Endpoints
The backend provides comprehensive RESTful API endpoints:

```
GET    /api/health              # Health check and system status
GET    /api/characters          # List all characters with pagination
GET    /api/characters/:id      # Get specific character details
GET    /api/swimsuits           # List swimsuits with filtering
GET    /api/swimsuits/:id       # Get specific swimsuit details
GET    /api/skills              # List skills with categorization
GET    /api/skills/:id          # Get specific skill details
GET    /api/items               # List items with category filtering
GET    /api/bromides            # List bromides with sorting
GET    /api/episodes            # List story episodes
GET    /api/events              # List events with date filtering
GET    /api/documents           # List documentation
GET    /api/gachas              # List gacha information
GET    /api/shop-listings       # List shop items
GET    /api/update-logs         # List update logs
```

### API Features
- **Pagination**: All list endpoints support pagination (`page`, `limit`)
- **Sorting**: Flexible sorting with `sortBy` and `sortOrder` parameters
- **Filtering**: Entity-specific filters for advanced queries
- **Multi-language**: Support for JP, EN, CN, TW, KR languages
- **Validation**: Zod schema validation for all requests
- **Error Handling**: Consistent error responses with proper HTTP status codes

For detailed API documentation, see [`backend/README.md`](./backend/README.md).

## 📱 Frontend Features

### Application Pages (16 Pages)
- **🏠 HomePage** - Dashboard and timeline
- **👙 SwimsuitPage** - Swimsuit library (largest page at 43KB)
- **👭 GirlListPage** - Character listing
- **👧 GirlDetailPage** - Character details
- **🎯 SkillsPage** - Skills management
- **💎 AccessoryPage** - Accessories and items
- **🖼️ DecorateBromidePage** - Deco-Bromide collection
- **🏠 OwnerRoomPage** - Owner room management
- **📦 ItemsPage** - Game items
- **🛒 ShopPage** - Shop interface
- **🎪 FestivalPage** - Festival events
- **🎰 GachaPage** - Gacha system
- **💭 MemoriesPage** - Story and memories
- **📚 DocumentPage** - Documentation
- **👑 AdminPage** - System administration
- **❓ NotFoundPage** - 404 error page

### UI/UX Features
- **🎨 Dark/Light Theme** - System and manual theme switching
- **📱 Responsive Design** - Mobile-first approach
- **♿ Accessibility** - Screen reader support, keyboard navigation
- **✨ Animations** - Smooth transitions and micro-interactions
- **🔍 Advanced Search** - Multi-language search capabilities
- **📝 Rich Text Editor** - TipTap-powered content editing
- **⚡ Performance** - Lazy loading, code splitting, optimized bundles

For detailed frontend documentation, see [`frontend/FRONTEND_README.md`](./frontend/FRONTEND_README.md).

## 🚀 Deployment

### Backend Deployment
The backend is configured for deployment on various platforms:

```bash
# Build for production
cd backend
bun run build

# Start production server
bun run start

# Health check endpoint
curl http://localhost:3001/api/health
```

### Frontend Deployment
The frontend is optimized for static hosting:

```bash
# Build for production
cd frontend
bun run build

# The dist/ folder contains the built application
# Deploy the contents to your static hosting provider
```

### Vercel Deployment
The project includes `vercel.json` configuration for easy Vercel deployment:

```bash
# Deploy to Vercel
vercel

# Or connect your GitHub repository for automatic deployments
```

## 🤝 Contributing

### Development Guidelines
1. **Code Style**: Follow ESLint and Prettier configurations
2. **TypeScript**: Maintain strict type safety
3. **Testing**: Add tests for new features
4. **Documentation**: Update README files when adding features
5. **Git**: Use conventional commit messages

### Project Standards
- **Backend**: RESTful API design, proper error handling
- **Frontend**: Component-based architecture, responsive design
- **Database**: Proper migrations and seeding
- **Security**: Input validation, CORS configuration

### Getting Started with Contributions
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes and test thoroughly
4. Commit with conventional messages: `git commit -m "feat: add new feature"`
5. Push to your fork: `git push origin feature/your-feature`
6. Create a Pull Request

## 📄 License

This project is part of the Handbook for Life application. Please refer to the license file for usage terms.

## 🔗 Links

- **Backend Documentation**: [`backend/README.md`](./backend/README.md)
- **Frontend Documentation**: [`frontend/FRONTEND_README.md`](./frontend/FRONTEND_README.md)
- **API Health Check**: http://localhost:3001/api/health (when running)
- **Frontend App**: http://localhost:5173 (when running)

---