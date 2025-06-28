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
 '2000-04-02', 177, 'B99/W60/H92', 'O', 'Shino Shimoji', '/images/chars/shandy.png', 1, '4.12.0'),
(6, 'ayane', 'あやね', 'Ayane', '绫音', '綾音', '아야네', 
 '2000-08-27', 157, 'B95/W54/H85', 'A', 'Wakana Yamazaki', '/images/chars/ayane.png', 1, '1.2.0'),
(7, 'helena', 'ヘレナ', 'Helena', '海伦娜', '海倫娜', '헬레나', 
 '2000-01-30', 170, 'B90/W59/H89', 'AB', 'Yuka Komatsu', '/images/chars/helena.png', 1, '1.3.0'),
(8, 'kokoro', 'こころ', 'Kokoro', '心', '心', '코코로', 
 '2000-04-27', 157, 'B88/W57/H86', 'O', 'Yuka Iguchi', '/images/chars/kokoro.png', 1, '1.4.0'),
(9, 'hitomi', 'ひとみ', 'Hitomi', '瞳', '瞳', '히토미', 
 '2000-05-25', 160, 'B90/W58/H85', 'A', 'Kotono Mitsuishi', '/images/chars/hitomi.png', 1, '1.5.0'),
(10, 'leifang', 'リー・ファン', 'Lei Fang', '李芳', '李芳', '리판', 
 '2000-04-18', 162, 'B83/W53/H82', 'B', 'Yui Horie', '/images/chars/leifang.png', 1, '1.6.0');

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
 'Increases TEC by 25% if suit has Malfunction.', 'POTENTIAL', 'TEC_UP_MALFUNCTION', '3.15.0'),
(8, 'critical-hit', 'クリティカルヒット', 'Critical Hit', '致命一击', '致命一擊', '크리티컬 히트', 
 'High chance to deal critical damage when attacking.', 'PASSIVE', 'CRITICAL_CHANCE', '2.0.0'),
(9, 'defense-boost', 'ディフェンスブースト', 'Defense Boost', '防御增强', '防禦增強', '디펜스 부스트', 
 'Reduces incoming damage by 15%.', 'PASSIVE', 'DEFENSE_UP', '1.8.0'),
(10, 'energy-save', 'エナジーセーブ', 'Energy Save', '能量节约', '能量節約', '에너지 세이브', 
 'Reduces stamina consumption by 20%.', 'POTENTIAL', 'STM_SAVE', '2.5.0'),
(11, 'fever-skill-stm-1', 'STMフィーバースキル', 'STM Fever Skill', 'STM狂热技能', 'STM狂熱技能', 'STM 피버 스킬', 
 'When defending, high chance to trigger a Block. Increases STM by 40%.', 'ACTIVE', 'STM_FEVER', '1.8.0'),
(12, 'fever-skill-apl-1', 'APLフィーバースキル', 'APL Fever Skill', 'APL狂热技能', 'APL狂熱技能', 'APL 피버 스킬', 
 'When serving, high chance to trigger a Nice Serve. Increases APL by 40%.', 'ACTIVE', 'APL_FEVER', '2.0.0'),
(13, 'pow-boost-xl', 'パワーアップXL', 'Power Boost (XL)', '力量提升(特大)', '力量提升(特大)', '파워 업(XL)', 
 'Increases POW by 20%.', 'POTENTIAL', 'POW_UP', '3.0.0'),
(14, 'apl-boost-l', 'アピールアップL', 'Appeal Boost (L)', '魅力提升(大)', '魅力提升(大)', '어필 업(L)', 
 'Increases APL by 15%.', 'POTENTIAL', 'APL_UP', '2.5.0'),
(15, 'malfunction-master', 'マルファンクションマスター', 'Malfunction Master', '故障大师', '故障大師', '말펑션 마스터', 
 'Increases all stats by 30% when suit has Malfunction.', 'POTENTIAL', 'ALL_STATS_UP_MALFUNCTION', '4.0.0');

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
 'Used to awaken an SSR swimsuit to its maximum level.', 'VIP Shop, High-tier event rewards', 'UPGRADE_MATERIAL', 'SSR', '/images/items/ssr-awaken-stone.png', '2.0.0'),
(9, 'stm-crystal-sr', 'STM強化結晶(SR)', 'STM Upgrade Crystal (SR)', 'STM强化结晶(SR)', 'STM強化結晶(SR)', 'STM 강화 결정(SR)', 
 'Used to upgrade STM-type swimsuits.', 'Event shops, Daily matches', 'UPGRADE_MATERIAL', 'SR', '/images/items/stm-crystal-sr.png', '1.5.0'),
(10, 'apl-crystal-ssr', 'APL強化結晶(SSR)', 'APL Upgrade Crystal (SSR)', 'APL强化结晶(SSR)', 'APL強化結晶(SSR)', 'APL 강화 결정(SSR)', 
 'Used to upgrade APL-type swimsuits.', 'VIP Shop, High-tier events', 'UPGRADE_MATERIAL', 'SSR', '/images/items/apl-crystal-ssr.png', '3.0.0'),
(11, 'chocolate-cake', 'チョコレートケーキ', 'Chocolate Cake', '巧克力蛋糕', '巧克力蛋糕', '초콜릿 케이크', 
 'A sweet gift that most characters enjoy.', 'Shop, Events', 'GIFT', 'R', '/images/items/chocolate-cake.png', '1.0.0'),
(12, 'diamond-necklace', 'ダイヤモンドネックレス', 'Diamond Necklace', '钻石项链', '鑽石項鍊', '다이아몬드 목걸이', 
 'A luxurious accessory that increases Appeal stats.', 'VIP Shop, Special Events', 'ACCESSORY', 'SSR', '/images/items/diamond-necklace.png', '2.8.0'),
(13, 'owner-points', 'オーナーポイント', 'Owner Points', '老板积分', '老闆積分', '오너 포인트', 
 'Points earned from various activities that can be spent in the Owner Shop.', 'Daily activities, events', 'CURRENCY', 'R', '/images/items/owner-points.png', '1.0.0'),
(14, 'trendy-voucher', 'トレンド券', 'Trendy Voucher', '潮流券', '潮流券', '트렌드 바우처', 
 'Special tickets used for Trendy gacha pulls.', 'Festival events, special promotions', 'CURRENCY', 'SR', '/images/items/trendy-voucher.png', '2.0.0'),
(15, 'birthday-gift-box', 'バースデーギフトボックス', 'Birthday Gift Box', '生日礼品盒', '生日禮品盒', '생일 선물 상자', 
 'A special gift box containing random birthday-themed items.', 'Birthday events', 'CONSUMABLE', 'SSR', '/images/items/birthday-gift.png', '1.5.0');

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
 'DECO', 'SR', 4, '/images/bromides/deco-sr-stm-1.png', '1.10.0'),
(3, 'deco-ssr-tec-feint-1', 'TECフェイントデコブロマイド', 'SSR TEC Feint Bromide', 'SSR技巧佯攻写真', 'SSR技巧佯攻寫真', 'SSR 테크닉 페인트 브로마이드', 
 'DECO', 'SSR', 2, '/images/bromides/deco-ssr-tec-1.png', '2.8.0'),
(4, 'owner-sr-marie-01', 'マリーオーナーブロマイド01', 'Marie Owner Bromide 01', '玛莉老板写真01', '瑪莉老闆寫真01', '마리 오너 브로마이드 01', 
 'OWNER', 'SR', NULL, '/images/bromides/owner-marie-01.png', '1.0.0'),
(5, 'owner-ssr-honoka-01', 'ほのかオーナーブロマイド01', 'Honoka Owner Bromide 01', '穗香老板写真01', '穗香老闆寫真01', '호노카 오너 브로마이드 01', 
 'OWNER', 'SSR', NULL, '/images/bromides/owner-honoka-01.png', '1.2.0'),
(6, 'deco-r-defense-1', 'ディフェンスデコブロマイド', 'R Defense Bromide', 'R防御写真', 'R防禦寫真', 'R 디펜스 브로마이드', 
 'DECO', 'R', 9, '/images/bromides/deco-r-defense-1.png', '1.8.0'),
(7, 'owner-ssr-kasumi-01', 'かすみオーナーブロマイド01', 'Kasumi Owner Bromide 01', '霞老板写真01', '霞老闆寫真01', '카스미 오너 브로마이드 01', 
 'OWNER', 'SSR', NULL, '/images/bromides/owner-kasumi-01.png', '1.8.0'),
(8, 'deco-ssr-apl-charm-1', 'APLチャームデコブロマイド', 'SSR APL Charm Bromide', 'SSR魅力写真', 'SSR魅力寫真', 'SSR 어필 참 브로마이드', 
 'DECO', 'SSR', 12, '/images/bromides/deco-ssr-apl-1.png', '3.0.0'),
(9, 'owner-sr-misaki-01', 'みさきオーナーブロマイド01', 'Misaki Owner Bromide 01', '海咲老板写真01', '海咲老闆寫真01', '미사키 오너 브로마이드 01', 
 'OWNER', 'SR', NULL, '/images/bromides/owner-misaki-01.png', '1.0.0'),
(10, 'deco-ssr-critical-1', 'クリティカルデコブロマイド', 'SSR Critical Bromide', 'SSR暴击写真', 'SSR暴擊寫真', 'SSR 크리티컬 브로마이드', 
 'DECO', 'SSR', 8, '/images/bromides/deco-ssr-critical-1.png', '2.0.0');

-- ============================================================================
-- 5. SWIMSUITS (Depends on characters)
-- ============================================================================
INSERT INTO `swimsuits` (
  `id`, `character_id`, `unique_key`, `name_jp`, `name_en`, `name_cn`, `name_tw`, `name_kr`, 
  `rarity`, `suit_type`, `total_stats_awakened`, `has_malfunction`, `is_limited`, 
  `release_date_gl`, `game_version`
) VALUES
-- Marie Rose swimsuits
(1, 1, 'ssr-marie-stellar-aquarius', 'ステラ・アクエリアス', 'Stellar Aquarius', '星光水瓶', '星光水瓶', '스텔라 아쿠아리우스', 
 'SSR', 'TEC', 5600, 1, 1, '2023-01-15', '4.5.0'),
(2, 1, 'sr-marie-blue-lagoon', 'ブルーラグーン', 'Blue Lagoon', '蓝色礁湖', '藍色礁湖', '블루 라군', 
 'SR', 'POW', 3800, 0, 0, '2021-05-10', '1.1.0'),
(3, 1, 'r-marie-basic-white', 'ベーシックホワイト', 'Basic White', '基础白色', '基礎白色', '베이직 화이트', 
 'R', 'N/A', 2800, 0, 0, '2020-04-01', '1.0.0'),
-- Honoka swimsuits  
(4, 2, 'ssr-honoka-bouquet-plumeria', 'ブーケ・プルメリア', 'Bouquet Plumeria', '花束鸡蛋花', '花束雞蛋花', '부케 플루메리아', 
 'SSR+', 'TEC', 6200, 1, 1, '2022-03-24', '3.20.0'),
(5, 2, 'sr-honoka-tropical-dream', 'トロピカルドリーム', 'Tropical Dream', '热带梦境', '熱帶夢境', '트로피컬 드림', 
 'SR', 'APL', 4000, 0, 0, '2021-07-20', '1.7.0'),
-- Kasumi swimsuits
(6, 3, 'ssr-kasumi-tattered-ninja', 'かすみの忍び装束・破', 'Kasumi''s Tattered Ninja Garb', '霞的破损忍装', '霞的破損忍裝', '카스미의 낡은 닌자복', 
 'SSR', 'POW', 5450, 0, 0, '2021-08-01', '1.8.0'),
(7, 3, 'sr-kasumi-crimson-moon', 'クリムゾンムーン', 'Crimson Moon', '深红月亮', '深紅月亮', '크림슨 문', 
 'SR', 'APL', 4100, 1, 1, '2022-10-31', '3.5.0'),
-- Misaki swimsuits
(8, 4, 'sr-misaki-summer-breeze', 'サマーブリーズ', 'Summer Breeze', '夏日微风', '夏日微風', '여름 바람', 
 'SR', 'STM', 3900, 0, 0, '2021-06-15', '1.5.0'),
(9, 4, 'ssr-misaki-ocean-goddess', 'オーシャンゴッデス', 'Ocean Goddess', '海洋女神', '海洋女神', '오션 고데스', 
 'SSR', 'STM', 5800, 1, 1, '2023-05-10', '4.8.0'),
-- Shandy swimsuits
(10, 5, 'ssr-shandy-solar-flare', 'ソーラーフレア', 'Solar Flare', '太阳耀斑', '太陽耀斑', '솔라 플레어', 
 'SSR', 'POW', 5980, 1, 1, '2023-08-10', '4.12.0'),
-- More characters swimsuits
(11, 6, 'ssr-ayane-midnight-shadow', 'ミッドナイトシャドウ', 'Midnight Shadow', '午夜阴影', '午夜陰影', '미드나이트 섀도우', 
 'SSR', 'TEC', 5700, 1, 1, '2023-02-14', '4.6.0'),
(12, 7, 'sr-helena-elegant-rose', 'エレガントローズ', 'Elegant Rose', '优雅玫瑰', '優雅玫瑰', '엘레간트 로즈', 
 'SR', 'APL', 4200, 0, 0, '2022-06-01', '3.2.0'),
(13, 8, 'ssr-kokoro-cherry-blossom', 'チェリーブロッサム', 'Cherry Blossom', '樱花', '櫻花', '체리 블라썸', 
 'SSR', 'APL', 5900, 1, 1, '2023-04-01', '4.7.0'),
(14, 9, 'sr-hitomi-azure-wave', 'アジュールウェーブ', 'Azure Wave', '天蓝波浪', '天藍波浪', '애저 웨이브', 
 'SR', 'STM', 4050, 0, 0, '2022-08-15', '3.3.0'),
(15, 10, 'ssr-leifang-jade-dragon', 'ジェイドドラゴン', 'Jade Dragon', '翡翠龙', '翡翠龍', '제이드 드래곤', 
 'SSR', 'POW', 5750, 1, 1, '2023-09-01', '4.13.0');

-- ============================================================================
-- 6. EPISODES (Depends on characters, swimsuits, events)
-- ============================================================================
INSERT INTO `episodes` (
  `id`, `unique_key`, `title_jp`, `title_en`, `title_cn`, `title_tw`, `title_kr`, 
  `unlock_condition_en`, `episode_type`, `related_entity_type`, `related_entity_id`, `game_version`
) VALUES
(1, 'ep-main-prologue', 'プロローグ～ヴィーナス島へ～', 'Prologue ~ To Venus Island ~', '序幕～前往维纳斯岛～', '序幕～前往維納斯島～', '프롤로그 ~비너스 섬으로~', 
 'Start the game for the first time.', 'MAIN', NULL, NULL, '1.0.0'),
(2, 'ep-main-chapter-1', 'チャプター1～新しい生活～', 'Chapter 1 ~ New Life ~', '第一章～新生活～', '第一章～新生活～', '챕터1 ~새로운 생활~', 
 'Complete the Prologue.', 'MAIN', NULL, NULL, '1.0.0'),
(3, 'ep-char-marie-01', 'マリーのひみつ', 'Marie''s Secret', '玛莉的秘密', '瑪莉的秘密', '마리의 비밀', 
 'Reach Character Level 10 with Marie Rose.', 'CHARACTER', 'characters', 1, '1.0.0'),
(4, 'ep-char-honoka-01', 'ほのかの料理教室', 'Honoka''s Cooking Class', '穗香的烹饪教室', '穗香的烹飪教室', '호노카의 요리 교실', 
 'Reach Character Level 15 with Honoka.', 'CHARACTER', 'characters', 2, '1.2.0'),
(5, 'ep-char-kasumi-01', '忍者の修行', 'Ninja Training', '忍者修行', '忍者修行', '닌자 수련', 
 'Reach Character Level 20 with Kasumi.', 'CHARACTER', 'characters', 3, '1.8.0'),
(6, 'ep-swimsuit-stellar-aquarius', '星に願いを', 'Wish Upon a Star', '向星星许愿', '向星星許願', '별에게 소원을', 
 'Obtain the "Stellar Aquarius" swimsuit for Marie Rose.', 'SWIMSUIT', 'swimsuits', 1, '4.5.0'),
(7, 'ep-swimsuit-bouquet-plumeria', '花の記憶', 'Memories of Flowers', '花的回忆', '花的回憶', '꽃의 기억', 
 'Obtain the "Bouquet Plumeria" swimsuit for Honoka.', 'SWIMSUIT', 'swimsuits', 4, '3.20.0'),
(8, 'ep-event-starlight-ocean', '星降る夜の物語', 'Tale of the Starlit Night', '星降之夜的故事', '星降之夜的故事', '별 내리는 밤의 이야기', 
 'Participate in the Starlight Ocean Festival.', 'EVENT', 'events', 1, '4.5.0');

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
 'ROCK_CLIMBING', '4.12.0', '2023-08-10 04:00:00', '2023-08-18 03:59:59'),
(4, 'butt-battle-summer-showdown', 'バットバトル～夏の決戦～', 'Butt Battle - Summer Showdown', '臀部大战～夏季决战～', '臀部大戰～夏季決戰～', '엉덩이 배틀 ~여름 결전~', 
 'BUTT_BATTLE', '3.8.0', '2022-07-01 04:00:00', '2022-07-15 03:59:59'),
(5, 'marie-birthday-2023', 'マリーバースデー2023', 'Marie Rose Birthday 2023', '玛莉生日2023', '瑪莉生日2023', '마리 로즈 생일 2023', 
 'LOGIN_BONUS', '4.3.0', '2023-06-06 04:00:00', '2023-06-13 03:59:59'),
(6, 'tower-climb-autumn', 'タワークライム～秋の挑戦～', 'Tower Climb - Autumn Challenge', '塔楼攀爬～秋季挑战～', '塔樓攀爬～秋季挑戰～', '타워 클라임 ~가을 도전~', 
 'TOWER', '2.15.0', '2021-09-20 04:00:00', '2021-10-05 03:59:59'),
(7, 'valentine-chocolate-festival', 'バレンタインチョコフェス', 'Valentine Chocolate Festival', '情人节巧克力节', '情人節巧克力節', '발렌타인 초콜릿 페스티벌', 
 'FESTIVAL_CUMULATIVE', '4.6.0', '2023-02-14 04:00:00', '2023-02-21 03:59:59'),
(8, 'summer-beach-volleyball', 'サマービーチバレーボール', 'Summer Beach Volleyball', '夏季沙滩排球', '夏季沙灘排球', '서머 비치 발리볼', 
 'FESTIVAL_RANKING', '4.9.0', '2023-07-01 04:00:00', '2023-07-15 03:59:59');

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
 'NOSTALGIC', '2.8.0', '2022-09-01 04:00:00', '2022-09-08 03:59:59'),
(4, 'gacha-anniversary-premium', 'アニバーサリープレミアムガチャ', 'Anniversary Premium Gacha', '周年高级扭蛋', '週年高級扭蛋', '기념일 프리미엄 뽑기', 
 'ANNIVERSARY', '3.0.0', '2022-04-01 04:00:00', '2022-04-15 03:59:59'),
(5, 'gacha-paid-special-selection', '特選有償ガチャ', 'Special Selection Paid Gacha', '特选付费扭蛋', '特選付費扭蛋', '특선 유료 뽑기', 
 'PAID', '4.8.0', '2023-05-01 04:00:00', '2023-05-31 03:59:59'),
(6, 'gacha-valentine-love-collection', 'バレンタインラブコレクション', 'Valentine Love Collection', '情人节爱情收藏', '情人節愛情收藏', '발렌타인 러브 콜렉션', 
 'TRENDY', '4.6.0', '2023-02-14 04:00:00', '2023-02-21 03:59:59');

-- ============================================================================
-- 9. DOCUMENTS (Content Management)
-- ============================================================================
INSERT INTO `documents` (
  `unique_key`, `title_en`, `summary_en`, `content_json_en`, 
  `created_at`, `updated_at`
) VALUES
('beginners-guide-to-festivals', 'Beginner''s Guide to Festivals', 
 'Learn the basics of how to participate and win in ranking and cumulative festivals.', 
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Welcome to the festival guide! First, make sure you have a Trend swimsuit to get the best score."}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Festival Types"}]},{"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Ranking Festivals: Compete against other players for the top score."}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Cumulative Festivals: Work towards milestone rewards by accumulating points."}]}]}]}]}', 
 NOW(), NOW()),
('character-optimization-guide', 'Character Optimization Guide',
 'Advanced strategies for maximizing your character''s potential in matches.',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"This guide covers advanced techniques for character optimization and skill synergy."}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Stat Priority"}]},{"type":"paragraph","content":[{"type":"text","text":"Focus on the stat that matches your swimsuit type for maximum effectiveness."}]}]}',
 NOW(), NOW()),
('gacha-rate-analysis', 'Gacha Rates and Optimization',
 'Understanding gacha mechanics and how to maximize your pull efficiency.',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"This guide explains gacha rates and strategies for efficient pulls."}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Rate Up Banners"}]},{"type":"paragraph","content":[{"type":"text","text":"Always pull on rate-up banners for the best chance at featured items."}]}]}',
 NOW(), NOW()),
('swimsuit-tier-list', 'Swimsuit Tier List and Meta Analysis',
 'Comprehensive ranking of swimsuits based on performance and versatility.',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"This tier list ranks swimsuits based on their effectiveness in various game modes."}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"S-Tier Swimsuits"}]},{"type":"paragraph","content":[{"type":"text","text":"These swimsuits offer the best combination of stats and abilities."}]}]}',
 NOW(), NOW()),
('festival-strategy-advanced', 'Advanced Festival Strategy',
 'Pro tips and advanced strategies for dominating festival events.',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Master-level strategies for festival events and ranking competitions."}]}]}',
 NOW(), NOW());

-- ============================================================================
-- 10. UPDATE LOGS (Version Tracking)
-- ============================================================================
INSERT INTO `update_logs` (
  `unique_key`, `version`, `title`, `content`, `description`, `date`, 
  `tags`, `created_at`, `updated_at`
) VALUES
('v4-5-0-starlight-ocean', '4.5.0', 'Starlight Ocean Festival Update', 
 'Major update introducing the Starlight Ocean Festival event with new SSR swimsuits and exclusive rewards.',
 'This update brings the highly anticipated Starlight Ocean Festival, featuring Marie Rose''s new SSR Stellar Aquarius swimsuit and various festival-themed content.',
 '2023-01-15 04:00:00', '["event", "festival", "ssr", "marie-rose"]', NOW(), NOW()),
('v4-12-0-shandy-debut', '4.12.0', 'New Character: Shandy Debut', 
 'Welcome Shandy, the newest character to join Venus Island! Featuring unique Solar Flare swimsuit.',
 'Shandy makes her debut with exclusive content and special introduction campaign.',
 '2023-08-10 04:00:00', '["character", "new", "shandy", "debut"]', NOW(), NOW()),
('v3-20-0-honoka-birthday', '3.20.0', 'Honoka Birthday Special Update',
 'Celebrate Honoka''s birthday with exclusive content, new SSR+ swimsuit, and limited-time events.',
 'Special birthday update featuring Honoka''s premium Bouquet Plumeria swimsuit and birthday-themed activities.',
 '2022-03-24 04:00:00', '["birthday", "honoka", "ssr+", "special"]', NOW(), NOW()),
('v2-15-0-tower-climb', '2.15.0', 'Tower Climb Challenge Mode',
 'New challenging tower climb mode with progressive difficulty and exclusive rewards.',
 'Introduces the tower climbing game mode with unique mechanics and special rewards for skilled players.',
 '2021-09-20 04:00:00', '["tower", "challenge", "new-mode"]', NOW(), NOW()),
('v1-8-0-kasumi-ninja', '1.8.0', 'Kasumi Ninja Collection',
 'Traditional Japanese-themed update featuring Kasumi''s ninja swimsuits and cultural content.',
 'Embrace Japanese tradition with Kasumi''s ninja-themed swimsuits and related cultural events.',
 '2021-08-01 04:00:00', '["kasumi", "ninja", "japanese", "culture"]', NOW(), NOW()),
('v4-6-0-valentine-special', '4.6.0', 'Valentine''s Day Special Update',
 'Love is in the air with Valentine''s themed content, special gacha, and romantic storylines.',
 'Valentine''s Day celebration with themed swimsuits, special events, and romantic character episodes.',
 '2023-02-14 04:00:00', '["valentine", "love", "special", "romance"]', NOW(), NOW());

-- ============================================================================
-- 11. LINKING TABLES
-- ============================================================================

-- Swimsuit Skills (Linking swimsuits to skills)
INSERT INTO `swimsuit_skills` (`swimsuit_id`, `skill_id`, `skill_slot`) VALUES
-- Stellar Aquarius (Marie, TEC SSR)
(1, 2, 'ACTIVE'),      
(1, 5, 'POTENTIAL_1'), 
(1, 7, 'POTENTIAL_2'), 
-- Blue Lagoon (Marie, POW SR)
(2, 1, 'ACTIVE'),      
(2, 4, 'POTENTIAL_1'), 
-- Basic White (Marie, R)
(3, 4, 'POTENTIAL_1'),      
-- Bouquet Plumeria (Honoka, TEC SSR+)
(4, 2, 'ACTIVE'),      
(4, 6, 'PASSIVE_1'),   
(4, 5, 'POTENTIAL_1'), 
(4, 7, 'POTENTIAL_2'), 
-- Tropical Dream (Honoka, APL SR)
(5, 12, 'ACTIVE'),     
(5, 14, 'POTENTIAL_1'),
-- Tattered Ninja (Kasumi, POW SSR)
(6, 1, 'ACTIVE'),      
(6, 3, 'PASSIVE_1'),   
(6, 4, 'POTENTIAL_1'), 
-- Crimson Moon (Kasumi, APL SR)
(7, 12, 'ACTIVE'),     
(7, 9, 'PASSIVE_1'),   
-- Summer Breeze (Misaki, STM SR)
(8, 11, 'ACTIVE'),     
(8, 10, 'POTENTIAL_1'), 
-- Ocean Goddess (Misaki, STM SSR)
(9, 11, 'ACTIVE'),     
(9, 4, 'POTENTIAL_1'), 
(9, 10, 'POTENTIAL_2'), 
-- Solar Flare (Shandy, POW SSR)
(10, 1, 'ACTIVE'),     
(10, 3, 'PASSIVE_1'),  
(10, 8, 'POTENTIAL_1'),
-- Midnight Shadow (Ayane, TEC SSR)
(11, 2, 'ACTIVE'),     
(11, 5, 'POTENTIAL_1'),
(11, 8, 'POTENTIAL_2'),
-- Elegant Rose (Helena, APL SR)
(12, 12, 'ACTIVE'),    
(12, 14, 'POTENTIAL_1'),
-- Cherry Blossom (Kokoro, APL SSR)
(13, 12, 'ACTIVE'),    
(13, 15, 'PASSIVE_1'), 
(13, 14, 'POTENTIAL_1'),
-- Azure Wave (Hitomi, STM SR)
(14, 11, 'ACTIVE'),    
(14, 10, 'POTENTIAL_1'),
-- Jade Dragon (Lei Fang, POW SSR)
(15, 1, 'ACTIVE'),     
(15, 13, 'POTENTIAL_1'),
(15, 3, 'POTENTIAL_2');

-- Gacha Pools (Linking gachas to rewards)
INSERT INTO `gacha_pools` (`gacha_id`, `pool_item_type`, `item_id`, `drop_rate`, `is_featured`) VALUES
-- Trendy Gacha (Stellar Aquarius)
(1, 'SWIMSUIT', 1, 0.7800, 1),   
(1, 'SWIMSUIT', 2, 5.0000, 0),   
(1, 'ITEM', 3, 10.0000, 0),      
(1, 'BROMIDE', 2, 2.5000, 0),    
-- Honoka Birthday Gacha
(2, 'SWIMSUIT', 4, 1.1000, 1),   
(2, 'SWIMSUIT', 6, 0.0200, 0),   
(2, 'ITEM', 1, 15.0000, 0),      
(2, 'ITEM', 5, 5.0000, 0),       
-- Nostalgic Ninja Gacha
(3, 'SWIMSUIT', 6, 1.5000, 1),   
(3, 'SWIMSUIT', 7, 3.0000, 0),   
(3, 'ITEM', 11, 8.0000, 0),      
(3, 'BROMIDE', 1, 1.2000, 0),    
-- Anniversary Gacha
(4, 'SWIMSUIT', 1, 0.5000, 1),   
(4, 'SWIMSUIT', 4, 0.5000, 1),   
(4, 'SWIMSUIT', 10, 0.3000, 1),  
(4, 'ITEM', 8, 2.0000, 0),       
-- Paid Special Gacha
(5, 'SWIMSUIT', 10, 2.0000, 1),  
(5, 'ITEM', 12, 3.0000, 0),      
(5, 'ITEM', 8, 5.0000, 0),       
(5, 'BROMIDE', 5, 2.0000, 0),    
-- Valentine Gacha
(6, 'SWIMSUIT', 11, 1.0000, 1),  
(6, 'SWIMSUIT', 13, 0.8000, 1),  
(6, 'ITEM', 15, 3.0000, 0),      
(6, 'BROMIDE', 8, 1.5000, 0);    

-- Shop Listings
INSERT INTO `shop_listings` (`shop_type`, `item_id`, `cost_currency_item_id`, `cost_amount`, `start_date`, `end_date`) VALUES
('EVENT', 8, 7, 500, '2023-01-15 04:00:00', '2023-02-01 03:59:59'), 
('VIP', 8, 1, 5000, NULL, NULL),                                    
('VIP', 12, 1, 8000, NULL, NULL),                                   
('GENERAL', 6, 2, 10000, NULL, NULL),                               
('GENERAL', 11, 2, 5000, NULL, NULL),                               
('GENERAL', 5, 2, 15000, NULL, NULL),                               
('CURRENCY', 3, 2, 25000, NULL, NULL),                              
('CURRENCY', 4, 2, 20000, NULL, NULL),                              
('CURRENCY', 9, 2, 20000, NULL, NULL),                              
('EVENT', 10, 7, 300, '2023-01-15 04:00:00', '2023-02-01 03:59:59'),
('VIP', 14, 1, 3000, NULL, NULL),                                   
('GENERAL', 13, 2, 1000, NULL, NULL),                               
('EVENT', 15, 7, 200, '2023-02-14 04:00:00', '2023-02-21 03:59:59');

-- ============================================================================
-- DATA INSERTION COMPLETE
-- ============================================================================ 