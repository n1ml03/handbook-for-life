-- ============================================================================
-- DOAX Venus Vacation Handbook - Complete Database Schema
-- ============================================================================
-- File: complete_database_schema.sql
-- Description: Complete database schema with all tables, indexes, and constraints
-- Character Set: UTF8MB4 for full Unicode support including emojis
-- Engine: InnoDB for ACID compliance and foreign key support
-- Version: Consolidated from migrations 001, 002, and 003
-- ============================================================================

CREATE DATABASE IF NOT EXISTS doaxvv_handbook
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE doaxvv_handbook;

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
    birthday DATE COMMENT 'Character''s date of birth',
    height SMALLINT UNSIGNED COMMENT 'Height (cm)',
    measurements VARCHAR(20) COMMENT 'Three sizes (B/W/H)',
    blood_type VARCHAR(5) COMMENT 'Blood type',
    voice_actor_jp VARCHAR(100) COMMENT 'Voice actor name (Japanese)',
    profile_image_data LONGBLOB COMMENT 'Binary data of the character''s profile image',
    profile_image_mime_type VARCHAR(50) COMMENT 'MIME type of the profile image (e.g., image/jpeg, image/png)',
    is_active BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Whether the character is still active in the game',
    game_version VARCHAR(30) NULL COMMENT 'Game version when the character was added',
    INDEX idx_birthday (birthday) COMMENT 'Index for finding upcoming birthdays',
    INDEX idx_game_version (game_version)
) ENGINE=InnoDB COMMENT='Stores basic information about the characters.';

CREATE TABLE swimsuits (
    id MEDIUMINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Auto-incrementing ID, the primary key for the swimsuit',
    character_id SMALLINT UNSIGNED NOT NULL COMMENT 'Foreign key, links to the owning character',
    unique_key VARCHAR(150) NOT NULL UNIQUE COMMENT 'Text-based unique identifier, immutable',
    name_jp VARCHAR(255) NOT NULL COMMENT 'Swimsuit name (Japanese)',
    name_en VARCHAR(255) NOT NULL COMMENT 'Swimsuit name (English)',
    name_cn VARCHAR(255) NOT NULL COMMENT 'Swimsuit name (Simplified Chinese)',
    name_tw VARCHAR(255) NOT NULL COMMENT 'Swimsuit name (Traditional Chinese)',
    name_kr VARCHAR(255) NOT NULL COMMENT 'Swimsuit name (Korean)',
    description_en TEXT COMMENT 'Swimsuit description (English)',
    rarity ENUM('N','R','SR','SSR', 'SSR+') NOT NULL COMMENT 'Rarity',
    suit_type ENUM('POW', 'TEC', 'STM', 'APL', 'N/A') NOT NULL COMMENT 'Main stat type',
    total_stats_awakened SMALLINT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Total stats after being fully awakened',
    has_malfunction BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Whether it has a Malfunction effect',
    is_limited BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Whether it is a time-limited swimsuit',
    release_date_gl DATE COMMENT 'Release date on the Global server',
    game_version VARCHAR(30) NULL COMMENT 'Game version when the swimsuit was released',
    image_before_data LONGBLOB COMMENT 'Binary data of the before malfunction image',
    image_before_mime_type VARCHAR(50) COMMENT 'MIME type of the before malfunction image',
    image_after_data LONGBLOB COMMENT 'Binary data of the after malfunction image',
    image_after_mime_type VARCHAR(50) COMMENT 'MIME type of the after malfunction image',
    FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
    INDEX idx_char_rarity_type (character_id, rarity, suit_type) COMMENT 'Composite index for powerful filtering',
    INDEX idx_stats_awakened (total_stats_awakened DESC) COMMENT 'Optimized for sorting by stats',
    INDEX idx_game_version (game_version)
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
    name_jp VARCHAR(150) NOT NULL COMMENT 'Item name (Japanese)',
    name_en VARCHAR(150) NOT NULL COMMENT 'Item name (English)',
    name_cn VARCHAR(150) NOT NULL COMMENT 'Item name (Simplified Chinese)',
    name_tw VARCHAR(150) NOT NULL COMMENT 'Item name (Traditional Chinese)',
    name_kr VARCHAR(150) NOT NULL COMMENT 'Item name (Korean)',
    description_en TEXT COMMENT 'Item description (English)',
    source_description_en TEXT COMMENT 'Description of the item''s source (English)',
    item_category ENUM('CURRENCY', 'UPGRADE_MATERIAL', 'CONSUMABLE', 'GIFT', 'ACCESSORY', 'FURNITURE', 'SPECIAL') NOT NULL COMMENT 'Main item category classification',
    rarity ENUM('N','R','SR','SSR') NOT NULL COMMENT 'Rarity',
    icon_data LONGBLOB COMMENT 'Binary data of the item icon image',
    icon_mime_type VARCHAR(50) COMMENT 'MIME type of the icon image',
    game_version VARCHAR(30) NULL COMMENT 'Game version when the item was introduced',
    INDEX idx_item_category (item_category) COMMENT 'Optimized for filtering items',
    INDEX idx_game_version (game_version)
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
    unique_key VARCHAR(200) NOT NULL UNIQUE COMMENT 'Text-based unique identifier, immutable',
    title_jp VARCHAR(255) NOT NULL COMMENT 'Episode title (Japanese)',
    title_en VARCHAR(255) NOT NULL COMMENT 'Episode title (English)',
    title_cn VARCHAR(255) NOT NULL COMMENT 'Episode title (Simplified Chinese)',
    title_tw VARCHAR(255) NOT NULL COMMENT 'Episode title (Traditional Chinese)',
    title_kr VARCHAR(255) NOT NULL COMMENT 'Episode title (Korean)',
    unlock_condition_en TEXT COMMENT 'Unlock condition (English)',
    episode_type ENUM('MAIN', 'CHARACTER', 'EVENT', 'SWIMSUIT', 'ITEM') NOT NULL COMMENT 'Story type',
    related_entity_type VARCHAR(64) COMMENT 'Table name of the related entity',
    related_entity_id INT UNSIGNED COMMENT 'ID of the related entity',
    game_version VARCHAR(30) NULL COMMENT 'Game version when the episode was released',
    INDEX idx_episode_type_entity (episode_type, related_entity_type, related_entity_id) COMMENT 'Optimized for filtering stories',
    INDEX idx_game_version (game_version)
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

CREATE TABLE shop_listings (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Auto-incrementing ID, primary key',
    shop_type ENUM('EVENT', 'VIP', 'GENERAL', 'CURRENCY') NOT NULL COMMENT 'Shop type',
    item_id INT UNSIGNED NOT NULL COMMENT 'Item being sold',
    cost_currency_item_id INT UNSIGNED NOT NULL COMMENT 'Currency type used for purchase',
    cost_amount INT UNSIGNED NOT NULL COMMENT 'Amount required for purchase',
    start_date DATETIME COMMENT 'Sale start date',
    end_date DATETIME COMMENT 'Sale end date',
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
    FOREIGN KEY (cost_currency_item_id) REFERENCES items(id) ON DELETE CASCADE,
    INDEX idx_shop_type_dates (shop_type, start_date, end_date) COMMENT 'Optimized for filtering shops by type and time'
) ENGINE=InnoDB COMMENT='Data for items in the in-game shop, used for the ShopPage.';

-- ============================================================================
-- 3. DOCUMENT MANAGEMENT TABLES (with PDF Support)
-- ============================================================================

CREATE TABLE documents (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Auto-incrementing ID, the primary key for the document',
    unique_key VARCHAR(150) NOT NULL UNIQUE COMMENT 'Text-based unique identifier, used for URLs',
    title_en VARCHAR(255) NOT NULL COMMENT 'Main title of the document (English)',
    summary_en TEXT COMMENT 'Summary of the document (English)',
    document_type ENUM('checklist', 'guide', 'tutorial') NOT NULL DEFAULT 'guide' COMMENT 'Type of document for categorization and specialized handling',
    content_json_en JSON NULL COMMENT 'Document content in English, stored as JSON from Tiptap',
    screenshots_data JSON COMMENT 'Array of screenshot objects with binary data and metadata: [{data: LONGBLOB, mimeType: string, filename: string}]',
    -- PDF Support Fields
    pdf_data LONGBLOB COMMENT 'Binary PDF file data',
    pdf_filename VARCHAR(255) COMMENT 'Original PDF filename',
    pdf_mime_type VARCHAR(100) DEFAULT 'application/pdf' COMMENT 'PDF MIME type',
    pdf_size INT UNSIGNED COMMENT 'PDF file size in bytes',
    has_pdf_file BOOLEAN DEFAULT FALSE COMMENT 'Flag indicating if document has PDF attachment',
    pdf_metadata JSON DEFAULT NULL COMMENT 'PDF metadata including page count, text content info, and extraction details',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation time',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update time',
    INDEX idx_unique_key (unique_key) COMMENT 'Optimized for accessing documents by unique key',
    INDEX idx_document_type (document_type) COMMENT 'Index for filtering documents by type',
    INDEX idx_document_type_updated (document_type, updated_at DESC) COMMENT 'Composite index for type-based queries with sorting',
    INDEX idx_documents_has_pdf (has_pdf_file) COMMENT 'Index for faster queries on documents with PDF files',
    INDEX idx_documents_pdf_filename (pdf_filename) COMMENT 'Index for PDF filename searches'
) ENGINE=InnoDB COMMENT='Manages documents and guide articles with PDF attachment support.';

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
-- 4. LINKING TABLES
-- ============================================================================

CREATE TABLE swimsuit_skills (
    swimsuit_id MEDIUMINT UNSIGNED NOT NULL COMMENT 'Foreign key, links to a swimsuit',
    skill_id INT UNSIGNED NOT NULL COMMENT 'Foreign key, links to a skill',
    skill_slot ENUM('ACTIVE', 'PASSIVE_1', 'PASSIVE_2', 'POTENTIAL_1', 'POTENTIAL_2', 'POTENTIAL_3', 'POTENTIAL_4') NOT NULL COMMENT 'The position of the skill on the swimsuit',
    PRIMARY KEY (swimsuit_id, skill_slot),
    FOREIGN KEY (swimsuit_id) REFERENCES swimsuits(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Links Swimsuits and Skills.';

CREATE TABLE gacha_pools (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Auto-incrementing ID, primary key',
    gacha_id INT UNSIGNED NOT NULL COMMENT 'Foreign key, indicates which gacha this item belongs to',
    pool_item_type ENUM('SWIMSUIT', 'BROMIDE', 'ITEM') NOT NULL COMMENT 'Type of item in the pool',
    item_id INT UNSIGNED NOT NULL COMMENT 'ID of the corresponding item (ID from the swimsuits, bromides, or items table)',
    drop_rate DECIMAL(6,4) NOT NULL COMMENT 'Drop rate',
    is_featured BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Whether the item is featured (rate-up)',
    FOREIGN KEY (gacha_id) REFERENCES gachas(id) ON DELETE CASCADE,
    INDEX idx_gacha_id (gacha_id) COMMENT 'Optimized for fetching the entire pool of a gacha'
) ENGINE=InnoDB COMMENT='Item pool for each Gacha.';

-- ============================================================================
-- 5. VIEWS - Optimized for HomePage Queries
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
-- End of Schema
-- ============================================================================