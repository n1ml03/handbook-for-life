# 🎮 DOAXVV Handbook Backend API

<div align="center">

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Bun](https://img.shields.io/badge/Bun-000000?style=for-the-badge&logo=bun&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white)
![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)

**A modern, high-performance backend API for the DOAXVV Handbook**

*Built with Bun, TypeScript, Express, MySQL, and comprehensive Swagger documentation*

</div>

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

- [🚀 Quick Start](#-quick-start)
- [📚 API Documentation](#-api-documentation)
- [🏗️ Project Architecture](#️-project-architecture)
- [🛠️ Installation & Setup](#️-installation--setup)
- [🗄️ Database Management](#️-database-management)
- [🔌 API Endpoints](#-api-endpoints)
- [📱 Development Workflow](#-development-workflow)
- [🚦 Scripts & Commands](#-scripts--commands)
- [🔧 Configuration](#-configuration)
- [🚀 Production Deployment](#-production-deployment)
- [🐛 Troubleshooting](#-troubleshooting)
- [📖 Resources](#-resources)

---

## 🚀 Quick Start

### **For Absolute Beginners**

```bash
# 1. Navigate to backend directory
cd backend

# 2. Install dependencies
bun install

# 3. Setup database
bun run setup

# 4. Start development server
bun run dev

# 5. Open API documentation
bun run docs:open
# Or visit: http://localhost:3001/api-docs
```

### **For Developers**

```bash
# Install and setup
bun install && bun run db:setup

# Start with hot reload
bun run dev

# View interactive API docs
open http://localhost:3001/api-docs

# Health check
curl http://localhost:3001/api/health
```

---

## 📚 API Documentation

### **🌍 Interactive Swagger UI**
- **Development**: http://localhost:3001/api-docs
- **Features**: Test endpoints, view schemas, copy curl commands
- **OpenAPI Spec**: http://localhost:3001/api-docs.json

### **📊 API Statistics**
- ✅ **31 documented endpoints** across 13 resource types
- ✅ **19 comprehensive schemas** with real examples
- ✅ **100% endpoint coverage** for main operations
- ✅ **Interactive testing** with validation
- ✅ **Multi-language support** (JP, EN, CN, TW, KR)

### **🎯 Key Features**
- **File Upload**: Screenshot upload with validation
- **Batch Operations**: Bulk create/update with error handling
- **Advanced Filtering**: Date ranges, categories, rarities
- **Real-time Data**: Active gachas, upcoming birthdays
- **Search Functionality**: Multi-language search support

### **📖 Quick Documentation Commands**
```bash
# Open Swagger UI in browser
bun run docs:open

# Generate docs for new routes
bun run docs:generate

# Export OpenAPI specification
bun run docs:spec
```

---

## 🏗️ Project Architecture

```
backend/
├── 📁 src/
│   ├── 🔧 config/              # Configuration
│   │   ├── app.ts              # App configuration
│   │   ├── database.ts         # Database connection
│   │   ├── logger.ts           # Logging setup
│   │   └── swagger.ts          # 📝 Swagger/OpenAPI config
│   │
│   ├── 🗄️ database/            # Database management
│   │   ├── database-setup.ts   # Database initialization
│   │   ├── csv-import.ts       # CSV data import
│   │   ├── migrations/         # Database migrations
│   │   ├── seeds/              # Sample data
│   │   └── README.md           # Database documentation
│   │
│   ├── 🛡️ middleware/          # Express middleware
│   │   ├── errorHandler.ts     # Error handling
│   │   ├── validation.ts       # Request validation
│   │   └── responseFormatter.ts # Response formatting
│   │
│   ├── 📋 models/              # Data models
│   │   ├── BaseModel.ts        # Base model class
│   │   ├── CharacterModel.ts   # Character model
│   │   ├── SwimsuitModel.ts    # Swimsuit model
│   │   └── ...                 # Other models
│   │
│   ├── 🛣️ routes/              # API routes
│   │   ├── health.ts           # Health check
│   │   ├── characters.ts       # Character endpoints
│   │   ├── upload.ts           # File upload
│   │   └── ...                 # Other routes
│   │
│   ├── 🔄 services/            # Business logic
│   │   ├── BaseService.ts      # Base service class
│   │   ├── CharacterService.ts # Character operations
│   │   ├── DatabaseService.ts  # Database operations
│   │   └── ...                 # Other services
│   │
│   ├── 📝 types/               # TypeScript definitions
│   │   ├── api.ts              # API types
│   │   ├── database.ts         # Database types
│   │   └── index.ts            # Type exports
│   │
│   ├── 🔧 utils/               # Utility functions
│   │   ├── ValidationSchemas.ts # Validation schemas
│   │   ├── validationHelpers.ts # Validation helpers
│   │   └── id.ts               # ID utilities
│   │
│   └── 🌐 server.ts            # Main server file
│
├── 📜 scripts/                 # Utility scripts
│   └── add-swagger-docs.js     # Auto-generate Swagger docs
│
├── 📦 package.json             # Dependencies & scripts
├── 🔧 tsconfig.json           # TypeScript config
├── 📁 uploads/                # File uploads directory
├── 📄 .env.example            # Environment template
└── 📖 README.md               # This file
```

---

## 🛠️ Installation & Setup

### **Prerequisites**
- **Bun** >= 1.0.0 ([Install Bun](https://bun.sh/docs/installation))
- **MySQL** >= 8.0
- **Node.js** >= 18 (for compatibility)

### **Step-by-Step Setup**

#### 1️⃣ **Clone & Install**
```bash
# Navigate to project
cd path/to/handbook-for-life/backend

# Install dependencies
bun install
```

#### 2️⃣ **Environment Configuration**
```bash
# Copy environment template
cp .env.example .env

# Edit configuration
nano .env
```

**Key Environment Variables:**
```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=your_username
DATABASE_PASSWORD=your_password
DATABASE_NAME=doaxvv_handbook

# Server
PORT=3001
NODE_ENV=development
API_BASE_URL=http://localhost:3001

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

#### 3️⃣ **Database Setup**
```bash
# Create database and tables with sample data
bun run setup

# Or step by step:
bun run db:migrate    # Create tables
bun run db:seed       # Add sample data
```

#### 4️⃣ **Verify Installation**
```bash
# Health check
bun run health-check

# Start development server
bun run dev

# Check API documentation
open http://localhost:3001/api-docs
```

---

## 🗄️ Database Management

### **Database Features**
- ✅ **MySQL 8+** with UTF8MB4 encoding
- ✅ **Multi-language support** (JP, EN, CN, TW, KR)
- ✅ **Optimized indexes** and computed columns
- ✅ **Foreign key constraints** with cascade options
- ✅ **Automated migrations** and seeding
- ✅ **CSV import** with dependency resolution

### **Core Scripts**
```bash
# Database lifecycle
bun run db:setup     # Full setup (migrate + seed)
bun run db:reset     # Reset database (drop + recreate)
bun run db:migrate   # Run migrations only
bun run db:seed      # Run seeds only

# Data import
bun run import-csv   # Import CSV data files
bun run db:status    # Check migration/seed status

# Maintenance
bun run db:verify    # Verify table structure
bun run db:backup    # Backup database (if implemented)
```

### **CSV Data Import**
```bash
# Place CSV files in src/database/csv_data/
bun run import-csv

# Supported files:
# - characters.csv
# - swimsuits.csv
# - skills.csv
# - items.csv
# - events.csv
# - gachas.csv
# - bromides.csv
# - episodes.csv
```

**📖 Detailed Database Documentation**: [`src/database/README.md`](src/database/README.md)

---

## 🔌 API Endpoints

### **🏠 Core Endpoints**
| Endpoint | Description | Features |
|----------|-------------|----------|
| `GET /` | API information | Endpoints overview |
| `GET /api/health` | System health | Database status, metrics |
| `GET /api/health/stats` | System statistics | Entity counts, performance |

### **👥 Characters**
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/characters` | List characters (paginated) |
| `GET` | `/api/characters/search` | Search characters |
| `GET` | `/api/characters/birthdays` | Upcoming birthdays |
| `GET` | `/api/characters/{id}` | Get character by ID |
| `GET` | `/api/characters/key/{key}` | Get character by unique key |
| `POST` | `/api/characters` | Create character |
| `POST` | `/api/characters/batch` | Batch create characters |
| `PUT` | `/api/characters/{id}` | Update character |
| `DELETE` | `/api/characters/{id}` | Delete character |

### **👙 Game Resources**
- **Swimsuits**: `/api/swimsuits/*` - Swimsuit management
- **Skills**: `/api/skills/*` - Skill system
- **Items**: `/api/items/*` - In-game items
- **Events**: `/api/events/*` - Game events
- **Episodes**: `/api/episodes/*` - Story episodes
- **Bromides**: `/api/bromides/*` - Collectible bromides
- **Gachas**: `/api/gachas/*` - Gacha system
- **Shop**: `/api/shop-listings/*` - Shop items

### **🎯 Special Features**
- **Active Gachas**: `GET /api/gachas/active`
- **File Upload**: `POST /api/upload/screenshot`
- **Batch Operations**: `POST /api/{resource}/batch`
- **Advanced Search**: Multi-language search support
- **Date Filtering**: Range queries for events/gachas

### **📊 Response Format**
All endpoints follow a consistent response format:

```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Optional success message",
  "timestamp": "2024-06-28T10:30:00.000Z"
}
```

**Paginated responses include:**
```json
{
  "success": true,
  "data": [ /* array of items */ ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  },
  "timestamp": "2024-06-28T10:30:00.000Z"
}
```

---

## 📱 Development Workflow

### **🔥 Hot Development**
```bash
# Start with auto-reload
bun run dev

# Server runs on: http://localhost:3001
# Swagger UI: http://localhost:3001/api-docs
# Auto-restarts on file changes
```

### **🧪 Testing & Validation**
```bash
# Health check
curl http://localhost:3001/api/health

# Test specific endpoint
curl "http://localhost:3001/api/characters?page=1&limit=5"

# Interactive testing via Swagger UI
open http://localhost:3001/api-docs
```

### **📝 Adding New Endpoints**

1. **Create Route Handler**:
```typescript
// src/routes/new-resource.ts
/**
 * @swagger
 * /api/new-resource:
 *   get:
 *     tags: [NewResource]
 *     summary: Get all new resources
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success'
 */
router.get('/', asyncHandler(async (req, res) => {
  // Implementation
}));
```

2. **Auto-generate Documentation**:
```bash
bun run docs:generate
```

3. **Test in Swagger UI**:
```bash
bun run docs:open
```

### **🏗️ Build Process**
```bash
# Build for production
bun run build

# Output: dist/ directory
# Optimized, minified TypeScript → JavaScript
```

---

## 🚦 Scripts & Commands

### **🌟 Primary Commands**
```bash
# Development
bun run dev          # Start development server
bun run build        # Build for production

# Database
bun run setup        # Full database setup
bun run reset        # Reset database
bun run import-csv   # Import CSV data

# Health & Testing
bun run health-check # API health check
bun run health       # Server health status

# Network Configuration
bun run network-discovery  # Discover network IPs
bun run network-setup      # Auto-configure network access
```

### **📚 Documentation**
```bash
bun run docs:open     # Open Swagger UI
bun run docs:generate # Auto-generate docs
bun run docs:spec     # Export OpenAPI spec
```

### **🔧 Utility Commands**
```bash
# Database utilities
bun run db:migrate    # Run migrations
bun run db:seed       # Run seeds
bun run db:status     # Check status
bun run db:verify     # Verify tables

# Development utilities
bun run lint          # Lint code
bun run lint:fix      # Fix linting issues
bun run type-check    # TypeScript check
```

### **📊 Complete Scripts Reference**
| Script | Description | Use Case |
|--------|-------------|----------|
| `dev` | Development server | Day-to-day development |
| `build` | Production build | Deployment preparation |
| `setup` | Initial setup | First-time installation |
| `reset` | Database reset | Clean slate development |
| `health-check` | API health test | Verify server status |
| `docs:open` | Open Swagger UI | API documentation |
| `docs:generate` | Generate docs | After adding routes |
| `import-csv` | Import CSV data | Data population |

---

## 🔧 Configuration

### **Environment Variables**

#### **🗄️ Database Configuration**
```env
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=your_username
DATABASE_PASSWORD=your_password
DATABASE_NAME=doaxvv_handbook
DATABASE_SSL=false
DATABASE_TIMEZONE=+00:00
```

#### **🌐 Server Configuration**
```env
PORT=3001
NODE_ENV=development
API_BASE_URL=http://localhost:3001
HOST=0.0.0.0
```

#### **🔒 Security & CORS**
```env
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
CORS_CREDENTIALS=true
RATE_LIMIT_ENABLED=false
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

#### **🌐 Network Access**
```env
# Enable network access from other machines
NETWORK_ACCESS_ENABLED=true

# Add network IPs to CORS origins for network access
# CORS_ORIGINS=http://localhost:3000,http://192.168.1.100:3000
```

> 📖 **Network Access Guide**: See [docs/NETWORK_ACCESS.md](docs/NETWORK_ACCESS.md) for detailed network configuration instructions.

#### **📝 Logging**
```env
LOG_LEVEL=info
LOG_FORMAT=json
LOG_FILE=./logs/app.log
```

### **📁 File Structure Configuration**
```env
UPLOADS_DIR=./uploads
UPLOADS_MAX_SIZE=5242880  # 5MB
UPLOADS_ALLOWED_TYPES=image/jpeg,image/png,image/gif,image/webp
```

---

## 🚀 Production Deployment

### **🏗️ Build Process**
```bash
# Install production dependencies
bun install --production

# Build optimized bundle
bun run build

# Verify build
node dist/server.js
```

### **🐳 Docker Deployment**
```dockerfile
FROM oven/bun:1-alpine
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --production
COPY . .
RUN bun run build
EXPOSE 3001
CMD ["bun", "run", "dist/server.js"]
```

### **⚙️ Environment Setup**
```env
NODE_ENV=production
PORT=3001
DATABASE_HOST=production-mysql-host
DATABASE_SSL=true
LOG_LEVEL=warn
CORS_ORIGINS=https://your-frontend-domain.com
```

### **🔍 Health Monitoring**
```bash
# Health check endpoint
GET /api/health

# Monitor logs
tail -f logs/app.log

# Database monitoring
GET /api/health/stats
```

### **📊 Performance Considerations**
- **Database**: Connection pooling, query optimization
- **Caching**: Response caching for static data
- **Rate Limiting**: API rate limiting in production
- **Monitoring**: Error tracking and performance metrics

---

## 🐛 Troubleshooting

### **🔧 Common Issues**

#### **❌ Database Connection Failed**
```bash
# Check MySQL service
sudo systemctl status mysql  # Linux
brew services list | grep mysql  # macOS

# Verify credentials
mysql -u username -p -h localhost

# Check .env configuration
cat .env | grep DATABASE
```

#### **🚪 Port Already in Use**
```bash
# Find process using port 3001
lsof -i :3001

# Kill process
kill -9 PID

# Or change port in .env
echo "PORT=3002" >> .env
```

#### **🌐 CORS Issues**
```bash
# Check CORS configuration
cat .env | grep CORS

# Add your frontend URL
echo "CORS_ORIGINS=http://localhost:3000" >> .env
```

#### **📁 File Upload Issues**
```bash
# Check upload directory permissions
ls -la uploads/

# Create uploads directory
mkdir -p uploads/screenshots

# Fix permissions
chmod 755 uploads/
```

### **🩺 Debug Commands**
```bash
# Detailed health check
curl -v http://localhost:3001/api/health

# Check server logs
tail -f server.log

# Database verification
bun run db:verify

# Test database connection
bun run db:status
```

### **📞 Getting Help**
- **API Documentation**: http://localhost:3001/api-docs
- **Database Guide**: `src/database/README.md`
- **Health Check**: http://localhost:3001/api/health
- **Logs**: Check `server.log` for detailed error messages

---

## 📖 Resources

### **📚 Documentation**
- **API Documentation**: [Interactive Swagger UI](http://localhost:3001/api-docs)
- **OpenAPI Specification**: [JSON Format](http://localhost:3001/api-docs.json)
- **Database Schema**: [`src/database/README.md`](src/database/README.md)

### **🛠️ Tools & Technologies**
- **[Bun](https://bun.sh/)**: JavaScript runtime and package manager
- **[Express](https://expressjs.com/)**: Web framework
- **[TypeScript](https://www.typescriptlang.org/)**: Type-safe JavaScript
- **[MySQL](https://www.mysql.com/)**: Database system
- **[Swagger](https://swagger.io/)**: API documentation

### **🔗 Related Projects**
- **Frontend**: React application for DOAXVV Handbook
- **Database**: MySQL schema and data management
- **Documentation**: Comprehensive API and database documentation

### **📝 Development Notes**
- **Code Style**: TypeScript strict mode, ESLint rules
- **Database**: MySQL 8+ with UTF8MB4, strict foreign keys
- **API**: RESTful design, consistent response format
- **Documentation**: OpenAPI 3.0 specification
- **Security**: Input validation, file upload restrictions