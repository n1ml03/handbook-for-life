USE doaxvv_handbook;

-- ============================================================================
-- 1. DỮ LIỆU CÁC THỰC THỂ CỐT LÕI
-- ============================================================================

-- === CHARACTERS ===
INSERT INTO `characters` (`id`, `unique_key`, `birthday`, `height`, `measurements`, `blood_type`, `voice_actor_jp`, `profile_image_url`, `is_active`) VALUES
(1, 'misaki', '1999-07-07', 160, 'B85/W55/H86', 'B', 'Tsuda Minami', 'url/misaki.png', 1),
(2, 'honoka', '2000-03-24', 150, 'B99/W58/H91', 'AB', 'Nonaka Ai', 'url/honoka.png', 1),
(3, 'marie_rose', '2002-06-06', 147, 'B74/W56/H78', 'AB', 'Aisaka Yūka', 'url/marie_rose.png', 1),
(4, 'kasumi', '1998-02-23', 158, 'B89/W54/H85', 'O', 'Kuwashima Hōko', 'url/kasumi.png', 1),
(5, 'fiona', '2001-08-11', 152, 'B82/W53/H84', 'A', 'Kaede Hondo', 'url/fiona.png', 1),
(6, 'luna', '2000-10-15', 149, 'B90/W55/H88', 'O', 'Mikami Shiori', 'url/luna.png', 1),
(7, 'momiji', '1997-09-20', 161, 'B92/W58/H88', 'A', 'Minaguchi Yūko', 'url/momiji.png', 1),
(8, 'ayane', '1999-08-05', 157, 'B93/W54/H84', 'AB', 'Yamazaki Wakana', 'url/ayane.png', 1);

-- === CHARACTER RELEASES ===
INSERT INTO `character_releases` (`character_id`, `server_region`, `release_date`) VALUES
(1, 'JP', '2017-11-15'), (1, 'GL', '2019-03-26'), (2, 'JP', '2017-11-15'), (2, 'GL', '2019-03-26'),
(3, 'JP', '2017-11-15'), (3, 'GL', '2019-03-26'), (4, 'JP', '2017-11-15'), (4, 'GL', '2019-03-26'),
(5, 'JP', '2019-05-30'), (5, 'GL', '2020-04-28'), (6, 'JP', '2018-08-30'), (6, 'GL', '2019-08-27'),
(7, 'JP', '2018-03-29'), (7, 'GL', '2019-05-28'), (8, 'JP', '2017-11-15'), (8, 'GL', '2019-03-26');

-- === SKILLS ===
INSERT INTO `skills` (`id`, `unique_key`, `skill_category`, `effect_type`, `effect_target`, `effect_value_percent`) VALUES
(1, 'active_fever_burst_pow', 'ACTIVE', 'FEVER_GAUGE_UP', 'SELF', 30.00),
(2, 'passive_killer_spike_pow_18', 'PASSIVE', 'POW_UP', 'SELF', 18.00),
(3, 'passive_opponent_tec_down_12', 'PASSIVE', 'TEC_DOWN', 'OPPONENT_1', 12.00),
(4, 'potential_receive_boost_12', 'POTENTIAL', 'RECEIVE_BOOST', 'SELF', 12.00),
(5, 'potential_stamina_from_attack_5', 'POTENTIAL', 'STAMINA_RECOVERY_ON_ATTACK', 'SELF', 5.00),
(6, 'active_tec_debuff_burst', 'ACTIVE', 'TEC_DOWN', 'OPPONENT_ALL', 25.00),
(7, 'passive_stm_plus_15', 'PASSIVE', 'STM_UP', 'SELF', 15.00),
(8, 'potential_pow_plus_8', 'POTENTIAL', 'POW_UP', 'SELF', 8.00);

-- === EVENT CAMPAIGNS ===
INSERT INTO `event_campaigns` (`id`, `unique_key`, `start_date`, `end_date`) VALUES
(1, '4.5_anniversary_gl', '2023-09-20', '2023-10-18'),
(2, 'summer_splash_2023', '2023-07-15', '2023-08-12'),
(3, 'halloween_spooktacular_2023', '2023-10-20', '2023-11-05');

-- === ITEMS ===
INSERT INTO `items` (`id`, `unique_key`, `item_category`, `item_type`, `rarity`, `effect_value_1`, `source_description_key`) VALUES
-- Currencies
(1, 'vip_coin', 'CURRENCY', 'VIP_COIN', 'LEGENDARY', NULL, NULL),
(2, 'event_currency_summer_shell', 'CURRENCY', 'EVENT_CURRENCY', 'RARE', NULL, 'item_source_summer_2023_event'),
(3, 'event_currency_anniv_medal_4.5', 'CURRENCY', 'EVENT_CURRENCY', 'SSR', NULL, 'item_source_4.5_anniv_event'),
(4, 'event_currency_halloween_pumpkin', 'CURRENCY', 'EVENT_CURRENCY', 'RARE', NULL, 'item_source_halloween_2023_event'),
-- Upgrade Materials
(10, 'swimsuit_lvup_pow_m', 'UPGRADE_MATERIAL', 'SWIMSUIT_LVUP_POW', 'UNCOMMON', 1000, NULL),
(11, 'swimsuit_lvup_tec_l', 'UPGRADE_MATERIAL', 'SWIMSUIT_LVUP_TEC', 'RARE', 5000, NULL),
(12, 'swimsuit_lvup_rainbow_xl', 'UPGRADE_MATERIAL', 'SWIMSUIT_LVUP_RAINBOW', 'SSR', 20000, NULL),
(20, 'swimsuit_awaken_gem_pow', 'UPGRADE_MATERIAL', 'SWIMSUIT_AWAKEN_GEM_POW', 'RARE', NULL, NULL),
(21, 'swimsuit_awaken_gem_tec', 'UPGRADE_MATERIAL', 'SWIMSUIT_AWAKEN_GEM_TEC', 'RARE', NULL, NULL),
(22, 'swimsuit_awaken_gem_rainbow_xl', 'UPGRADE_MATERIAL', 'SWIMSUIT_AWAKEN_GEM_RAINBOW', 'SSR', NULL, 'item_source_vip_shop_or_event'),
-- Consumables
(30, 'fp_recovery_100', 'CONSUMABLE', 'FP_RECOVERY', 'RARE', 100, NULL),
(31, 'gacha_ticket_ssr_guaranteed', 'CONSUMABLE', 'GACHA_TICKET_SSR_GUARANTEED', 'SSR', NULL, 'item_source_paid_shop'),
(32, 'gacha_ticket_nostalgia_vol20', 'CONSUMABLE', 'GACHA_TICKET_NOSTALGIA', 'SSR', NULL, NULL),
-- Gifts
(40, 'closeness_gift_gold', 'GIFT', 'CLOSENESS_GIFT_GENERIC', 'RARE', 500, NULL),
(41, 'honoka_favorite_lemon_squash', 'GIFT', 'CLOSENESS_GIFT_CHARACTER_SPECIFIC', 'RARE', 1500, NULL),
(42, 'luna_favorite_chestnut', 'GIFT', 'CLOSENESS_GIFT_CHARACTER_SPECIFIC', 'RARE', 1500, NULL),
(43, 'kasumi_favorite_strawberry_millefeuille', 'GIFT', 'CLOSENESS_GIFT_CHARACTER_SPECIFIC', 'RARE', 1500, NULL),
-- Special
(50, 'venus_crystal', 'SPECIAL', 'CHARACTER_UNLOCK', 'LEGENDARY', NULL, 'item_source_venus_shop');

-- === BROMIDES ===
INSERT INTO `bromides` (`id`, `unique_key`, `bromide_type`, `rarity`, `skill_id`, `pow_bonus`, `tec_bonus`) VALUES
(1, 'ssr_bromide_anniv_4.5_pow', 'DECO', 'SSR', 2, 350, 150),
(2, 'sr_bromide_summer_tec', 'DECO', 'SR', NULL, 100, 200);

-- === SWIMSUITS ===
INSERT INTO `swimsuits` (`id`, `character_id`, `unique_key`, `rarity`, `suit_type`, `pow_awakened`, `tec_awakened`, `stm_awakened`, `has_malfunction`) VALUES
-- Anniv Suits
(101, 7, 'ssr_momiji_graceful_anniv_4.5', 'SSR', 'TEC', 3900, 5400, 3850, 1),
(102, 4, 'ssr_plus_kasumi_true_color_sakura_4.5', 'SSR+', 'POW', 6800, 4500, 4400, 0),
-- Summer Suits
(103, 1, 'ssr_misaki_sunny_cocktail', 'SSR', 'POW', 5350, 3700, 3950, 1),
-- Halloween Suits
(104, 6, 'ssr_luna_little_devil', 'SSR', 'TEC', 3800, 5500, 3800, 1),
-- Birthday Suit
(105, 8, 'ssr_ayane_bday_2023', 'SSR', 'POW', 5600, 3900, 3900, 0),
-- Nostalgia Suit
(106, 3, 'ssr_marie_rose_angel_bouqet', 'SSR', 'STM', 4000, 4100, 4900, 1),
-- Filler Suits
(201, 1, 'sr_misaki_pure_white', 'SR', 'STM', 1800, 1700, 2300, 0),
(202, 5, 'sr_fiona_blue_lagoon', 'SR', 'TEC', 1650, 2250, 1750, 0),
(301, 2, 'r_honoka_clover', 'R', 'POW', 800, 600, 700, 0);

-- ============================================================================
-- 2. DỮ LIỆU NỘI DUNG GAME
-- ============================================================================

-- === EVENTS ===
INSERT INTO `events` (`id`, `unique_key`, `campaign_id`, `type`, `start_date`, `end_date`, `event_currency_item_id`, `required_suit_type`, `main_reward_bromide_id`) VALUES
(1, 'event_anniv_4.5_ranking_fes', 1, 'FESTIVAL_RANKING', '2023-09-20 04:00:00', '2023-09-28 18:59:59', 3, 'TEC', 1),
(2, 'event_summer_splash_cumulative', 2, 'FESTIVAL_CUMULATIVE', '2023-07-15 04:00:00', '2023-07-25 18:59:59', 2, NULL, 2),
(3, 'event_halloween_butt_battle', 3, 'BUTT_BATTLE', '2023-10-20 04:00:00', '2023-10-29 18:59:59', 4, NULL, NULL);

-- === GACHAS ===
INSERT INTO `gachas` (`id`, `unique_key`, `campaign_id`, `gacha_class`, `gacha_subtype`, `payment_type`, `start_date`, `end_date`) VALUES
(1, 'gacha_trendy_anniv_momiji_4.5', 1, 'SWIMSUIT', 'TRENDY', 'VSTONE', '2023-09-20 04:00:00', '2023-09-28 18:59:59'),
(2, 'gacha_true_color_kasumi_4.5', 1, 'SWIMSUIT', 'TRUE_COLOR', 'PAID_VSTONE_ONLY', '2023-09-20 04:00:00', '2023-09-28 18:59:59'),
(3, 'gacha_trendy_summer_misaki', 2, 'SWIMSUIT', 'TRENDY', 'VSTONE', '2023-07-15 04:00:00', '2023-07-25 18:59:59'),
(4, 'gacha_trendy_halloween_luna', 3, 'SWIMSUIT', 'TRENDY', 'VSTONE', '2023-10-20 04:00:00', '2023-10-29 18:59:59'),
(5, 'gacha_birthday_ayane_2023', NULL, 'SWIMSUIT', 'BIRTHDAY', 'VSTONE', '2023-08-01 04:00:00', '2023-08-08 18:59:59'),
(6, 'gacha_nostalgia_vol_20', NULL, 'SWIMSUIT', 'NOSTALGIC', 'TICKET', '2023-09-01 04:00:00', '2023-09-10 18:59:59'),
(7, 'gacha_anniv_support_items', 1, 'ITEM', 'ANNIVERSARY', 'VSTONE', '2023-09-20 04:00:00', '2023-10-18 18:59:59');

-- ============================================================================
-- 3. DỮ LIỆU CÁC BẢNG LIÊN KẾT
-- ============================================================================

-- === SWIMSUIT SKILLS ===
INSERT INTO `swimsuit_skills` (`swimsuit_id`, `skill_id`, `skill_slot`, `unlock_level`) VALUES
(101, 6, 'ACTIVE', 1), (101, 3, 'PASSIVE_1', 1), (101, 4, 'POTENTIAL_1', 1),
(102, 1, 'ACTIVE', 1), (102, 2, 'PASSIVE_1', 1), (102, 8, 'POTENTIAL_1', 1), (102, 8, 'POTENTIAL_2', 2),
(103, 1, 'ACTIVE', 1), (103, 2, 'PASSIVE_1', 1), (103, 5, 'POTENTIAL_1', 1),
(104, 6, 'ACTIVE', 1), (104, 3, 'PASSIVE_1', 1), (104, 4, 'POTENTIAL_1', 1);

-- === SWIMSUIT AWAKENING COSTS ===
INSERT INTO `swimsuit_awakening_costs` (`swimsuit_id`, `item_id`, `awakening_level`, `quantity`) VALUES
(101, 21, 1, 10), (101, 21, 2, 20), (101, 21, 3, 30), (101, 21, 4, 40), (101, 22, 4, 1),
(102, 20, 1, 10), (102, 20, 2, 20), (102, 20, 3, 30), (102, 20, 4, 40), (102, 22, 4, 5);

-- === CHARACTER GIFT PREFERENCES ===
INSERT INTO `character_gift_preferences` (`character_id`, `item_id`, `preference_level`, `exp_bonus`) VALUES
(2, 41, 'LOVE', 1500), (4, 43, 'LOVE', 1500), (6, 42, 'LOVE', 1500),
(1, 40, 'LIKE', 500), (2, 40, 'LIKE', 500), (3, 40, 'LIKE', 500);

-- === EVENT TRENDY SWIMSUITS ===
INSERT INTO `event_trendy_swimsuits` (`event_id`, `swimsuit_id`, `bonus_type`) VALUES
(1, 101, 'LARGE'), (1, 102, 'LARGE'), (2, 103, 'LARGE'), (3, 104, 'LARGE');

-- === GACHA POOLS (PHẦN QUAN TRỌNG NHẤT) ===
-- Pool Gacha Trendy Anniversary (Momiji)
INSERT INTO `gacha_pools` (`gacha_id`, `pool_item_type`, `swimsuit_id`, `bromide_id`, `item_id`, `drop_rate`, `is_featured`) VALUES
(1, 'SWIMSUIT', 101, NULL, NULL, 0.0039, 1),
(1, 'SWIMSUIT', 102, NULL, NULL, 0.0039, 1),
(1, 'SWIMSUIT', 301, NULL, NULL, 0.0500, 0);
-- Pool Gacha Birthday Ayane
INSERT INTO `gacha_pools` (`gacha_id`, `pool_item_type`, `swimsuit_id`, `bromide_id`, `item_id`, `drop_rate`, `is_featured`) VALUES
(5, 'SWIMSUIT', 105, NULL, NULL, 0.0110, 1);
-- Pool Gacha Nostalgia
INSERT INTO `gacha_pools` (`gacha_id`, `pool_item_type`, `swimsuit_id`, `bromide_id`, `item_id`, `drop_rate`, `is_featured`) VALUES
(6, 'SWIMSUIT', 106, NULL, NULL, 0.0110, 1);
-- Pool Gacha Hỗ trợ Kỷ niệm (Vừa có item, vừa có swimsuit)
INSERT INTO `gacha_pools` (`gacha_id`, `pool_item_type`, `swimsuit_id`, `bromide_id`, `item_id`, `drop_rate`, `is_featured`) VALUES
(7, 'ITEM', NULL, NULL, 12, 0.0200, 1),      -- Sách Rainbow XL
(7, 'ITEM', NULL, NULL, 22, 0.0100, 1),      -- Đá thức tỉnh Rainbow XL
(7, 'ITEM', NULL, NULL, 30, 0.1000, 0),      -- Bình FP
(7, 'SWIMSUIT', 201, NULL, NULL, 0.0500, 0), -- SR Misaki
(7, 'SWIMSUIT', 202, NULL, NULL, 0.0500, 0); -- SR Fiona


-- ============================================================================
-- 5. SỬ DỤNG STORED PROCEDURE ĐỂ THÊM BẢN DỊCH
-- ============================================================================

-- CHARACTERS
CALL add_translation('characters', 1, 'name', 'Misaki', 'みさき', '美咲', '美咲', '미사키');
CALL add_translation('characters', 2, 'name', 'Honoka', 'ほのか', '穗香', '穗香', '호노카');
CALL add_translation('characters', 6, 'name', 'Luna', 'ルナ', '露娜', '露娜', '루나');
CALL add_translation('characters', 7, 'name', 'Momiji', '紅葉', '红叶', '紅葉', '모미지');

-- SWIMSUITS
CALL add_translation('swimsuits', 101, 'name', 'Graceful Dancer (Anniv 4.5)', '優美な舞(4.5周年)', '优雅舞者(4.5周年)', '優雅舞者(4.5周年)', '우아한 댄서 (4.5주년)');
CALL add_translation('swimsuits', 103, 'name', 'Sunny Cocktail', 'サニーカクテル', '阳光鸡尾酒', '陽光雞尾酒', '써니 칵테일');
CALL add_translation('swimsuits', 104, 'name', 'Little Devil', 'こあくま', '小恶魔', '小惡魔', '작은 악마');

-- CAMPAIGNS AND EVENTS
CALL add_translation('event_campaigns', 1, 'name', '4.5th Anniversary Campaign', '4.5周年記念キャンペーン', '4.5周年纪念活动', '4.5週年紀念活動', '4.5주년 기념 캠페인');
CALL add_translation('events', 1, 'name', '4.5th Anniv. Ranking Festival', '4.5周年記念ランキングフェス', '4.5周年纪念排行赛', '4.5週年紀念排行賽', '4.5주년 기념 랭킹 페스티벌');

-- ITEMS
CALL add_translation('items', 3, 'name', '4.5th Anniv. Medal', '4.5周年記念メダル', '4.5周年纪念奖牌', '4.5週年紀念獎牌', '4.5주년 기념 메달');
CALL add_translation('items', 22, 'name', 'Rainbow Awakening Gem (XL)', '虹の覚醒石(XL)', '虹之觉醒石(XL)', '虹之覺醒石(XL)', '무지개 각성석(XL)');
CALL add_translation('items', 22, 'source_description', 'Obtainable from VIP Shop or high-tier event rewards.', 'VIPショップまたは高ランクのイベント報酬で入手可能。', '可从VIP商店或高级活动奖励中获得。', '可從VIP商店或高級活動獎勵中獲得。', 'VIP 상점 또는 상위 이벤트 보상으로 획득 가능.');