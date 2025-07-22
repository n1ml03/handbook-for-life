# Database Tables Overview - DOAXVV Handbook

## 1. CORE TABLES

### characters - Character Information
- id
- unique_key
- name_jp
- name_en
- name_cn
- name_tw
- name_kr
- birthday
- height
- measurements
- blood_type
- voice_actor_jp
- profile_image_data

### swimsuits - Swimsuit Collection
- id
- character_id
- unique_key
- name_jp
- name_en
- name_cn
- name_tw
- name_kr
- description_en
- rarity
- suit_type
- total_stats_awakened
- has_malfunction
- image_before_data
- image_after_data

### skills - Skill Library
- id
- unique_key
- name_jp
- name_en
- name_cn
- name_tw
- name_kr
- description_en
- skill_category
- effect_type

### items - Item Collection
- id
- unique_key
- name_jp
- name_en
- name_cn
- name_tw
- name_kr
- description_en
- item_category
- rarity
- icon_data

### bromides - Bromide Collection
- id
- unique_key
- name_jp
- name_en
- name_cn
- name_tw
- name_kr
- bromide_type
- rarity
- image

### episodes - Story Episodes
- id
- unique_key
- title_jp
- title_en
- title_cn
- title_tw
- title_kr
- unlock_condition_en
- episode_type
- related_entity_type
- related_entity_id

## 2. EVENT & CONTENT TABLES

### events - Game Events
- id
- unique_key
- name_jp
- name_en
- name_cn
- name_tw
- name_kr
- start_date
- end_date

### gachas - Gacha Banners
- id
- unique_key
- name_jp
- name_en
- name_cn
- name_tw
- name_kr
- start_date
- end_date
- banner_image_data

---

### Multi-language Fields:
All main entities have 5 languages: _jp, _en, _cn, _tw, _kr 