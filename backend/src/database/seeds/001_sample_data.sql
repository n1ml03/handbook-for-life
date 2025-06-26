-- ============================================================================
-- SAMPLE DATA
-- ============================================================================
-- 
-- IMPORTANT NOTES:
-- 1. This file contains sample data for development and testing
-- 2. Data must be inserted in the correct order to respect foreign key constraints
-- 3. All text data supports multi-language content (JP, EN, CN, TW, KR)
-- 4. For production use, replace with actual CSV import data
--
-- INSERTION ORDER (Critical for foreign key relationships):
-- 1. Core entities: characters, skills, items, bromides
-- 2. Dependent entities: swimsuits, episodes  
-- 3. Game content: events, gachas, documents, update_logs
-- 4. Linking tables: swimsuit_skills, gacha_pools, shop_listings
-- ============================================================================

-- ============================================================================
-- 1. CHARACTERS (Core Entity)
-- ============================================================================
INSERT INTO `characters` (
  `id`, `unique_key`, `name_jp`, `name_en`, `name_cn`, `name_tw`, `name_kr`, 
  `birthday`, `height`, `measurements`, `blood_type`, `voice_actor_jp`, 
  `profile_image_url`, `is_active`, `game_version`
) VALUES
(1, 'marie-rose', 'マリー・ローズ', 'Marie Rose', '玛莉萝丝', '瑪莉蘿絲', '마리 로즈', 
 '2000-06-06', 147, 'B74/W56/H78', 'AB', 'Mai Aizawa', '/images/chars/marie-rose.png', 1, '1.0.0'),
(2, 'honoka', 'ほのか', 'Honoka', '穗香', '穗香', '호노카', 
 '2000-03-24', 150, 'B99/W58/H91', 'AB', 'Ai Nonaka', '/images/chars/honoka.png', 1, '1.0.0'),
(3, 'kasumi', 'かすみ', 'Kasumi', '霞', '霞', '카스미', 
 '2000-02-23', 158, 'B89/W54/B85', 'O', 'Houko Kuwashima', '/images/chars/kasumi.png', 1, '1.1.0'),
(4, 'misaki', 'みさき', 'Misaki', '海咲', '海咲', '미사키', 
 '2000-07-07', 160, 'B85/W55/H86', 'B', 'Minami Tsuda', '/images/chars/misaki.png', 1, '1.0.0'),
(5, 'shandy', 'シャンディ', 'Shandy', 'シャンディ', 'シャンディ', '샨디', 
 '2000-04-02', 177, 'B99/W60/H92', 'O', 'Shino Shimoji', '/images/chars/shandy.png', 1, '4.12.0');

-- ============================================================================
-- 2. SKILLS (Core Entity)
-- ============================================================================
INSERT INTO `skills` (
  `id`, `unique_key`, `name_jp`, `name_en`, `name_cn`, `name_tw`, `name_kr`, 
  `description_en`, `skill_category`, `effect_type`, `game_version`
) VALUES
(1, 'fever-skill-pow-1', 'POWフィーバースキル', 'POW Fever Skill', '力量型狂热技能', '力量型狂熱技能', '파워 피버 스킬', 
 'When attacking, high chance to trigger a Spike. Increases POW by 40%.', 'ACTIVE', 'POW_FEVER', '1.0.0'),
(2, 'fever-skill-tec-1', 'TECフィーバースキル', 'TEC Fever Skill', '技巧型狂热技能', '技巧型狂熱技能', '테크닉 피버 스킬', 
 'When attacking, high chance to trigger a Feint. Increases TEC by 40%.', 'ACTIVE', 'TEC_FEVER', '1.0.0'),
(3, 'powerful-spike-1', 'パワフルスパイク', 'Powerful Spike', '强力杀球', '強力殺球', '강력 스파이크', 
 'When a Spike is successful, POW increases by 20% for this point.', 'PASSIVE', 'POW_UP_ON_SPIKE', '1.5.0'),
(4, 'stm-boost-m', 'スタミナアップM', 'Stamina Boost (M)', '耐力提升(中)', '耐力提升(中)', '스태미너 업(M)', 
 'Increases initial Stamina by 10%.', 'POTENTIAL', 'STM_UP', '1.0.0'),
(5, 'tec-boost-l', 'テクニックアップL', 'Technique Boost (L)', '技巧提升(大)', '技巧提升(大)', '테크닉 업(L)', 
 'Increases TEC by 15%.', 'POTENTIAL', 'TEC_UP', '2.10.0'),
(6, 'birthday-cake-2022', 'バースデーケーキ2022', 'Birthday Cake 2022', '生日蛋糕2022', '生日蛋糕2022', '생일 케이크 2022', 
 'For the first 3 attacks, opponent''s POW is reduced by 20%.', 'PASSIVE', 'OPPONENT_POW_DOWN', '4.1.0'),
(7, 'appeal-technique-pp', 'アピールテクニック++', 'Appeal Technique++', 'アピールテクニック++', 'アピールテクニック++', 'アピールテクニック++', 
 'Increases TEC by 25% if suit has Malfunction.', 'POTENTIAL', 'TEC_UP_MALFUNCTION', '3.15.0');

-- ============================================================================
-- 3. ITEMS (Core Entity)
-- ============================================================================
INSERT INTO `items` (
  `id`, `unique_key`, `name_jp`, `name_en`, `name_cn`, `name_tw`, `name_kr`, 
  `description_en`, `source_description_en`, `item_category`, `rarity`, 
  `icon_url`, `game_version`
) VALUES
(1, 'v-stone-free', 'Vストーン(無償)', 'V-Stone (Free)', 'V宝石(免费)', 'V寶石(免費)', 'V스톤(무료)', 
 'A special currency used for gachas.', 'Events, Login Bonuses, Missions', 'CURRENCY', 'SSR', '/images/items/vstone.png', '1.0.0'),
(2, 'zack-money', 'ザックマネー', 'Zack Money', '扎克钱', '札克錢', '잭 머니', 
 'Standard currency for upgrading and buying items.', 'Playing matches, selling items', 'CURRENCY', 'N', '/images/items/zack-money.png', '1.0.0'),
(3, 'pow-stone-ssr', 'POW強化石(SSR)', 'POW Upgrade Stone (SSR)', 'POW强化石(SSR)', 'POW強化石(SSR)', 'POW 강화석(SSR)', 
 'Used to upgrade POW-type swimsuits.', 'Event shops, Daily matches', 'UPGRADE_MATERIAL', 'SSR', '/images/items/pow-stone-ssr.png', '1.0.0'),
(4, 'tec-crystal-sr', 'TEC強化結晶(SR)', 'TEC Upgrade Crystal (SR)', 'TEC强化结晶(SR)', 'TEC強化結晶(SR)', 'TEC 강화 결정(SR)', 
 'Used to upgrade TEC-type swimsuits.', 'Event shops, Daily matches', 'UPGRADE_MATERIAL', 'SR', '/images/items/tec-crystal-sr.png', '1.0.0'),
(5, 'cheesecake', 'チーズケーキ', 'Cheesecake', '芝士蛋糕', '起司蛋糕', '치즈 케이크', 
 'A gift that Marie Rose loves.', 'Shop', 'GIFT', 'SR', '/images/items/cheesecake.png', '1.0.0'),
(6, 'fp-refill-100', 'FP回復ドリンク100', 'FP Refill Drink (100)', 'FP回复饮料100', 'FP回復飲料100', 'FP 회복 드링크 100', 
 'Restores 100 FP.', 'Login bonuses, owner shop', 'CONSUMABLE', 'R', '/images/items/fp-drink.png', '1.2.0'),
(7, 'starlight-coin-2023', '星明かりのコイン2023', 'Starlight Coin 2023', '星光硬币2023', '星光硬幣2023', '별빛 코인 2023', 
 'Can be exchanged for items in the Starlight Ocean Festival event shop.', 'Starlight Ocean Festival Event', 'CURRENCY', 'SR', '/images/items/starlight-coin.png', '4.5.0'),
(8, 'ssr-unlock-stone', 'SSR覚醒石', 'SSR Awaken Stone', 'SSR觉醒石', 'SSR覺醒石', 'SSR 각성석', 
 'Used to awaken an SSR swimsuit to its maximum level.', 'VIP Shop, High-tier event rewards', 'UPGRADE_MATERIAL', 'SSR', '/images/items/ssr-awaken-stone.png', '2.0.0');

-- ============================================================================
-- 4. BROMIDES (Core Entity) 
-- ============================================================================
INSERT INTO `bromides` (
  `id`, `unique_key`, `name_jp`, `name_en`, `name_cn`, `name_tw`, `name_kr`, 
  `bromide_type`, `rarity`, `skill_id`, `art_url`, `game_version`
) VALUES
(1, 'deco-ssr-pow-attack-1', 'POWアタックデコブロマイド', 'SSR POW Attack Bromide', 'SSR力量攻击写真', 'SSR力量攻擊寫真', 'SSR 파워 어택 브로마이드', 
 'DECO', 'SSR', 3, '/images/bromides/deco-ssr-pow-1.png', '2.5.0'),
(2, 'deco-sr-stm-support-1', 'STMサポートデコブロマイド', 'SR STM Support Bromide', 'SR耐力辅助写真', 'SR耐力輔助寫真', 'SR 스태미너 서포트 브로마이드', 
 'DECO', 'SR', 4, '/images/bromides/deco-sr-stm-1.png', '1.10.0');

-- ============================================================================
-- 5. SWIMSUITS (Depends on characters)
-- ============================================================================
INSERT INTO `swimsuits` (
  `id`, `character_id`, `unique_key`, `name_jp`, `name_en`, `name_cn`, `name_tw`, `name_kr`, 
  `rarity`, `suit_type`, `total_stats_awakened`, `has_malfunction`, `is_limited`, 
  `release_date_gl`, `game_version`
) VALUES
(1, 1, 'ssr-marie-stellar-aquarius', 'ステラ・アクエリアス', 'Stellar Aquarius', '星光水瓶', '星光水瓶', '스텔라 아쿠아리우스', 
 'SSR', 'TEC', 5600, 1, 1, '2023-01-15', '4.5.0'),
(2, 1, 'sr-marie-blue-lagoon', 'ブルーラグーン', 'Blue Lagoon', '蓝色礁湖', '藍色礁湖', '블루 라군', 
 'SR', 'POW', 3800, 0, 0, '2021-05-10', '1.1.0'),
(3, 2, 'ssr-honoka-bouquet-plumeria', 'ブーケ・プルメリア', 'Bouquet Plumeria', '花束鸡蛋花', '花束雞蛋花', '부케 플루메리아', 
 'SSR+', 'TEC', 6200, 1, 1, '2022-03-24', '3.20.0'),
(4, 3, 'ssr-kasumi-tattered-ninja', 'かすみの忍び装束・破', 'Kasumi''s Tattered Ninja Garb', '霞的破损忍装', '霞的破損忍裝', '카스미의 낡은 닌자복', 
 'SSR', 'POW', 5450, 0, 0, '2021-08-01', '1.8.0'),
(5, 5, 'ssr-shandy-solar-flare', 'ソーラーフレア', 'Solar Flare', '太阳耀斑', '太陽耀斑', '솔라 플레어', 
 'SSR', 'POW', 5980, 1, 1, '2023-08-10', '4.12.0');

-- ============================================================================
-- 6. EPISODES (Depends on characters, swimsuits, events)
-- ============================================================================
INSERT INTO `episodes` (
  `id`, `unique_key`, `title_jp`, `title_en`, `title_cn`, `title_tw`, `title_kr`, 
  `unlock_condition_en`, `episode_type`, `related_entity_type`, `related_entity_id`, `game_version`
) VALUES
(1, 'ep-char-marie-01', 'マリーのひみつ', 'Marie''s Secret', '玛莉的秘密', '瑪莉的秘密', '마리의 비밀', 
 'Reach Character Level 10 with Marie Rose.', 'CHARACTER', 'characters', 1, '1.0.0'),
(2, 'ep-swimsuit-stellar-aquarius', '星に願いを', 'Wish Upon a Star', '向星星许愿', '向星星許願', '별에게 소원을', 
 'Obtain the "Stellar Aquarius" swimsuit for Marie Rose.', 'SWIMSUIT', 'swimsuits', 1, '4.5.0'),
(3, 'ep-main-prologue', 'プロローグ～ヴィーナス島へ～', 'Prologue ~ To Venus Island ~', '序幕～前往维纳斯岛～', '序幕～前往維納斯島～', '프롤로그 ~비너스 섬으로~', 
 'Start the game for the first time.', 'MAIN', NULL, NULL, '1.0.0');

-- ============================================================================
-- 7. EVENTS (Game Content)
-- ============================================================================
INSERT INTO `events` (
  `id`, `unique_key`, `name_jp`, `name_en`, `name_cn`, `name_tw`, `name_kr`, 
  `type`, `game_version`, `start_date`, `end_date`
) VALUES
(1, 'festival-starlight-ocean-2023', 'きらめく夜空のオーシャンフェス', 'Starlight Ocean Festival', '闪耀夜空的海洋庆典', '閃耀夜空的海洋慶典', '반짝이는 밤하늘의 오션 페스티벌', 
 'FESTIVAL_RANKING', '4.5.0', '2023-01-15 04:00:00', '2023-01-25 03:59:59'),
(2, 'honoka-birthday-2022', 'ほのかバースデー', 'Honoka''s Birthday Bash 2022', '穗香生日会2022', '穗香生日會2022', '호노카 생일 파티 2022', 
 'LOGIN_BONUS', '3.20.0', '2022-03-24 04:00:00', '2022-03-31 03:59:59'),
(3, 'rock-climbing-fiery-challenge', 'ロッククライミング～炎の挑戦～', 'Rock Climbing - Fiery Challenge', '攀岩～火焰的挑战～', '攀岩～火焰的挑戰～', '암벽 등반 ~불꽃의 도전~', 
 'ROCK_CLIMBING', '4.12.0', '2023-08-10 04:00:00', '2023-08-18 03:59:59');

-- ============================================================================
-- 8. GACHAS (Game Content)
-- ============================================================================
INSERT INTO `gachas` (
  `id`, `unique_key`, `name_jp`, `name_en`, `name_cn`, `name_tw`, `name_kr`, 
  `gacha_subtype`, `game_version`, `start_date`, `end_date`
) VALUES
(1, 'gacha-trendy-starlight-ocean-2023', 'トレンドコーデガチャ(ステラ・アクエリアス)', 'Trendy Gacha (Stellar Aquarius)', '潮流穿搭扭蛋(星光水瓶)', '潮流穿搭扭蛋(星光水瓶)', '트렌드 코디 뽑기(스텔라 아쿠아리우스)', 
 'TRENDY', '4.5.0', '2023-01-15 04:00:00', '2023-01-25 03:59:59'),
(2, 'gacha-honoka-birthday-2022', 'ジュエル＆ステラコーデガチャ(ほのか)', 'Jewel & Stella Gacha (Honoka)', '宝石&星光穿搭扭蛋(穗香)', '寶石&星光穿搭扭蛋(穗香)', '주얼&스텔라 코디 뽑기(호노카)', 
 'BIRTHDAY', '3.20.0', '2022-03-24 04:00:00', '2022-03-31 03:59:59'),
(3, 'gacha-nostalgic-ninja-2021', 'なつかしコーデガチャ(かすみの忍び装束)', 'Nostalgic Gacha (Kasumi''s Ninja Garb)', '怀旧穿搭扭蛋(霞的忍装)', '懷舊穿搭扭蛋(霞的忍裝)', '추억의 코디 뽑기(카스미의 닌자복)', 
 'NOSTALGIC', '2.8.0', '2022-09-01 04:00:00', '2022-09-08 03:59:59');

-- ============================================================================
-- 9. DOCUMENTS (Content Management)
-- ============================================================================
INSERT INTO `documents` (
  `unique_key`, `title_en`, `summary_en`, `content_json_en`, `is_published`, 
  `created_at`, `updated_at`
) VALUES
('beginners-guide-to-festivals', 'Beginner''s Guide to Festivals', 
 'Learn the basics of how to participate and win in ranking and cumulative festivals.', 
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Welcome to the festival guide! First, make sure you have a Trend swimsuit to get the best score."}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Festival Types"}]},{"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Ranking Festivals: Compete against other players for the top score."}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Cumulative Festivals: Work towards milestone rewards by accumulating points."}]}]}]}', 
 1, NOW(), NOW()),
('character-optimization-guide', 'Character Optimization Guide',
 'Advanced strategies for maximizing your character''s potential in matches.',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"This guide covers advanced techniques for character optimization and skill synergy."}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Stat Priority"}]},{"type":"paragraph","content":[{"type":"text","text":"Focus on the stat that matches your swimsuit type for maximum effectiveness."}]}]}',
 1, NOW(), NOW());

-- ============================================================================
-- 10. UPDATE_LOGS (Version Tracking)
-- ============================================================================
INSERT INTO `update_logs` (
  `unique_key`, `version`, `title`, `content`, `description`, `date`, 
  `tags`, `is_published`, `created_at`, `updated_at`
) VALUES
('v4-5-0-starlight-ocean', '4.5.0', 'Starlight Ocean Festival Update', 
 'Major update introducing the Starlight Ocean Festival event with new SSR swimsuits and exclusive rewards.',
 'This update brings the highly anticipated Starlight Ocean Festival, featuring Marie Rose''s new SSR Stellar Aquarius swimsuit and various festival-themed content.',
 '2023-01-15 04:00:00', '["event", "festival", "ssr", "marie-rose"]', 1, NOW(), NOW()),
('v4-12-0-shandy-debut', '4.12.0', 'New Character: Shandy Debut', 
 'Welcome Shandy, the newest character to join Venus Island! Featuring unique Solar Flare swimsuit.',
 'Shandy makes her debut with exclusive content and special introduction campaign.',
 '2023-08-10 04:00:00', '["character", "new", "shandy", "debut"]', 1, NOW(), NOW());

-- ============================================================================
-- 11. LINKING TABLES
-- ============================================================================

-- Swimsuit Skills (Linking swimsuits to skills)
INSERT INTO `swimsuit_skills` (`swimsuit_id`, `skill_id`, `skill_slot`) VALUES
(1, 2, 'ACTIVE'),      -- Stellar Aquarius (TEC SSR) gets TEC Fever
(1, 5, 'POTENTIAL_1'), -- and TEC Boost (L)
(1, 7, 'POTENTIAL_2'), -- and Appeal Technique++
(3, 2, 'ACTIVE'),      -- Bouquet Plumeria (TEC SSR+) gets TEC Fever
(3, 6, 'PASSIVE_1'),   -- and the special Birthday passive
(3, 5, 'POTENTIAL_1'), -- and TEC Boost (L)
(3, 7, 'POTENTIAL_2'), -- and Appeal Technique++
(4, 1, 'ACTIVE'),      -- Tattered Ninja (POW SSR) gets POW Fever
(4, 3, 'PASSIVE_1'),   -- and Powerful Spike
(4, 4, 'POTENTIAL_1'), -- and Stamina Boost (M)
(5, 1, 'ACTIVE'),      -- Solar Flare (POW SSR) gets POW Fever
(5, 3, 'PASSIVE_1');   -- and Powerful Spike

-- Gacha Pools (Linking gachas to rewards)
INSERT INTO `gacha_pools` (`gacha_id`, `pool_item_type`, `item_id`, `drop_rate`, `is_featured`) VALUES
-- Pool for Trendy Gacha (Stellar Aquarius)
(1, 'SWIMSUIT', 1, 0.7800, 1),    -- Featured: Stellar Aquarius (Marie)
(1, 'SWIMSUIT', 2, 5.0000, 0),    -- SR Blue Lagoon
(1, 'ITEM', 3, 10.0000, 0),       -- POW Upgrade Stone
(1, 'BROMIDE', 2, 2.5000, 0),     -- SR Stamina Bromide

-- Pool for Honoka Birthday Gacha
(2, 'SWIMSUIT', 3, 1.1000, 1),    -- Featured: Bouquet Plumeria (Honoka)
(2, 'SWIMSUIT', 4, 0.0200, 0),    -- A random permanent SSR (Kasumi's)
(2, 'ITEM', 1, 15.0000, 0),       -- V-Stones
(2, 'ITEM', 5, 5.0000, 0);        -- Cheesecake

-- Shop Listings
INSERT INTO `shop_listings` (`shop_type`, `item_id`, `cost_currency_item_id`, `cost_amount`, `start_date`, `end_date`) VALUES
('EVENT', 8, 7, 500, '2023-01-15 04:00:00', '2023-02-01 03:59:59'), -- Buy SSR Awaken Stone with 500 Starlight Coins
('VIP', 8, 1, 5000, NULL, NULL),                                    -- Buy SSR Awaken Stone with 5000 PAID V-Stones
('GENERAL', 6, 2, 10000, NULL, NULL);                               -- Buy FP Drink with Zack Money

-- ============================================================================
-- DATA INSERTION COMPLETE
-- ============================================================================
-- 
-- Summary of inserted data:
-- - 5 Characters (Marie Rose, Honoka, Kasumi, Misaki, Shandy)
-- - 7 Skills (Fever skills, passive abilities, potential upgrades)
-- - 8 Items (Currencies, upgrade materials, gifts, consumables)
-- - 2 Bromides (Deco-Bromides with skill effects)
-- - 5 Swimsuits (SSR and SR tier swimsuits)
-- - 3 Episodes (Character and swimsuit stories)
-- - 3 Events (Festival ranking, birthday, rock climbing)
-- - 3 Gachas (Trendy, birthday, nostalgic)
-- - 2 Documents (Festival guide, optimization guide)
-- - 2 Update Logs (Version 4.5.0 and 4.12.0)
-- - Multiple linking relationships (swimsuit_skills, gacha_pools, shop_listings)
--
-- This sample data provides a complete foundation for testing all API endpoints
-- and database relationships in the DOAXVV Handbook application.
-- ============================================================================ 