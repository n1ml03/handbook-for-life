# Database Management Guide

Hướng dẫn quản lý cơ sở dữ liệu cho DOAXVV Handbook Backend API - bao gồm schema, migration, seeding và import CSV.

## 📋 Mục Lục

- [Cấu Trúc Database](#cấu-trúc-database)
- [Setup & Migration](#setup--migration)  
- [Seeding Data](#seeding-data)
- [Import CSV Data](#import-csv-data)
- [Cấu Trúc File CSV](#cấu-trúc-file-csv)
- [Troubleshooting](#troubleshooting)

## 🗄️ Cấu Trúc Database

### Core Tables
- **characters** (16 columns) - Thông tin nhân vật với hỗ trợ đa ngôn ngữ
- **swimsuits** (17 columns) - Thư viện đồ bơi với thống kê và thuộc tính
- **skills** (10 columns) - Hệ thống kỹ năng active/passive/potential
- **items** (12 columns) - Vật phẩm và phụ kiện trong game
- **bromides** (10 columns) - Bộ sưu tập thẻ Deco-Bromide
- **episodes** (12 columns) - Câu chuyện và tình tiết
- **events** (10 columns) - Sự kiện và chiến dịch trong game
- **documents** (8 columns) - Tài liệu và hướng dẫn

### Linking Tables
- **swimsuit_skills** - Quan hệ nhiều-nhiều giữa đồ bơi và kỹ năng
- **gacha_pools** - Vật phẩm gacha và tỷ lệ

### Đặc Điểm Chính
- Hỗ trợ đa ngôn ngữ (JP, EN, CN, TW, KR)
- Index được tối ưu hóa cho hiệu suất
- Bộ ký tự UTF8MB4 để hỗ trợ emoji
- Cột được tạo tự động cho giá trị tính toán
- Ràng buộc khóa ngoại để đảm bảo tính toàn vẹn dữ liệu

## 🚀 Setup & Migration

### Yêu Cầu Hệ Thống
- Bun 1.0+
- MySQL 8.0+
- Node.js 18+ (fallback)

### 1. Cài Đặt Dependencies
```bash
cd backend
bun install
```

### 2. Tạo Database
```bash
# Kết nối MySQL
mysql -u root -p
```

```sql
CREATE DATABASE doaxvv_handbook CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'doaxvv_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON doaxvv_handbook.* TO 'doaxvv_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Cấu Hình Environment
```bash
# Copy template
cp .env.example .env

# Chỉnh sửa .env
nano .env
```

Cấu hình cần thiết:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=doaxvv_handbook
DB_USER=doaxvv_user
DB_PASSWORD=your_password

# Server Configuration
NODE_ENV=development
PORT=3001
HOST=0.0.0.0

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

### 4. Chạy Migrations

#### Sử Dụng Bun (Khuyến Nghị)
```bash
# Chạy migrations
bun run src/database/migrations/run-migrations.ts

# Hoặc sử dụng script
bun run migrate

# Kiểm tra trạng thái migrations
bun run src/database/migrations/run-migrations.ts --status
```

#### Sử Dụng Node.js
```bash
# Chạy migrations
npx tsx src/database/migrations/run-migrations.ts

# Kiểm tra trạng thái
npx tsx src/database/migrations/run-migrations.ts --status
```

#### Manual Import (Backup option)
```bash
# Import schema trực tiếp
mysql -u doaxvv_user -p doaxvv_handbook < src/database/migrations/001_enhanced_schema_mysql.sql
```

### 5. Khởi Động Server
```bash
# Development mode
bun run dev

# Production mode
bun run start

# Server sẽ chạy tại http://localhost:3001
```

## 🌱 Seeding Data

### Sử Dụng Sample Data
```bash
# Chạy seeding với dữ liệu mẫu
bun run src/database/seeds/run-seeds.ts

# Xem trạng thái seeds
bun run src/database/seeds/run-seeds.ts --status

# Force seed (ghi đè dữ liệu hiện có)
bun run src/database/seeds/run-seeds.ts --force

# Clear specific table
bun run src/database/seeds/run-seeds.ts --clear characters
```

### Sử Dụng Sample Data Trực Tiếp
```bash
# Import sample data
mysql -u doaxvv_user -p doaxvv_handbook < src/database/sample_data.sql
```

## 📥 Import CSV Data

### Chuẩn Bị File CSV
Tất cả file phải được lưu ở định dạng `CSV (UTF-8)` để tránh lỗi encoding.

### Thứ Tự Import
**Quan trọng**: Phải import theo đúng thứ tự để tránh vi phạm ràng buộc khóa ngoại.

1. **Group 1 (Core Entities)**:
   - `characters.csv`
   - `skills.csv` 
   - `items.csv`
   - `bromides.csv`

2. **Group 2 (Depend on Group 1)**:
   - `swimsuits.csv`
   - `episodes.csv`

3. **Group 3 (Game Content)**:
   - `events.csv`
   - `gachas.csv`

4. **Group 4 (Linking Tables)**:
   - `swimsuit_skills.csv`
   - `gacha_pools.csv`
   - `shop_listings.csv`

### Script Import (Khuyến Nghị)
```bash
# Sử dụng script import tự động
bun run src/database/import-csv.ts --folder ./csv_data

# Import file cụ thể
bun run src/database/import-csv.ts --file characters.csv

# Kiểm tra trước khi import
bun run src/database/import-csv.ts --validate-only
```

## 📄 Cấu Trúc File CSV

### 1. Core Tables (Có cột dịch thuật)

#### `characters.csv`
| id | unique_key | birthday | height | measurements | blood_type | voice_actor_jp | profile_image_url | is_active | name_en | name_jp | name_cn | name_tw | name_ko |
|----|------------|----------|--------|--------------|------------|----------------|-------------------|-----------|---------|---------|---------|---------|---------|
| _(number)_ | _(text)_ | _(YYYY-MM-DD)_ | _(number)_ | _(text)_ | _(text)_ | _(text)_ | _(url)_ | _(0 or 1)_ | _(text)_ | _(text)_ | _(text)_ | _(text)_ | _(text)_ |

#### `skills.csv`
| id | unique_key | skill_category | effect_type | name_en | name_jp | description_en | description_jp |
|----|------------|----------------|-------------|---------|---------|----------------|----------------|
| _(number)_ | _(text)_ | _(ACTIVE/PASSIVE/POTENTIAL)_ | _(text)_ | _(text)_ | _(text)_ | _(text)_ | _(text)_ |

#### `swimsuits.csv`
| id | character_id | unique_key | rarity | suit_type | total_stats_awakened | has_malfunction | is_limited | name_en | name_jp |
|----|--------------|------------|--------|-----------|----------------------|-----------------|------------|---------|---------|
| _(number)_ | _(number)_ | _(text)_ | _(SSR/SR...)_ | _(POW/TEC...)_ | _(number)_ | _(0 or 1)_ | _(0 or 1)_ | _(text)_ | _(text)_ |

#### `items.csv`
| id | unique_key | item_category | rarity | icon_url | name_en | name_jp | description_en | description_jp |
|----|------------|---------------|--------|----------|---------|---------|----------------|----------------|
| _(number)_ | _(text)_ | _(CURRENCY...)_ | _(N/R...)_ | _(url)_ | _(text)_ | _(text)_ | _(text)_ | _(text)_ |

### 2. Linking Tables (Import trực tiếp)

#### `swimsuit_skills.csv`
| swimsuit_id | skill_id | skill_slot |
|-------------|----------|------------|
| _(number)_ | _(number)_ | _(ACTIVE/PASSIVE_1...)_ |

#### `gacha_pools.csv`
| gacha_id | pool_item_type | swimsuit_id | bromide_id | item_id | drop_rate | is_featured |
|----------|----------------|-------------|------------|---------|-----------|-------------|
| _(number)_ | _(SWIMSUIT/BROMIDE/ITEM)_ | _(number or null)_ | _(number or null)_ | _(number or null)_ | _(decimal)_ | _(0 or 1)_ |

## 🔍 Troubleshooting

### Lỗi Thường Gặp

#### 1. Connection Refused
```bash
# Kiểm tra MySQL service
sudo systemctl status mysql

# Khởi động MySQL
sudo systemctl start mysql
```

#### 2. Permission Denied
```sql
-- Cấp quyền đầy đủ
GRANT ALL PRIVILEGES ON doaxvv_handbook.* TO 'doaxvv_user'@'localhost';
FLUSH PRIVILEGES;
```

#### 3. Character Encoding Issues
```sql
-- Kiểm tra charset
SHOW VARIABLES LIKE 'character_set%';

-- Đặt UTF8MB4
SET NAMES utf8mb4;
```

#### 4. Foreign Key Violations
```bash
# Kiểm tra thứ tự import
# Luôn import core tables trước linking tables
```

### Performance Tuning

#### 1. Kiểm Tra Slow Queries
```sql
-- Bật slow query log
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1;
```

#### 2. Analyze Tables
```sql
-- Cập nhật thống kê bảng
ANALYZE TABLE characters, swimsuits, skills;

-- Kiểm tra index usage
EXPLAIN SELECT * FROM characters WHERE name_en LIKE '%marie%';
```

### Backup & Recovery

#### 1. Backup Database
```bash
# Full backup
mysqldump -u doaxvv_user -p doaxvv_handbook > backup.sql

# Schema only
mysqldump -u doaxvv_user -p --no-data doaxvv_handbook > schema.sql

# Specific tables
mysqldump -u doaxvv_user -p doaxvv_handbook characters swimsuits > core_tables.sql
```

#### 2. Restore Database
```bash
# Full restore
mysql -u doaxvv_user -p doaxvv_handbook < backup.sql

# Restore specific tables
mysql -u doaxvv_user -p doaxvv_handbook < core_tables.sql
```

### Monitoring

#### 1. Database Health Check
```bash
# Sử dụng built-in health check
curl http://localhost:3001/api/health

# Kiểm tra từng model
bun run src/models/CharacterModel.ts --health-check
```

#### 2. Connection Pool Status
```sql
-- Kiểm tra connection hiện tại
SHOW PROCESSLIST;

-- Thống kê connection
SHOW STATUS LIKE 'Connections';
SHOW STATUS LIKE 'Threads_connected';
```

## 📞 Hỗ Trợ

Nếu gặp vấn đề trong quá trình setup:

1. Kiểm tra logs trong `logs/` folder
2. Xem documentation tại `/api/health` endpoint
3. Tham khảo error messages chi tiết trong console
4. Kiểm tra MySQL error logs: `/var/log/mysql/error.log`

## 🔗 API Endpoints

Sau khi setup thành công, các endpoints sẽ có tại:

- Health Check: `GET /api/health`
- Characters: `GET /api/characters`
- Swimsuits: `GET /api/swimsuits`
- Skills: `GET /api/skills`
- Items: `GET /api/items`
- [Xem đầy đủ tại backend README.md]

## 📝 Notes

- Database schema được tối ưu cho production với indexes phù hợp
- Sample data chỉ để testing, production cần import CSV thực tế  
- Migration system hỗ trợ versioning và rollback
- Mọi thay đổi schema nên được thực hiện qua migration files 