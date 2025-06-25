# DOAXVV Handbook Backend API

A comprehensive Bun backend API server for the DOAXVV (Dead or Alive Xtreme Venus Vacation) Handbook application, providing complete game data management and RESTful API endpoints.

## 🚀 Quick Start

```bash
# Install dependencies
cd backend
bun install

# Set up database (see Database Setup section)
# Copy .env.example to .env and configure

# Run development server
bun run dev

# Server will be available at http://localhost:3001
```

## 📋 Table of Contents

- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Database Setup](#database-setup)
- [API Documentation](#api-documentation)
- [Development Workflow](#development-workflow)
- [Environment Configuration](#environment-configuration)
- [Integration with Frontend](#integration-with-frontend)

## 🛠️ Technology Stack

- **Runtime**: Bun
- **Framework**: Express.js 5.1.0
- **Language**: TypeScript 5.8.3
- **Database**: MySQL 8.0+ with mysql2 driver
- **Validation**: Zod for schema validation
- **CORS**: Configured for local development
- **Logging**: Custom logger with structured output
- **Build Tool**: Bun for fast builds and package management

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── config/           # System configuration (app, database, logger)
│   ├── database/         # MySQL schema, migrations, sample data
│   ├── middleware/       # Error handling, validation, request processing
│   ├── models/           # 9 data models (Character, Swimsuit, Skill, etc.)
│   ├── routes/           # 12 API route handlers
│   ├── services/         # 8 business logic service classes
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions and helpers
│   └── server.ts         # Main application entry point
├── dist/                 # Compiled JavaScript output
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── .env.example          # Environment variables template
└── README.md            # This file
```

## 💾 Database Schema

The backend uses MySQL with a comprehensive schema designed for DOAXVV game data:

### Core Tables
- **characters** (16 columns) - Character information with multi-language support
- **swimsuits** (17 columns) - Swimsuit library with stats and attributes
- **skills** (10 columns) - Active/passive/potential skills system
- **items** (12 columns) - Game items and accessories
- **bromides** (10 columns) - Deco-Bromide card collection
- **episodes** (12 columns) - Story episodes and narratives
- **events** (10 columns) - Game events and campaigns
- **documents** (8 columns) - Documentation and guides

### Linking Tables
- **swimsuit_skills** - Many-to-many relationship between swimsuits and skills
- **gacha_pools** - Gacha pool items and rates

### Key Features
- Multi-language support (JP, EN, CN, TW, KR)
- Optimized indexes for performance
- UTF8MB4 character set for emoji support
- Generated columns for computed values
- Foreign key constraints for data integrity

## 🔌 API Endpoints

### Core Resources
All endpoints follow RESTful conventions with consistent response formats:

```
GET    /api/health              # Health check and system status
GET    /api/characters          # List all characters with pagination
GET    /api/characters/:id      # Get specific character details
GET    /api/swimsuits           # List swimsuits with filtering
GET    /api/swimsuits/:id       # Get specific swimsuit details
GET    /api/skills              # List skills with categorization
GET    /api/skills/:id          # Get specific skill details
GET    /api/items               # List items with category filtering
GET    /api/items/:id           # Get specific item details
GET    /api/bromides            # List bromides with sorting
GET    /api/bromides/:id        # Get specific bromide details
GET    /api/episodes            # List story episodes
GET    /api/episodes/:id        # Get specific episode details
GET    /api/events              # List events with date filtering
GET    /api/events/:id          # Get specific event details
GET    /api/documents           # List documentation
GET    /api/documents/:id       # Get specific document
GET    /api/update-logs         # List update logs
GET    /api/gachas              # List gacha information
GET    /api/shop-listings       # List shop items
```

### Response Format
All API responses follow a consistent structure:

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### Query Parameters
- `page` - Page number for pagination (default: 1)
- `limit` - Items per page (default: 10, max: 100)
- `sortBy` - Field to sort by
- `sortOrder` - Sort direction ('asc' or 'desc')
- Additional filters specific to each endpoint

## 🚀 Installation & Setup

### Prerequisites
- Bun 1.0+ (Fast all-in-one JavaScript runtime)
- MySQL 8.0+
- Git

### Step 1: Clone and Install Dependencies
```bash
# Clone the repository (if not already done)
git clone <repository-url>
cd handbook-for-life/backend

# Install dependencies using Bun (recommended)
bun install

```

### Step 2: Environment Configuration
```bash
# Copy the environment template
cp .env.example .env

# Edit .env file with your configuration
nano .env
```

Required environment variables:
```env
# Server Configuration
NODE_ENV=development
PORT=3001
HOST=0.0.0.0

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=doaxvv_handbook
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# CORS Configuration (for frontend integration)
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Step 3: Database Setup
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

```bash
# Import database schema
mysql -u doaxvv_user -p doaxvv_handbook < src/database/migrations/001_enhanced_schema_mysql.sql

# Import sample data (optional)
mysql -u doaxvv_user -p doaxvv_handbook < src/database/002_sample_data.sql
```

### Step 4: Start Development Server
```bash
# Start development server with auto-reload
bun run dev

# Server will be available at:
# - API: http://localhost:3001
# - Health Check: http://localhost:3001/api/health
# - API Documentation: http://localhost:3001 (root endpoint lists all available endpoints)
```

## 📋 Available Scripts

```bash
# Development
bun run dev          # Start development server with auto-reload
bun run build        # Build for production
bun run start        # Start production server

# Database
bun run db:migrate   # Run database migrations
bun run db:seed      # Seed database with sample data
bun run db:reset     # Reset database (migrate + seed)

# Code Quality
bun run lint         # Run ESLint
bun run lint:fix     # Fix ESLint issues automatically

# Testing
bun run health       # Test API health endpoint
```

## � Development Workflow

### Local Development
1. Start the backend server: `bun run dev`
2. Server runs on `http://localhost:3001`
3. API endpoints available at `http://localhost:3001/api/*`
4. Auto-reload on file changes

### Testing API Endpoints
```bash
# Health check
curl http://localhost:3001/api/health

# List characters
curl http://localhost:3001/api/characters

# Get specific character
curl http://localhost:3001/api/characters/1

# Test with pagination
curl "http://localhost:3001/api/characters?page=1&limit=5"
```

### Database Management
```bash
# Check database connection
mysql -u doaxvv_user -p doaxvv_handbook

# View tables
SHOW TABLES;

# Check character data
SELECT * FROM characters LIMIT 5;
```

## 🌍 Environment Configuration

### Required Environment Variables

Create a `.env` file in the backend directory with the following variables:

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
DB_PASSWORD=your_secure_password

# CORS Configuration (for frontend integration)
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# Logging Configuration
LOG_LEVEL=info
LOG_FORMAT=combined

# File Upload Configuration
MAX_FILE_SIZE=10mb
UPLOAD_PATH=uploads
```

### Environment-Specific Settings

**Development:**
- CORS allows all origins
- Detailed error messages
- Hot reload enabled
- Database connection pooling: 10 connections

**Production:**
- Restricted CORS origins
- Error messages sanitized
- Optimized connection pooling
- HTTPS enforcement (when configured)

## 🔗 Integration with Frontend

The backend is designed to work seamlessly with the React frontend:

### API Communication
- **Base URL**: `http://localhost:3001/api`
- **CORS**: Configured to allow frontend origins (`localhost:3000`, `localhost:5173`)
- **Response Format**: Consistent JSON structure with `success`, `data`, and `pagination` fields

### Frontend Integration Points
1. **Vite Proxy**: Frontend uses Vite proxy to route `/api/*` requests to backend
2. **Environment Variables**: Frontend uses `VITE_API_URL` to configure API base URL
3. **Type Safety**: Shared TypeScript types ensure consistency between frontend and backend

### Full-Stack Development Setup
```bash
# Terminal 1: Start backend
cd backend
bun run dev

# Terminal 2: Start frontend
cd frontend
bun run dev

# Access application
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001
# API Health: http://localhost:3001/api/health
```

## 🚨 Troubleshooting

### Common Issues

**Database Connection Failed:**
```bash
# Check MySQL service
sudo systemctl status mysql

# Test connection
mysql -u doaxvv_user -p doaxvv_handbook

# Verify environment variables
cat .env | grep DB_
```

**Port Already in Use:**
```bash
# Find process using port 3001
lsof -i :3001

# Kill process
kill -9 <PID>

# Or change port in .env
PORT=3002
```

**CORS Issues:**
```bash
# Check CORS configuration in .env
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# Verify frontend URL matches CORS origins
```

### Performance Optimization
- Database connection pooling (configurable via environment)
- Optimized database indexes
- Request ID tracking for debugging
- Structured logging for monitoring

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Zod Documentation](https://zod.dev/)
- [Bun Documentation](https://bun.sh/docs)