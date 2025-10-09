-- ============================================================================
-- DOAX Venus Vacation Handbook - Consolidated Migration
-- ============================================================================
-- File: consolidated_migration.sql
-- Description: Complete database migration combining all individual migrations
-- Version: Consolidated from migrations 001-004
-- Created: 2024-12-19
-- ============================================================================

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS doaxvv_handbook
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE doaxvv_handbook;

-- ============================================================================
-- MIGRATION 001: Enhanced Schema with Core Tables
-- ============================================================================

-- ============================================================================
-- 1. CORE TABLES (Core Entities)
-- ============================================================================

CREATE TABLE characters (
    id SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Auto-incrementing ID, the primary key for the character',
    unique_key VARCHAR(100) NOT NULL UNIQUE COMMENT 'Text-based unique identifier, immutable, used for URLs and APIs',
    name_jp VARCHAR(100) NOT NULL COMMENT 'Character name (Japanese)',
    name_en VARCHAR(100) NOT NULL COMMENT 'Character name (English)',
    name_cn VARCHAR(100) NOT NULL COMMENT 'Character name (Simplified Chinese)',
    name_tw VARCHAR(100) NOT NULL COMMENT 'Character name (Traditional Chinese)',
    name_kr VARCHAR(100) NOT NULL COMMENT 'Character name (Korean)',
    age_jp VARCHAR(50) COMMENT 'Age (Japanese)',
    age_en VARCHAR(50) COMMENT 'Age (English)',
    age_cn VARCHAR(50) COMMENT 'Age (Simplified Chinese)',
    age_tw VARCHAR(50) COMMENT 'Age (Traditional Chinese)',
    age_kr VARCHAR(50) COMMENT 'Age (Korean)',
    birthday_jp VARCHAR(100) COMMENT 'Birthday (Japanese)',
    birthday_en VARCHAR(100) COMMENT 'Birthday (English)',
    birthday_cn VARCHAR(100) COMMENT 'Birthday (Simplified Chinese)',
    birthday_tw VARCHAR(100) COMMENT 'Birthday (Traditional Chinese)',
    birthday_kr VARCHAR(100) COMMENT 'Birthday (Korean)',
    height_jp VARCHAR(50) COMMENT 'Height (Japanese)',
    height_en VARCHAR(50) COMMENT 'Height (English)',
    height_cn VARCHAR(50) COMMENT 'Height (Simplified Chinese)',
    height_tw VARCHAR(50) COMMENT 'Height (Traditional Chinese)',
    height_kr VARCHAR(50) COMMENT 'Height (Korean)',
    measurements_jp VARCHAR(50) COMMENT 'Measurements (Japanese)',
    measurements_en VARCHAR(50) COMMENT 'Measurements (English)',
    measurements_cn VARCHAR(50) COMMENT 'Measurements (Simplified Chinese)',
    measurements_tw VARCHAR(50) COMMENT 'Measurements (Traditional Chinese)',
    measurements_kr VARCHAR(50) COMMENT 'Measurements (Korean)',
    blood_jp VARCHAR(20) COMMENT 'Blood type (Japanese)',
    blood_en VARCHAR(20) COMMENT 'Blood type (English)',
    blood_cn VARCHAR(20) COMMENT 'Blood type (Simplified Chinese)',
    blood_tw VARCHAR(20) COMMENT 'Blood type (Traditional Chinese)',
    blood_kr VARCHAR(20) COMMENT 'Blood type (Korean)',
    job_jp VARCHAR(150) COMMENT 'Job/Occupation (Japanese)',
    job_en VARCHAR(150) COMMENT 'Job/Occupation (English)',
    job_cn VARCHAR(150) COMMENT 'Job/Occupation (Simplified Chinese)',
    job_tw VARCHAR(150) COMMENT 'Job/Occupation (Traditional Chinese)',
    job_kr VARCHAR(150) COMMENT 'Job/Occupation (Korean)',
    hobby_jp VARCHAR(255) COMMENT 'Hobby (Japanese)',
    hobby_en VARCHAR(255) COMMENT 'Hobby (English)',
    hobby_cn VARCHAR(255) COMMENT 'Hobby (Simplified Chinese)',
    hobby_tw VARCHAR(255) COMMENT 'Hobby (Traditional Chinese)',
    hobby_kr VARCHAR(255) COMMENT 'Hobby (Korean)',
    food_jp VARCHAR(255) COMMENT 'Favorite food (Japanese)',
    food_en VARCHAR(255) COMMENT 'Favorite food (English)',
    food_cn VARCHAR(255) COMMENT 'Favorite food (Simplified Chinese)',
    food_tw VARCHAR(255) COMMENT 'Favorite food (Traditional Chinese)',
    food_kr VARCHAR(255) COMMENT 'Favorite food (Korean)',
    color_jp VARCHAR(100) COMMENT 'Favorite color (Japanese)',
    color_en VARCHAR(100) COMMENT 'Favorite color (English)',
    color_cn VARCHAR(100) COMMENT 'Favorite color (Simplified Chinese)',
    color_tw VARCHAR(100) COMMENT 'Favorite color (Traditional Chinese)',
    color_kr VARCHAR(100) COMMENT 'Favorite color (Korean)',
    cast_jp VARCHAR(150) COMMENT 'Voice actor/Cast (Japanese)',
    cast_en VARCHAR(150) COMMENT 'Voice actor/Cast (English)',
    cast_cn VARCHAR(150) COMMENT 'Voice actor/Cast (Simplified Chinese)',
    cast_tw VARCHAR(150) COMMENT 'Voice actor/Cast (Traditional Chinese)',
    cast_kr VARCHAR(150) COMMENT 'Voice actor/Cast (Korean)'
) ENGINE=InnoDB COMMENT='Stores basic information about the characters.';

CREATE TABLE swimsuits (
    id MEDIUMINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Auto-incrementing ID, the primary key for the swimsuit',
    unique_key VARCHAR(150) NOT NULL UNIQUE COMMENT 'Text-based unique identifier, immutable',
    unique_msg_key VARCHAR(150) COMMENT 'Unique message key',
    name_jp VARCHAR(255) NOT NULL COMMENT 'Swimsuit name (Japanese)',
    name_en VARCHAR(255) NOT NULL COMMENT 'Swimsuit name (English)',
    name_cn VARCHAR(255) NOT NULL COMMENT 'Swimsuit name (Simplified Chinese)',
    name_tw VARCHAR(255) NOT NULL COMMENT 'Swimsuit name (Traditional Chinese)',
    name_kr VARCHAR(255) NOT NULL COMMENT 'Swimsuit name (Korean)',
    character_key VARCHAR(100) COMMENT 'Character unique key reference',
    rarity VARCHAR(20) COMMENT 'Rarity level',
    attribute VARCHAR(50) COMMENT 'Swimsuit attribute',
    max_level SMALLINT UNSIGNED COMMENT 'Maximum level',
    base_pow SMALLINT UNSIGNED COMMENT 'Base POW stat',
    max_pow SMALLINT UNSIGNED COMMENT 'Maximum POW stat',
    pow_growth DECIMAL(10,2) COMMENT 'POW growth rate',
    base_tec SMALLINT UNSIGNED COMMENT 'Base TEC stat',
    max_tex SMALLINT UNSIGNED COMMENT 'Maximum TEC stat',
    tec_growth DECIMAL(10,2) COMMENT 'TEC growth rate',
    base_stm SMALLINT UNSIGNED COMMENT 'Base STM stat',
    max_stm SMALLINT UNSIGNED COMMENT 'Maximum STM stat',
    stm_growth DECIMAL(10,2) COMMENT 'STM growth rate',
    base_apl SMALLINT UNSIGNED COMMENT 'Base APL stat',
    max_apl SMALLINT UNSIGNED COMMENT 'Maximum APL stat',
    apl_growth DECIMAL(10,2) COMMENT 'APL growth rate',
    skill_id_1 INT UNSIGNED COMMENT 'Skill 1 ID',
    skill_key_1 VARCHAR(120) COMMENT 'Skill 1 unique key',
    skill_name_jp_1 VARCHAR(150) COMMENT 'Skill 1 name (Japanese)',
    skill_name_en_1 VARCHAR(150) COMMENT 'Skill 1 name (English)',
    skill_name_cn_1 VARCHAR(150) COMMENT 'Skill 1 name (Simplified Chinese)',
    skill_name_tw_1 VARCHAR(150) COMMENT 'Skill 1 name (Traditional Chinese)',
    skill_name_kr_1 VARCHAR(150) COMMENT 'Skill 1 name (Korean)',
    skill_des_1 TEXT COMMENT 'Skill 1 description',
    skill_des_jp_1 TEXT COMMENT 'Skill 1 description (Japanese)',
    skill_des_en_1 TEXT COMMENT 'Skill 1 description (English)',
    skill_des_cn_1 TEXT COMMENT 'Skill 1 description (Simplified Chinese)',
    skill_des_tw_1 TEXT COMMENT 'Skill 1 description (Traditional Chinese)',
    skill_des_kr_1 TEXT COMMENT 'Skill 1 description (Korean)',
    skill_id_2 INT UNSIGNED COMMENT 'Skill 2 ID',
    skill_key_2 VARCHAR(120) COMMENT 'Skill 2 unique key',
    skill_name_jp_2 VARCHAR(150) COMMENT 'Skill 2 name (Japanese)',
    skill_name_en_2 VARCHAR(150) COMMENT 'Skill 2 name (English)',
    skill_name_cn_2 VARCHAR(150) COMMENT 'Skill 2 name (Simplified Chinese)',
    skill_name_tw_2 VARCHAR(150) COMMENT 'Skill 2 name (Traditional Chinese)',
    skill_name_kr_2 VARCHAR(150) COMMENT 'Skill 2 name (Korean)',
    skill_des_2 TEXT COMMENT 'Skill 2 description',
    skill_des_jp_2 TEXT COMMENT 'Skill 2 description (Japanese)',
    skill_des_en_2 TEXT COMMENT 'Skill 2 description (English)',
    skill_des_cn_2 TEXT COMMENT 'Skill 2 description (Simplified Chinese)',
    skill_des_tw_2 TEXT COMMENT 'Skill 2 description (Traditional Chinese)',
    skill_des_kr_2 TEXT COMMENT 'Skill 2 description (Korean)',
    skill_id_3 INT UNSIGNED COMMENT 'Skill 3 ID',
    skill_key_3 VARCHAR(120) COMMENT 'Skill 3 unique key',
    skill_name_jp_3 VARCHAR(150) COMMENT 'Skill 3 name (Japanese)',
    skill_name_en_3 VARCHAR(150) COMMENT 'Skill 3 name (English)',
    skill_name_cn_3 VARCHAR(150) COMMENT 'Skill 3 name (Simplified Chinese)',
    skill_name_tw_3 VARCHAR(150) COMMENT 'Skill 3 name (Traditional Chinese)',
    skill_name_kr_3 VARCHAR(150) COMMENT 'Skill 3 name (Korean)',
    skill_des_3 TEXT COMMENT 'Skill 3 description',
    skill_des_jp_3 TEXT COMMENT 'Skill 3 description (Japanese)',
    skill_des_en_3 TEXT COMMENT 'Skill 3 description (English)',
    skill_des_cn_3 TEXT COMMENT 'Skill 3 description (Simplified Chinese)',
    skill_des_tw_3 TEXT COMMENT 'Skill 3 description (Traditional Chinese)',
    skill_des_kr_3 TEXT COMMENT 'Skill 3 description (Korean)',
    bromide VARCHAR(255) COMMENT 'Bromide reference',
    cossbreak_bromide VARCHAR(255) COMMENT 'Cossbreak bromide reference',
    INDEX idx_character_key (character_key) COMMENT 'Index for character key lookups',
    INDEX idx_rarity (rarity) COMMENT 'Index for rarity filtering'
) ENGINE=InnoDB COMMENT='Library of swimsuits, used for the SwimsuitPage.';

CREATE TABLE skills (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Auto-incrementing ID, the primary key for the skill',
    unique_key VARCHAR(120) NOT NULL UNIQUE COMMENT 'Text-based unique identifier, immutable',
    name_jp VARCHAR(150) NOT NULL COMMENT 'Skill name (Japanese)',
    name_en VARCHAR(150) NOT NULL COMMENT 'Skill name (English)',
    name_cn VARCHAR(150) NOT NULL COMMENT 'Skill name (Simplified Chinese)',
    name_tw VARCHAR(150) NOT NULL COMMENT 'Skill name (Traditional Chinese)',
    name_kr VARCHAR(150) NOT NULL COMMENT 'Skill name (Korean)',
    description_en TEXT COMMENT 'Description of the skill''s effect (English)',
    skill_category ENUM('ACTIVE', 'PASSIVE', 'POTENTIAL') NOT NULL COMMENT 'Skill category',
    effect_type VARCHAR(50) COMMENT 'Effect type (e.g., "POW_UP")',
    game_version VARCHAR(30) NULL COMMENT 'Game version when the skill was introduced',
    INDEX idx_skill_category (skill_category) COMMENT 'Optimized for filtering skills',
    INDEX idx_game_version (game_version)
) ENGINE=InnoDB COMMENT='Library of skills, used for the SkillsPage.';

CREATE TABLE items (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Auto-incrementing ID, the primary key for the item',
    unique_key VARCHAR(120) NOT NULL UNIQUE COMMENT 'Text-based unique identifier, immutable',
    type VARCHAR(100) COMMENT 'Item type/category',
    name_jp VARCHAR(150) NOT NULL COMMENT 'Item name (Japanese)',
    name_en VARCHAR(150) NOT NULL COMMENT 'Item name (English)',
    name_cn VARCHAR(150) NOT NULL COMMENT 'Item name (Simplified Chinese)',
    name_tw VARCHAR(150) NOT NULL COMMENT 'Item name (Traditional Chinese)',
    name_kr VARCHAR(150) NOT NULL COMMENT 'Item name (Korean)',
    description TEXT COMMENT 'Item description',
    icon_small VARCHAR(255) COMMENT 'Small icon path or URL',
    icon_large VARCHAR(255) COMMENT 'Large icon path or URL',
    INDEX idx_type (type) COMMENT 'Optimized for filtering items by type'
) ENGINE=InnoDB COMMENT='A comprehensive table of all items, used across multiple pages.';

CREATE TABLE bromides (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Auto-incrementing ID, the primary key for the bromide',
    unique_key VARCHAR(120) NOT NULL UNIQUE COMMENT 'Text-based unique identifier, immutable',
    name_jp VARCHAR(150) NOT NULL COMMENT 'Bromide name (Japanese)',
    name_en VARCHAR(150) NOT NULL COMMENT 'Bromide name (English)',
    name_cn VARCHAR(150) NOT NULL COMMENT 'Bromide name (Simplified Chinese)',
    name_tw VARCHAR(150) NOT NULL COMMENT 'Bromide name (Traditional Chinese)',
    name_kr VARCHAR(150) NOT NULL COMMENT 'Bromide name (Korean)',
    bromide_type ENUM('DECO', 'OWNER') NOT NULL DEFAULT 'DECO' COMMENT 'Bromide type',
    rarity ENUM('R','SR','SSR') NOT NULL COMMENT 'Rarity',
    skill_id INT UNSIGNED NULL COMMENT 'Foreign key, links to the associated skill',
    art_data LONGBLOB COMMENT 'Binary data of the bromide artwork image',
    art_mime_type VARCHAR(50) COMMENT 'MIME type of the artwork image',
    game_version VARCHAR(30) NULL COMMENT 'Game version when the bromide was added',
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE SET NULL,
    INDEX idx_bromide_type (bromide_type) COMMENT 'Optimized for the DecorateBromidePage',
    INDEX idx_game_version (game_version)
) ENGINE=InnoDB COMMENT='Data for Deco-Bromides, used for the DecorateBromidePage.';

CREATE TABLE episodes (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Auto-incrementing ID, the primary key for the episode',
    name_jp VARCHAR(255) NOT NULL COMMENT 'Episode name (Japanese)',
    name_en VARCHAR(255) NOT NULL COMMENT 'Episode name (English)',
    name_cn VARCHAR(255) NOT NULL COMMENT 'Episode name (Simplified Chinese)',
    name_tw VARCHAR(255) NOT NULL COMMENT 'Episode name (Traditional Chinese)',
    name_kr VARCHAR(255) NOT NULL COMMENT 'Episode name (Korean)',
    type VARCHAR(100) COMMENT 'Episode type',
    unique_key VARCHAR(200) NOT NULL UNIQUE COMMENT 'Text-based unique identifier, immutable',
    release_data DATE COMMENT 'Release date',
    release_version VARCHAR(50) COMMENT 'Release version',
    INDEX idx_type (type) COMMENT 'Index for episode type filtering',
    INDEX idx_release_data (release_data) COMMENT 'Index for release date sorting'
) ENGINE=InnoDB COMMENT='Data for story episodes, used for the MemoriesPage.';

-- ============================================================================
-- 2. CONTENT & EVENT TABLES
-- ============================================================================

CREATE TABLE events (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Auto-incrementing ID, the primary key for the event',
    unique_key VARCHAR(150) NOT NULL UNIQUE COMMENT 'Text-based unique identifier, immutable',
    name_jp VARCHAR(255) NOT NULL COMMENT 'Event name (Japanese)',
    name_en VARCHAR(255) NOT NULL COMMENT 'Event name (English)',
    name_cn VARCHAR(255) NOT NULL COMMENT 'Event name (Simplified Chinese)',
    name_tw VARCHAR(255) NOT NULL COMMENT 'Event name (Traditional Chinese)',
    name_kr VARCHAR(255) NOT NULL COMMENT 'Event name (Korean)',
    type ENUM('FESTIVAL_RANKING','FESTIVAL_CUMULATIVE','TOWER','ROCK_CLIMBING', 'BUTT_BATTLE', 'LOGIN_BONUS', 'STORY') NOT NULL COMMENT 'Gameplay type',
    game_version VARCHAR(30) NULL COMMENT 'Game version associated with the event',
    start_date DATETIME NOT NULL COMMENT 'Start time',
    end_date DATETIME NOT NULL COMMENT 'End time',
    is_active BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Whether the event is currently active (needs to be updated programmatically)',
    INDEX idx_active_date (is_active, start_date DESC) COMMENT 'Optimized for fetching active events',
    INDEX idx_game_version (game_version)
) ENGINE=InnoDB COMMENT='Event data, used for the FestivalPage/EventsPage.';

CREATE TABLE gachas (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Auto-incrementing ID, the primary key for the gacha',
    unique_key VARCHAR(150) NOT NULL UNIQUE COMMENT 'Text-based unique identifier, immutable',
    name_jp VARCHAR(255) NOT NULL COMMENT 'Gacha name (Japanese)',
    name_en VARCHAR(255) NOT NULL COMMENT 'Gacha name (English)',
    name_cn VARCHAR(255) NOT NULL COMMENT 'Gacha name (Simplified Chinese)',
    name_tw VARCHAR(255) NOT NULL COMMENT 'Gacha name (Traditional Chinese)',
    name_kr VARCHAR(255) NOT NULL COMMENT 'Gacha name (Korean)',
    gacha_subtype ENUM('TRENDY', 'NOSTALGIC', 'BIRTHDAY', 'ANNIVERSARY', 'PAID', 'FREE', 'ETC') NOT NULL COMMENT 'Detailed classification',
    game_version VARCHAR(30) NULL COMMENT 'Game version associated with the gacha',
    start_date DATETIME NOT NULL COMMENT 'Start time',
    end_date DATETIME NOT NULL COMMENT 'End time',
    banner_image_data LONGBLOB COMMENT 'Binary data of the gacha banner image',
    banner_image_mime_type VARCHAR(50) COMMENT 'MIME type of the banner image (e.g., image/jpeg, image/png)',
    INDEX idx_dates (start_date DESC) COMMENT 'Optimized for fetching the latest gachas',
    INDEX idx_game_version (game_version)
) ENGINE=InnoDB COMMENT='Data for Gacha banners, used for the GachaPage.';

-- ============================================================================
-- 3. DOCUMENT MANAGEMENT TABLES (with PDF Support)
-- ============================================================================

CREATE TABLE documents (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Auto-incrementing ID, the primary key for the document',
    unique_key VARCHAR(150) NOT NULL UNIQUE COMMENT 'Text-based unique identifier, used for URLs',
    title_en VARCHAR(255) NOT NULL COMMENT 'Main title of the document (English)',
    summary_en TEXT COMMENT 'Summary of the document (English)',
    document_type ENUM('checklist', 'guide') NOT NULL DEFAULT 'checklist' COMMENT 'Type of document for categorization and specialized handling',
    content_json_en JSON NULL COMMENT 'Document content in English, stored as JSON from Tiptap',
    screenshots_data JSON COMMENT 'Array of screenshot objects with binary data and metadata: [{data: LONGBLOB, mimeType: string, filename: string}]',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation time',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update time',
    INDEX idx_unique_key (unique_key) COMMENT 'Optimized for accessing documents by unique key',
    INDEX idx_document_type (document_type) COMMENT 'Index for filtering documents by type',
    INDEX idx_document_type_updated (document_type, updated_at DESC) COMMENT 'Composite index for type-based queries with sorting'
) ENGINE=InnoDB COMMENT='Manages documents and guide articles.';

CREATE TABLE update_logs (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Auto-incrementing ID, the primary key for the update log',
    unique_key VARCHAR(150) NOT NULL UNIQUE COMMENT 'Text-based unique identifier, used for URLs',
    version VARCHAR(50) NOT NULL COMMENT 'Version number (e.g., "2.1.0")',
    title VARCHAR(255) NOT NULL COMMENT 'Update title',
    content TEXT NOT NULL COMMENT 'Update content description',
    description TEXT COMMENT 'Additional description',
    date DATETIME NOT NULL COMMENT 'Update release date',
    tags JSON COMMENT 'Tags array for categorization',
    screenshots_data JSON COMMENT 'Array of screenshot objects with binary data and metadata: [{data: LONGBLOB, mimeType: string, filename: string}]',
    metrics JSON COMMENT 'Performance metrics object',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation time',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update time',
    INDEX idx_date (date DESC) COMMENT 'Optimized for fetching updates by date',
    INDEX idx_version (version) COMMENT 'Index for version lookups'
) ENGINE=InnoDB COMMENT='Stores update logs and changelogs.';

-- ============================================================================
-- 4. VIEWS - Optimized for HomePage Queries
-- ============================================================================

CREATE OR REPLACE VIEW v_timeline AS
(
    SELECT 'EVENT' AS type, unique_key, start_date AS activity_date, name_en AS title FROM events
)
UNION ALL
(
    SELECT 'GACHA' AS type, unique_key, start_date AS activity_date, name_en AS title FROM gachas
)
ORDER BY activity_date DESC;

-- ============================================================================
-- MIGRATION 002: Add PDF Support to Documents Table
-- ============================================================================

-- Add PDF storage fields to documents table
ALTER TABLE documents
ADD COLUMN pdf_data LONGBLOB COMMENT 'Binary PDF file data',
ADD COLUMN pdf_filename VARCHAR(255) COMMENT 'Original PDF filename',
ADD COLUMN pdf_mime_type VARCHAR(100) DEFAULT 'application/pdf' COMMENT 'PDF MIME type',
ADD COLUMN pdf_size INT UNSIGNED COMMENT 'PDF file size in bytes',
ADD COLUMN has_pdf_file BOOLEAN DEFAULT FALSE COMMENT 'Flag indicating if document has PDF attachment';

-- Create index for faster queries on documents with PDF files
CREATE INDEX idx_documents_has_pdf ON documents(has_pdf_file);
CREATE INDEX idx_documents_pdf_filename ON documents(pdf_filename);

-- Update existing documents to set has_pdf_file flag
UPDATE documents SET has_pdf_file = FALSE WHERE has_pdf_file IS NULL;

-- ============================================================================
-- MIGRATION 003: Add PDF Metadata Support to Documents Table
-- ============================================================================

-- Add PDF metadata JSON column to store extracted PDF information
ALTER TABLE documents
ADD COLUMN pdf_metadata JSON DEFAULT NULL COMMENT 'PDF metadata including page count, text content info, and extraction details';

-- Update existing PDF documents with empty metadata (will be populated on next upload)
UPDATE documents
SET pdf_metadata = JSON_OBJECT(
    'pages', 0,
    'hasText', false,
    'textLength', 0,
    'version', 'unknown',
    'info', JSON_OBJECT(),
    'extractedAt', NOW(),
    'textPreview', ''
)
WHERE has_pdf_file = TRUE AND pdf_metadata IS NULL;

-- ============================================================================
-- MIGRATION 004: Add Tutorial Document Type
-- ============================================================================

-- Add 'tutorial' to the document_type enum
ALTER TABLE documents
MODIFY COLUMN document_type ENUM('checklist', 'guide', 'tutorial') NOT NULL DEFAULT 'guide'
COMMENT 'Type of document for categorization and specialized handling';

-- Update index comment to reflect the new document type
DROP INDEX idx_document_type ON documents;
CREATE INDEX idx_document_type ON documents (document_type)
COMMENT 'Index for filtering documents by type (checklist, guide, tutorial)';

-- Update composite index comment as well
DROP INDEX idx_document_type_updated ON documents;
CREATE INDEX idx_document_type_updated ON documents (document_type, updated_at DESC)
COMMENT 'Composite index for type-based queries with sorting (includes tutorial)';

-- Update table comment to reflect tutorial support
ALTER TABLE documents
COMMENT 'Manages documents and guide articles. Supports checklist, guide, and tutorial types with PDF attachment support for tutorials';

-- ============================================================================
-- Migration Complete
-- ============================================================================
-- This consolidated migration includes all changes from:
-- - 001_enhanced_schema_mysql.sql: Core database schema
-- - 002_add_pdf_support.sql: PDF file storage capabilities
-- - 003_add_pdf_metadata.sql: PDF metadata extraction support
-- - 004_add_tutorial_document_type.sql: Tutorial document type support
--
-- All migrations have been applied in the correct sequential order
-- ensuring data integrity and proper foreign key relationships.
