# Data Import Guide for Handbook Database

This document describes the structure of the CSV files and the workflow for accurately importing data into the MySQL database.

## CSV File Structure

All files must be saved in `CSV (UTF-8)` format to prevent character encoding issues.

### 1.1. Core Tables (Script-handled for translation data)

These files contain translation columns and require a special script for processing.

#### `characters.csv`

Stores basic information and translated names for characters.

| id | unique_key | birthday | height | measurements | blood_type | voice_actor_jp | profile_image_url | is_active | name_en | name_jp | name_cn | name_tw | name_ko |
|----|------------|----------|--------|--------------|------------|----------------|-------------------|-----------|---------|---------|---------|---------|---------|
| _(number)_ | _(text)_ | _(YYYY-MM-DD)_ | _(number)_ | _(text)_ | _(text)_ | _(text)_ | _(url)_ | _(0 or 1)_ | _(text)_ | _(text)_ | _(text)_ | _(text)_ | _(text)_ |

#### `skills.csv`

Defines skills and their translated names/descriptions.

| id | unique_key | skill_category | condition_text | effect_type | effect_target | effect_value_percent | effect_chance_percent | effect_duration_turns | name_en | name_jp | description_en | description_jp |
|----|------------|----------------|----------------|-------------|---------------|----------------------|-----------------------|-----------------------|---------|---------|----------------|----------------|
| _(number)_ | _(text)_ | _(ACTIVE/PASSIVE/POTENTIAL)_ | _(text)_ | _(text)_ | _(SELF/TEAMMATE...)_ | _(number.decimal)_ | _(number)_ | _(number)_ | _(text)_ | _(text)_ | _(text)_ | _(text)_ |

#### `swimsuits.csv`

Contains main information about swimsuits.

| id | character_id | unique_key | rarity | suit_type | pow_awakened | tec_awakened | stm_awakened | has_malfunction | is_limited | is_nostalgia | name_en | name_jp |
|----|--------------|------------|--------|-----------|--------------|--------------|--------------|-----------------|------------|--------------|---------|---------|
| _(number)_ | _(number)_ | _(text)_ | _(SSR/SR...)_ | _(POW/TEC...)_ | _(number)_ | _(number)_ | _(number)_ | _(0 or 1)_ | _(0 or 1)_ | _(0 or 1)_ | _(text)_ | _(text)_ |

#### `items.csv`

The master table for all in-game items.

| id | unique_key | item_category | item_type | rarity | is_stackable | stack_limit | effect_value_1 | source_description_key | icon_url | name_en | name_jp | description_en | description_jp | source_description_en | source_description_jp |
|----|------------|---------------|-----------|--------|--------------|-------------|----------------|------------------------|----------|---------|---------|----------------|----------------|-----------------------|-----------------------|
| _(number)_ | _(text)_ | _(CURRENCY...)_ | _(text)_ | _(N/R...)_ | _(0 or 1)_ | _(number)_ | _(number)_ | _(text)_ | _(url)_ | _(text)_ | _(text)_ | _(text)_ | _(text)_ | _(text)_ | _(text)_ |

#### `bromides.csv`

Information about Deco-Bromides.

| id | unique_key | bromide_type | rarity | skill_id | pow_bonus | tec_bonus | stm_bonus | appeal_bonus | art_url | name_en | name_jp |
|----|------------|--------------|--------|----------|-----------|-----------|-----------|--------------|---------|---------|---------|
| _(number)_ | _(text)_ | _(DECO/OWNER)_ | _(R/SR/SSR)_ | _(number)_ | _(number)_ | _(number)_ | _(number)_ | _(number)_ | _(url)_ | _(text)_ | _(text)_ |

#### `event_campaigns.csv`, `events.csv`, & `gachas.csv`

Similarly, these files contain `name_en` and `name_jp` translation columns at the end and will be processed by the import script.

### 1.2. Linking Tables (Can be imported directly)

These files do not contain translation columns and have a 1-to-1 structure with their corresponding database tables.

#### `character_releases.csv`

| character_id | server_region | release_date |
|--------------|---------------|--------------|
| _(number)_ | _(JP/GL/SEA)_ | _(YYYY-MM-DD)_ |

#### `swimsuit_skills.csv`

| swimsuit_id | skill_id | skill_slot | unlock_level |
|-------------|----------|------------|--------------|
| _(number)_ | _(number)_ | _(ACTIVE/PASSIVE_1...)_ | _(number)_ |

#### `swimsuit_awakening_costs.csv`

| swimsuit_id | item_id | awakening_level | quantity |
|-------------|---------|-----------------|----------|
| _(number)_ | _(number)_ | _(1-4)_ | _(number)_ |

#### `character_gift_preferences.csv`

| character_id | item_id | preference_level | exp_bonus |
|--------------|---------|------------------|-----------|
| _(number)_ | _(number)_ | _(LOVE/LIKE...)_ | _(number)_ |

#### `event_trendy_swimsuits.csv`

| event_id | swimsuit_id | bonus_type |
|----------|-------------|------------|
| _(number)_ | _(number)_ | _(SMALL/MEDIUM/LARGE)_ |

#### `gacha_pools.csv`

| gacha_id | pool_item_type | swimsuit_id | bromide_id | item_id | drop_rate | is_featured |
|----------|----------------|-------------|------------|---------|-----------|-------------|
| _(number)_ | _(SWIMSUIT/BROMIDE/ITEM)_ | _(number or blank)_ | _(number or blank)_ | _(number or blank)_ | _(number.decimal)_ | _(0 or 1)_ |

---

## Data Import Workflow

This process must be followed in the correct order to ensure foreign key constraints are not violated.

### Import Order

Run your import script for the files in the following sequence:

1.  **Group 1 (Root Entities):**
    -   `characters.csv`
    -   `skills.csv`
    -   `items.csv`
    -   `bromides.csv`

2.  **Group 2 (Depend on Group 1):**
    -   `character_releases.csv`
    -   `swimsuits.csv`
    -   `swimsuit_awakening_costs.csv`
    -   `character_gift_preferences.csv`

3.  **Group 3 (Remaining Links):**
    -   `swimsuit_skills.csv`

4.  **Group 4 (Game Content):**
    -   `event_campaigns.csv`
    -   `events.csv`
    -   `gachas.csv`

5.  **Group 5 (Depend on Group 4):**
    -   `event_trendy_swimsuits.csv`
    -   `gacha_pools.csv`