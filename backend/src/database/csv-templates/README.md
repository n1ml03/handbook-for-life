# CSV Templates for DOAXVV Handbook Database

This directory contains CSV template files for all tables in the DOAXVV Handbook database schema. These templates serve as ready-to-use formats for data import, testing, and initial database population.

## Purpose

These CSV templates provide:
- **Standard data format**: Consistent column headers matching the database schema
- **Sample data**: 2-3 example rows demonstrating expected data types and formats  
- **Import ready**: Files can be directly used for CSV imports or data migrations
- **Testing support**: Sample data for development and testing scenarios
- **Documentation**: Clear examples of what data should look like for each table

## File Structure

Each CSV file corresponds to a database table and follows this naming convention:
- **File name**: `{table_name}.csv`
- **Header row**: All column names from the respective database table
- **Sample rows**: 2-3 rows of realistic sample data
- **Format**: Standard CSV with comma delimiters

## Available Templates

### Core Entity Tables
- **`characters.csv`** - Main character information (names, stats, profiles)
- **`swimsuits.csv`** - Swimsuit database (outfits, stats, images)
- **`skills.csv`** - Skills and abilities system
- **`items.csv`** - In-game items and materials
- **`bromides.csv`** - Decorative bromide cards

### Content & Event Tables
- **`events.csv`** - Game events and festivals
- **`gachas.csv`** - Gacha banner information
- **`episodes.csv`** - Story episodes and memories
- **`documents.csv`** - Guide documents and articles
- **`update_logs.csv`** - Game update changelogs
- **`shop_listings.csv`** - In-game shop items

### Relationship Tables
- **`swimsuit_skills.csv`** - Links swimsuits to their skills
- **`gacha_pools.csv`** - Defines items available in each gacha

## Data Format Guidelines

### Common Column Types
- **IDs**: Positive integers (1, 2, 3...)
- **Unique Keys**: Lowercase with underscores (`kasumi_venus_white`)
- **Multilingual Names**: Provided in JP, EN, CN, TW, KR formats
- **Dates**: ISO format (`YYYY-MM-DD`) for dates, (`YYYY-MM-DD HH:MM:SS`) for datetimes
- **Booleans**: `1` for true, `0` for false
- **Enums**: Exact values as defined in schema (e.g., `SSR`, `ACTIVE`, `POW`)
- **Binary Data**: Leave blank or use placeholder for BLOB columns
- **JSON Fields**: Valid JSON format for complex data structures

### Special Considerations
- **Image Data**: BLOB columns (image_data, profile_image_data) should be left empty in CSV templates
- **Foreign Keys**: Use valid IDs that reference existing records in related tables
- **MIME Types**: Standard formats like `image/jpeg`, `image/png`
- **Measurements**: Format as "B##/W##/H##" for character measurements
- **Drop Rates**: Decimal values between 0.0000 and 1.0000

## Usage Examples

### 1. Database Seeding
```bash
# Import character data
LOAD DATA INFILE 'characters.csv' 
INTO TABLE characters 
FIELDS TERMINATED BY ',' 
IGNORE 1 LINES;
```

### 2. Testing Data Setup
```typescript
// Use templates for integration tests
const testCharacters = await loadCSV('characters.csv');
await seedTestDatabase(testCharacters);
```

### 3. Data Migration
```bash
# Export existing data to CSV format
mysqldump --tab=/tmp/csv-export doaxvv_handbook characters
# Use templates as reference for format validation
```

## Modification Guidelines

When updating these templates:

1. **Keep headers synchronized** with database schema changes
2. **Maintain sample data quality** - use realistic, representative examples
3. **Preserve relationships** - ensure foreign key references are valid
4. **Test compatibility** - verify CSV imports work correctly
5. **Update this README** when adding new templates

## Related Files

- **Database Schema**: `../migrations/001_enhanced_schema_mysql.sql`
- **TypeScript Models**: `../../models/`
- **Database Setup**: `../database-setup.ts`
- **Seed Scripts**: `../seeds/`

## Notes

- Auto-increment IDs (PRIMARY KEYs) can be omitted during import - MySQL will assign them automatically
- Binary data columns (BLOB types) are left empty in these templates for portability
- Sample data includes characters and content from the actual DOAXVV game for authenticity
- All templates follow UTF-8 encoding to support multilingual content
- Date formats are standardized to MySQL-compatible ISO format

For questions about specific table structures or relationships, refer to the database migration files or the corresponding TypeScript model definitions. 