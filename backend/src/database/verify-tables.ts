#!/usr/bin/env bun
import { pool, initializePool, executeQuery } from '../config/database';
import logger from '../config/logger';

async function verifyAndCreateMissingTables() {
  try {
    await initializePool();
    
    // Check existing tables
    const [result] = await executeQuery(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      ORDER BY TABLE_NAME
    `);
    
    const existingTables = result as any[];
    const tableNames = existingTables.map(row => row.TABLE_NAME);
    
    logger.info('Existing tables:', { tables: tableNames });
    
    const expectedTables = [
      'characters', 'swimsuits', 'skills', 'items', 
      'bromides', 'episodes', 'events', 'documents', 
      'update_logs', 'gachas', 'shop_listings', 
      'swimsuit_skills', 'gacha_pools'
    ];
    
    const missingTables = expectedTables.filter(table => !tableNames.includes(table));
    
    if (missingTables.length > 0) {
      logger.warn('Missing tables:', { missingTables });
      
      // Create missing tables manually
      for (const tableName of missingTables) {
        await createTable(tableName);
      }
    } else {
      logger.info('All expected tables exist');
    }
    
  } catch (error) {
    logger.error('Verification failed:', error);
    throw error;
  }
}

async function createTable(tableName: string) {
  logger.info(`Creating table: ${tableName}`);
  
  const tableSchemas: Record<string, string> = {
    characters: `
      CREATE TABLE characters (
        id SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        unique_key VARCHAR(100) NOT NULL UNIQUE,
        name_jp VARCHAR(100) NOT NULL,
        name_en VARCHAR(100) NOT NULL,
        name_cn VARCHAR(100) NOT NULL,
        name_tw VARCHAR(100) NOT NULL,
        name_kr VARCHAR(100) NOT NULL,
        birthday DATE,
        height SMALLINT UNSIGNED,
        measurements VARCHAR(20),
        blood_type VARCHAR(5),
        voice_actor_jp VARCHAR(100),
        profile_image_data LONGBLOB,
        profile_image_mime_type VARCHAR(50),
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        game_version VARCHAR(30) NULL,
        INDEX idx_birthday (birthday),
        INDEX idx_game_version (game_version)
      ) ENGINE=InnoDB
    `,
    swimsuits: `
      CREATE TABLE swimsuits (
        id MEDIUMINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        character_id SMALLINT UNSIGNED NOT NULL,
        unique_key VARCHAR(150) NOT NULL UNIQUE,
        name_jp VARCHAR(255) NOT NULL,
        name_en VARCHAR(255) NOT NULL,
        name_cn VARCHAR(255) NOT NULL,
        name_tw VARCHAR(255) NOT NULL,
        name_kr VARCHAR(255) NOT NULL,
        description_en TEXT,
        rarity ENUM('N','R','SR','SSR', 'SSR+') NOT NULL,
        suit_type ENUM('POW', 'TEC', 'STM', 'APL', 'N/A') NOT NULL,
        total_stats_awakened SMALLINT UNSIGNED NOT NULL DEFAULT 0,
        has_malfunction BOOLEAN NOT NULL DEFAULT FALSE,
        is_limited BOOLEAN NOT NULL DEFAULT TRUE,
        release_date_gl DATE,
        game_version VARCHAR(30) NULL,
        image_before_data LONGBLOB,
        image_before_mime_type VARCHAR(50),
        image_after_data LONGBLOB,
        image_after_mime_type VARCHAR(50),
        FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
        INDEX idx_char_rarity_type (character_id, rarity, suit_type),
        INDEX idx_stats_awakened (total_stats_awakened DESC),
        INDEX idx_game_version (game_version)
      ) ENGINE=InnoDB
    `,
    events: `
      CREATE TABLE events (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        unique_key VARCHAR(150) NOT NULL UNIQUE,
        name_jp VARCHAR(255) NOT NULL,
        name_en VARCHAR(255) NOT NULL,
        name_cn VARCHAR(255) NOT NULL,
        name_tw VARCHAR(255) NOT NULL,
        name_kr VARCHAR(255) NOT NULL,
        type ENUM('FESTIVAL_RANKING','FESTIVAL_CUMULATIVE','TOWER','ROCK_CLIMBING', 'BUTT_BATTLE', 'LOGIN_BONUS', 'STORY') NOT NULL,
        game_version VARCHAR(30) NULL,
        start_date DATETIME NOT NULL,
        end_date DATETIME NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT FALSE,
        INDEX idx_active_date (is_active, start_date DESC),
        INDEX idx_game_version (game_version)
      ) ENGINE=InnoDB
    `,
    swimsuit_skills: `
      CREATE TABLE swimsuit_skills (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        swimsuit_id MEDIUMINT UNSIGNED NOT NULL,
        skill_id INT UNSIGNED NOT NULL,
        skill_level TINYINT UNSIGNED NOT NULL DEFAULT 1,
        FOREIGN KEY (swimsuit_id) REFERENCES swimsuits(id) ON DELETE CASCADE,
        FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
        UNIQUE KEY unique_swimsuit_skill (swimsuit_id, skill_id)
      ) ENGINE=InnoDB
    `,
    gacha_pools: `
      CREATE TABLE gacha_pools (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        gacha_id INT UNSIGNED NOT NULL,
        swimsuit_id MEDIUMINT UNSIGNED NOT NULL,
        pool_type ENUM('FEATURED', 'STANDARD', 'STEP_UP') NOT NULL DEFAULT 'STANDARD',
        FOREIGN KEY (gacha_id) REFERENCES gachas(id) ON DELETE CASCADE,
        FOREIGN KEY (swimsuit_id) REFERENCES swimsuits(id) ON DELETE CASCADE,
        INDEX idx_gacha_pool (gacha_id, pool_type)
      ) ENGINE=InnoDB
    `
  };
  
  const schema = tableSchemas[tableName];
  if (schema) {
    try {
      await executeQuery(schema);
      logger.info(`Table ${tableName} created successfully`);
    } catch (error: any) {
      if (error.code === 'ER_TABLE_EXISTS_ERROR') {
        logger.info(`Table ${tableName} already exists`);
      } else {
        logger.error(`Failed to create table ${tableName}:`, error);
      }
    }
  } else {
    logger.warn(`No schema defined for table: ${tableName}`);
  }
}

// Run verification
async function main() {
  try {
    await verifyAndCreateMissingTables();
    logger.info('Table verification completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Table verification failed:', error);
    process.exit(1);
  }
}

if (import.meta.main) {
  main();
}