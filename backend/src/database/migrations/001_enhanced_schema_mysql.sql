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
    profile_image_url VARCHAR(255) COMMENT 'URL to the character''s profile image',
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
    icon_url VARCHAR(255) COMMENT 'URL to the icon image',
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
    art_url VARCHAR(255) COMMENT 'URL to the full art image',
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
    is_active BOOLEAN GENERATED ALWAYS AS (NOW() BETWEEN start_date AND end_date) STORED COMMENT 'Automatically calculates if the event is currently active',
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

CREATE TABLE documents (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Auto-incrementing ID, the primary key for the document',
    unique_key VARCHAR(150) NOT NULL UNIQUE COMMENT 'Text-based unique identifier, used for URLs',
    title_en VARCHAR(255) NOT NULL COMMENT 'Main title of the document (English)',
    summary_en TEXT COMMENT 'Summary of the document (English)',
    content_json_en JSON NULL COMMENT 'Document content in English, stored as JSON from Tiptap',
    is_published BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Flag for pre-publication drafting',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation time',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update time',
    INDEX idx_published_key (is_published, unique_key) COMMENT 'Optimized for accessing published documents'
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
    is_published BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Whether the update log is published',
    technical_details JSON COMMENT 'Technical details array',
    bug_fixes JSON COMMENT 'Bug fixes array',
    screenshots JSON COMMENT 'Screenshots array',
    metrics JSON COMMENT 'Performance metrics object',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation time',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update time',
    INDEX idx_published_date (is_published, date DESC) COMMENT 'Optimized for fetching published updates by date',
    INDEX idx_version (version) COMMENT 'Index for version lookups'
) ENGINE=InnoDB COMMENT='Manages application update logs and release notes.';

-- ============================================================================
-- 3. LINKING TABLES
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

COMMENT ON VIEW v_timeline IS 'A virtual table that creates an update timeline for the HomePage.';