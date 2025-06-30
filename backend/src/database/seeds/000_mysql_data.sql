-- ============================================================================
-- 1. CHARACTERS (Core Entity)
-- ============================================================================


INSERT INTO `characters` (
  `id`, `unique_key`, `name_jp`, `name_en`, `name_cn`, `name_tw`, `name_kr`, 
  `birthday`, `height`, `measurements`, `blood_type`, `voice_actor_jp`, `is_active`, `game_version`
) VALUES
(1, 'marie-rose', 'マリー・ローズ', 'Marie Rose', '玛莉萝丝', '瑪莉蘿絲', '마리 로즈', 
 '2000-06-06', 147, 'B74/W56/H78', 'AB', 'Mai Aizawa', 1, '1.0.0'),
(2, 'honoka', 'ほのか', 'Honoka', '穗香', '穗香', '호노카', 
 '2000-03-24', 150, 'B99/W58/H91', 'AB', 'Ai Nonaka', 1, '1.0.0'),
(3, 'kasumi', 'かすみ', 'Kasumi', '霞', '霞', '카스미', 
 '2000-02-23', 158, 'B89/W54/B85', 'O', 'Houko Kuwashima', 1, '1.1.0'),
(4, 'misaki', 'みさき', 'Misaki', '海咲', '海咲', '미사키', 
 '2000-07-07', 160, 'B85/W55/H86', 'B', 'Minami Tsuda', 1, '1.0.0'),
(5, 'shandy', 'シャンディ', 'Shandy', 'シャンディ', 'シャンディ', '샨디', 
 '2000-04-02', 177, 'B99/W60/H92', 'O', 'Shino Shimoji', 1, '4.12.0'),
(6, 'ayane', 'あやね', 'Ayane', '绫音', '綾音', '아야네', 
 '2000-08-27', 157, 'B95/W54/H85', 'A', 'Wakana Yamazaki', 1, '1.2.0'),
(7, 'helena', 'ヘレナ', 'Helena', '海伦娜', '海倫娜', '헬레나', 
 '2000-01-30', 170, 'B90/W59/H89', 'AB', 'Yuka Komatsu', 1, '1.3.0'),
(8, 'kokoro', 'こころ', 'Kokoro', '心', '心', '코코로', 
 '2000-04-27', 157, 'B88/W57/H86', 'O', 'Yuka Iguchi', 1, '1.4.0'),
(9, 'hitomi', 'ひとみ', 'Hitomi', '瞳', '瞳', '히토미', 
 '2000-05-25', 160, 'B90/W58/H85', 'A', 'Kotono Mitsuishi', 1, '1.5.0'),
(10, 'leifang', 'リー・ファン', 'Lei Fang', '李芳', '李芳', '리판', 
 '2000-04-18', 162, 'B83/W53/H82', 'B', 'Yui Horie', 1, '1.6.0'),
(11, 'tina', 'ティナ', 'Tina', '蒂娜', '蒂娜', '티나', 
 '2000-07-15', 175, 'B98/W61/H93', 'A', 'Eri Kitamura', 1, '2.0.0'),
(12, 'mila', 'ミラ', 'Mila', '米拉', '米拉', '밀라', 
 '2000-01-01', 168, 'B86/W56/H87', 'O', 'Saki Fujita', 1, '2.2.0'),
(13, 'christie', 'クリスティ', 'Christie', '克里斯蒂', '克里斯蒂', '크리스티', 
 '2000-12-18', 172, 'B91/W58/H88', 'AB', 'Kikuko Inoue', 1, '2.5.0'),
(14, 'lisa', 'リサ', 'Lisa', '莉萨', '莉薩', '리사', 
 '2000-03-08', 163, 'B89/W55/H86', 'B', 'Megumi Hayashibara', 1, '2.8.0'),
(15, 'rachel', 'レイチェル', 'Rachel', '瑞秋', '瑞秋', '레이첼', 
 '2000-09-21', 170, 'B95/W59/H91', 'A', 'Houko Kuwashima', 1, '3.0.0'),
(16, 'momiji', 'もみじ', 'Momiji', '红叶', '紅葉', '모미지', 
 '2000-11-29', 158, 'B87/W54/H84', 'AB', 'Kana Hanazawa', 1, '3.2.0'),
(17, 'nyotengu', 'にょうてんぐ', 'Nyotengu', '女天狗', '女天狗', '뇨텐구', 
 '2000-10-10', 165, 'B93/W57/H89', 'O', 'Ai Nonaka', 1, '3.5.0'),
(18, 'phase4', 'フェーズ4', 'Phase-4', '第四阶段', '第四階段', '페이즈4', 
 '2000-02-29', 155, 'B80/W52/H80', 'AB', 'Rie Kugimiya', 1, '3.8.0'),
(19, 'luna', 'ルナ', 'Luna', '露娜', '露娜', '루나', 
 '2000-05-05', 161, 'B85/W54/H83', 'A', 'Nana Mizuki', 1, '4.0.0'),
(20, 'tamaki', 'たまき', 'Tamaki', '环', '環', '타마키', 
 '2000-08-12', 159, 'B88/W56/H85', 'B', 'Yuka Iguchi', 1, '4.2.0');

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
 'Increases all stats by 30% when suit has Malfunction.', 'POTENTIAL', 'ALL_STATS_UP_MALFUNCTION', '4.0.0'),
(16, 'counter-attack-pro', 'カウンターアタックプロ', 'Counter Attack Pro', '反击专家', '反擊專家', '카운터 어택 프로', 
 'When receiving damage, 25% chance to counter with double damage.', 'PASSIVE', 'COUNTER_ATTACK', '4.5.0'),
(17, 'all-round-boost-m', 'オールラウンドアップM', 'All-Round Boost (M)', '全能提升(中)', '全能提升(中)', '올라운드 업(M)', 
 'Increases all base stats by 8%.', 'POTENTIAL', 'ALL_STATS_UP', '3.5.0'),
(18, 'fever-skill-combo', 'コンボフィーバースキル', 'Combo Fever Skill', '连击狂热技能', '連擊狂熱技能', '콤보 피버 스킬', 
 'When performing a combo, increases all stats by 35% for this point.', 'ACTIVE', 'COMBO_FEVER', '4.8.0'),
(19, 'quick-recovery', 'クイックリカバリー', 'Quick Recovery', '快速恢复', '快速恢復', '퀵 리커버리', 
 'Stamina regenerates 50% faster between points.', 'POTENTIAL', 'STM_RECOVERY_UP', '2.3.0'),
(20, 'concentration-master', '集中力マスター', 'Concentration Master', '专注大师', '專注大師', '집중력 마스터', 
 'Immune to opponent\'s debuff effects for first 5 attacks.', 'PASSIVE', 'DEBUFF_IMMUNITY', '3.8.0'),
(21, 'lucky-strike', 'ラッキーストライク', 'Lucky Strike', '幸运一击', '幸運一擊', '럭키 스트라이크', 
 'Low chance to instantly win the point regardless of stats.', 'PASSIVE', 'INSTANT_WIN_CHANCE', '4.2.0'),
(22, 'endurance-training', 'エンデュランストレーニング', 'Endurance Training', '耐力训练', '耐力訓練', '지구력 트레이닝', 
 'Reduces all stat decay by 40% throughout the match.', 'POTENTIAL', 'STAT_DECAY_RESIST', '3.0.0'),
(23, 'team-spirit', 'チームスピリット', 'Team Spirit', '团队精神', '團隊精神', '팀 스피릿', 
 'Gains bonus stats based on the number of same-character suits owned.', 'POTENTIAL', 'TEAM_BONUS', '4.0.0'),
(24, 'victory-rush', 'ビクトリーラッシュ', 'Victory Rush', '胜利冲刺', '勝利衝刺', '빅토리 러시', 
 'Each point won increases all stats by 5% (max 50%).', 'PASSIVE', 'MOMENTUM_BUILD', '4.3.0'),
(25, 'perfect-serve', 'パーフェクトサーブ', 'Perfect Serve', '完美发球', '完美發球', '퍼펙트 서브', 
 'First serve of each game has 100% success rate and +20% power.', 'PASSIVE', 'SERVE_PERFECT', '3.3.0');

-- ============================================================================
-- 3. ITEMS (Core Entity)
-- ============================================================================
INSERT INTO `items` (
  `id`, `unique_key`, `name_jp`, `name_en`, `name_cn`, `name_tw`, `name_kr`, 
  `description_en`, `source_description_en`, `item_category`, `rarity`, `game_version`
) VALUES
(1, 'v-stone-free', 'Vストーン(無償)', 'V-Stone (Free)', 'V宝石(免费)', 'V寶石(免費)', 'V스톤(무료)', 
 'A special currency used for gachas.', 'Events, Login Bonuses, Missions', 'CURRENCY', 'SSR', '1.0.0'),
(2, 'zack-money', 'ザックマネー', 'Zack Money', '扎克钱', '札克錢', '잭 머니', 
 'Standard currency for upgrading and buying items.', 'Playing matches, selling items', 'CURRENCY', 'N', '1.0.0'),
(3, 'pow-stone-ssr', 'POW強化石(SSR)', 'POW Upgrade Stone (SSR)', 'POW强化石(SSR)', 'POW強化石(SSR)', 'POW 강화석(SSR)', 
 'Used to upgrade POW-type swimsuits.', 'Event shops, Daily matches', 'UPGRADE_MATERIAL', 'SSR', '1.0.0'),
(4, 'tec-crystal-sr', 'TEC強化結晶(SR)', 'TEC Upgrade Crystal (SR)', 'TEC强化结晶(SR)', 'TEC強化結晶(SR)', 'TEC 강화 결정(SR)', 
 'Used to upgrade TEC-type swimsuits.', 'Event shops, Daily matches', 'UPGRADE_MATERIAL', 'SR', '1.0.0'),
(5, 'cheesecake', 'チーズケーキ', 'Cheesecake', '芝士蛋糕', '起司蛋糕', '치즈 케이크', 
 'A gift that Marie Rose loves.', 'Shop', 'GIFT', 'SR', '1.0.0'),
(6, 'fp-refill-100', 'FP回復ドリンク100', 'FP Refill Drink (100)', 'FP回复饮料100', 'FP回復飲料100', 'FP 회복 드링크 100', 
 'Restores 100 FP.', 'Login bonuses, owner shop', 'CONSUMABLE', 'R', '1.2.0'),
(7, 'starlight-coin-2023', '星明かりのコイン2023', 'Starlight Coin 2023', '星光硬币2023', '星光硬幣2023', '별빛 코인 2023', 
 'Can be exchanged for items in the Starlight Ocean Festival event shop.', 'Starlight Ocean Festival Event', 'CURRENCY', 'SR', '2.0.0'),
(8, 'ssr-unlock-stone', 'SSR覚醒石', 'SSR Awaken Stone', 'SSR觉醒石', 'SSR覺醒石', 'SSR 각성석', 
 'Used to awaken an SSR swimsuit to its maximum level.', 'VIP Shop, High-tier event rewards', 'UPGRADE_MATERIAL', 'SSR', '2.0.0'),
(9, 'stm-crystal-sr', 'STM強化結晶(SR)', 'STM Upgrade Crystal (SR)', 'STM强化结晶(SR)', 'STM強化結晶(SR)', 'STM 강화 결정(SR)', 
 'Used to upgrade STM-type swimsuits.', 'Event shops, Daily matches', 'UPGRADE_MATERIAL', 'SR', '1.5.0'),
(10, 'apl-crystal-ssr', 'APL強化結晶(SSR)', 'APL Upgrade Crystal (SSR)', 'APL强化结晶(SSR)', 'APL強化結晶(SSR)', 'APL 강화 결정(SSR)', 
 'Used to upgrade APL-type swimsuits.', 'VIP Shop, High-tier events', 'UPGRADE_MATERIAL', 'SSR', '3.0.0'),
(11, 'chocolate-cake', 'チョコレートケーキ', 'Chocolate Cake', '巧克力蛋糕', '巧克力蛋糕', '초콜릿 케이크', 
 'A sweet gift that most characters enjoy.', 'Shop, Events', 'GIFT', 'R', '1.0.0'),
(12, 'diamond-necklace', 'ダイヤモンドネックレス', 'Diamond Necklace', '钻石项链', '鑽石項鍊', '다이아몬드 목걸이', 
 'A luxurious accessory that increases Appeal stats.', 'VIP Shop, Special Events', 'ACCESSORY', 'SSR', '2.8.0'),
(13, 'owner-points', 'オーナーポイント', 'Owner Points', '老板积分', '老闆積分', '오너 포인트', 
 'Points earned from various activities that can be spent in the Owner Shop.', 'Daily activities, events', 'CURRENCY', 'R', '1.0.0'),
(14, 'trendy-voucher', 'トレンド券', 'Trendy Voucher', '潮流券', '潮流券', '트렌드 바우처', 
 'Special tickets used for Trendy gacha pulls.', 'Festival events, special promotions', 'CURRENCY', 'SR', '2.0.0'),
(15, 'birthday-gift-box', 'バースデーギフトボックス', 'Birthday Gift Box', '生日礼品盒', '生日禮品盒', '생일 선물 상자', 
 'A special gift box containing random birthday-themed items.', 'Birthday events', 'CONSUMABLE', 'SSR', '1.5.0'),
(16, 'rainbow-crystal', 'レインボークリスタル', 'Rainbow Crystal', '彩虹水晶', '彩虹水晶', '레인보우 크리스탈', 
 'A rare crystal that can be used to upgrade any type of swimsuit.', 'Special events, VIP shop', 'UPGRADE_MATERIAL', 'SSR', '3.5.0'),
(17, 'festival-token-2023', '祭りトークン2023', 'Festival Token 2023', '庆典代币2023', '慶典代幣2023', '페스티벌 토큰 2023', 
 'Special currency for summer festival event shop.', 'Summer Festival Event', 'CURRENCY', 'SR', '4.7.0'),
(18, 'energy-potion-xl', 'エナジーポーションXL', 'Energy Potion XL', '能量药水XL', '能量藥水XL', '에너지 포션 XL', 
 'Restores full FP and provides temporary stat boost.', 'VIP shop, premium rewards', 'CONSUMABLE', 'SSR', '2.5.0'),
(19, 'venus-coin', 'ヴィーナスコイン', 'Venus Coin', '维纳斯硬币', '維納斯硬幣', '비너스 코인', 
 'Premium currency for exclusive shop items.', 'Premium purchases, special events', 'CURRENCY', 'SSR', '2.0.0'),
(20, 'skill-book-legendary', 'スキルブック・伝説', 'Legendary Skill Book', '传说技能书', '傳說技能書', '레전더리 스킬북', 
 'Contains a random legendary skill for bromide decoration.', 'High-tier event rewards', 'CONSUMABLE', 'SSR', '3.8.0'),
(21, 'pearl-necklace', 'パールネックレス', 'Pearl Necklace', '珍珠项链', '珍珠項鍊', '펄 목걸이', 
 'Elegant accessory that enhances character appeal.', 'Shop, special events', 'ACCESSORY', 'SR', '2.2.0'),
(22, 'stamina-drink-max', 'スタミナドリンクMAX', 'Stamina Drink MAX', '耐力饮料MAX', '耐力飲料MAX', '스태미너 드링크 MAX', 
 'Fully restores stamina and prevents decay for one match.', 'Premium shop, tournament rewards', 'CONSUMABLE', 'SR', '2.8.0'),
(23, 'friendship-bracelet', 'フレンドシップブレスレット', 'Friendship Bracelet', '友谊手链', '友誼手鍊', '프렌드십 브레이슬릿', 
 'A gift that increases affection with any character.', 'Events, daily login rewards', 'GIFT', 'R', '1.8.0'),
(24, 'trend-fragment', 'トレンドフラグメント', 'Trend Fragment', '潮流碎片', '潮流碎片', '트렌드 프래그먼트', 
 'Can be combined to create trendy vouchers.', 'Daily missions, mini-games', 'UPGRADE_MATERIAL', 'N', '3.0.0'),
(25, 'lucky-charm-gold', 'ゴールドラッキーチャーム', 'Gold Lucky Charm', '黄金幸运符', '黃金幸運符', '골드 럭키 참', 
 'Increases rare item drop rates for 24 hours.', 'VIP shop, anniversary events', 'CONSUMABLE', 'SSR', '4.0.0');

-- ============================================================================
-- 4. BROMIDES (Core Entity) 
-- ============================================================================
INSERT INTO `bromides` (
  `id`, `unique_key`, `name_jp`, `name_en`, `name_cn`, `name_tw`, `name_kr`, 
  `bromide_type`, `rarity`, `skill_id`, `game_version`
) VALUES
(1, 'deco-ssr-pow-attack-1', 'POWアタックデコブロマイド', 'SSR POW Attack Bromide', 'SSR力量攻击写真', 'SSR力量攻擊寫真', 'SSR 파워 어택 브로마이드', 
 'DECO', 'SSR', 3, '2.5.0'),
(2, 'deco-sr-stm-support-1', 'STMサポートデコブロマイド', 'SR STM Support Bromide', 'SR耐力辅助写真', 'SR耐力輔助寫真', 'SR 스태미너 서포트 브로마이드', 
 'DECO', 'SR', 4, '1.10.0'),
(3, 'deco-ssr-tec-feint-1', 'TECフェイントデコブロマイド', 'SSR TEC Feint Bromide', 'SSR技巧佯攻写真', 'SSR技巧佯攻寫真', 'SSR 테크닉 페인트 브로마이드', 
 'DECO', 'SSR', 2, '2.8.0'),
(4, 'owner-sr-marie-01', 'マリーオーナーブロマイド01', 'Marie Owner Bromide 01', '玛莉老板写真01', '瑪莉老闆寫真01', '마리 오너 브로마이드 01', 
 'OWNER', 'SR', NULL, '1.0.0'),
(5, 'owner-ssr-honoka-01', 'ほのかオーナーブロマイド01', 'Honoka Owner Bromide 01', '穗香老板写真01', '穗香老闆寫真01', '호노카 오너 브로마이드 01', 
 'OWNER', 'SSR', NULL, '1.2.0'),
(6, 'deco-r-defense-1', 'ディフェンスデコブロマイド', 'R Defense Bromide', 'R防御写真', 'R防禦寫真', 'R 디펜스 브로마이드', 
 'DECO', 'R', 9, '1.8.0'),
(7, 'owner-ssr-kasumi-01', 'かすみオーナーブロマイド01', 'Kasumi Owner Bromide 01', '霞老板写真01', '霞老闆寫真01', '카스미 오너 브로마이드 01', 
 'OWNER', 'SSR', NULL, '1.8.0'),
(8, 'deco-ssr-apl-charm-1', 'APLチャームデコブロマイド', 'SSR APL Charm Bromide', 'SSR魅力写真', 'SSR魅力寫真', 'SSR 어필 참 브로마이드', 
 'DECO', 'SSR', 12, '3.0.0'),
(9, 'owner-sr-misaki-01', 'みさきオーナーブロマイド01', 'Misaki Owner Bromide 01', '海咲老板写真01', '海咲老闆寫真01', '미사키 오너 브로마이드 01', 
 'OWNER', 'SR', NULL, '1.0.0'),
(10, 'deco-ssr-critical-1', 'クリティカルデコブロマイド', 'SSR Critical Bromide', 'SSR暴击写真', 'SSR暴擊寫真', 'SSR 크리티컬 브로마이드', 
 'DECO', 'SSR', 8, '2.0.0'),
(11, 'owner-ssr-tina-01', 'ティナオーナーブロマイド01', 'Tina Owner Bromide 01', '蒂娜老板写真01', '蒂娜老闆寫真01', '티나 오너 브로마이드 01', 
 'OWNER', 'SSR', NULL, '2.0.0'),
(12, 'deco-sr-team-spirit', 'チームスピリットデコブロマイド', 'SR Team Spirit Bromide', 'SR团队精神写真', 'SR團隊精神寫真', 'SR 팀 스피릿 브로마이드', 
 'DECO', 'SR', 23, '4.0.0'),
(13, 'owner-sr-mila-01', 'ミラオーナーブロマイド01', 'Mila Owner Bromide 01', '米拉老板写真01', '米拉老闆寫真01', '밀라 오너 브로마이드 01', 
 'OWNER', 'SR', NULL, '2.2.0'),
(14, 'deco-ssr-victory-rush', 'ビクトリーラッシュデコブロマイド', 'SSR Victory Rush Bromide', 'SSR胜利冲刺写真', 'SSR勝利衝刺寫真', 'SSR 빅토리 러시 브로마이드', 
 'DECO', 'SSR', 24, '4.3.0'),
(15, 'owner-ssr-christie-01', 'クリスティオーナーブロマイド01', 'Christie Owner Bromide 01', '克里斯蒂老板写真01', '克里斯蒂老闆寫真01', '크리스티 오너 브로마이드 01', 
 'OWNER', 'SSR', NULL, '2.5.0'),
(16, 'deco-r-quick-recovery', 'クイックリカバリーデコブロマイド', 'R Quick Recovery Bromide', 'R快速恢复写真', 'R快速恢復寫真', 'R 퀵 리커버리 브로마이드', 
 'DECO', 'R', 19, '2.3.0'),
(17, 'owner-sr-lisa-01', 'リサオーナーブロマイド01', 'Lisa Owner Bromide 01', '莉萨老板写真01', '莉薩老闆寫真01', '리사 오너 브로마이드 01', 
 'OWNER', 'SR', NULL, '2.8.0'),
(18, 'deco-ssr-perfect-serve', 'パーフェクトサーブデコブロマイド', 'SSR Perfect Serve Bromide', 'SSR完美发球写真', 'SSR完美發球寫真', 'SSR 퍼펙트 서브 브로마이드', 
 'DECO', 'SSR', 25, '3.3.0'),
(19, 'owner-ssr-rachel-01', 'レイチェルオーナーブロマイド01', 'Rachel Owner Bromide 01', '瑞秋老板写真01', '瑞秋老闆寫真01', '레이첼 오너 브로마이드 01', 
 'OWNER', 'SSR', NULL, '3.0.0'),
(20, 'deco-sr-all-round-boost', 'オールラウンドアップデコブロマイド', 'SR All-Round Boost Bromide', 'SR全能提升写真', 'SR全能提升寫真', 'SR 올라운드 업 브로마이드', 
 'DECO', 'SR', 17, '3.5.0');

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
 'SSR', 'POW', 5750, 1, 1, '2023-09-01', '4.13.0'),
-- Tina swimsuits
(16, 11, 'ssr-tina-golden-thunder', 'ゴールデンサンダー', 'Golden Thunder', '黄金雷电', '黃金雷電', '골든 썬더', 
 'SSR', 'POW', 6100, 1, 1, '2023-10-01', '5.0.0'),
(17, 11, 'sr-tina-rock-star', 'ロックスター', 'Rock Star', '摇滚明星', '搖滾明星', '록 스타', 
 'SR', 'STM', 4300, 0, 0, '2022-12-15', '3.8.0'),
-- Mila swimsuits
(18, 12, 'ssr-mila-sambo-champion', 'サンボチャンピオン', 'Sambo Champion', '桑搏冠军', '桑搏冠軍', '삼보 챔피언', 
 'SSR', 'STM', 5900, 1, 1, '2023-11-10', '5.1.0'),
(19, 12, 'sr-mila-combat-gear', 'コンバットギア', 'Combat Gear', '战斗装备', '戰鬥裝備', '컴뱃 기어', 
 'SR', 'POW', 4100, 0, 0, '2022-08-20', '3.4.0'),
-- Christie swimsuits
(20, 13, 'ssr-christie-shadow-assassin', 'シャドウアサシン', 'Shadow Assassin', '暗影刺客', '暗影刺客', '섀도우 어쌔신', 
 'SSR', 'TEC', 5850, 1, 1, '2023-12-01', '5.2.0'),
(21, 13, 'sr-christie-midnight-silk', 'ミッドナイトシルク', 'Midnight Silk', '午夜丝绸', '午夜絲綢', '미드나이트 실크', 
 'SR', 'APL', 4250, 1, 0, '2022-10-05', '3.6.0'),
-- Lisa swimsuits
(22, 14, 'ssr-lisa-street-fighter', 'ストリートファイター', 'Street Fighter', '街头霸王', '街頭霸王', '스트리트 파이터', 
 'SSR', 'POW', 5950, 1, 1, '2024-01-15', '5.3.0'),
(23, 14, 'sr-lisa-urban-legend', 'アーバンレジェンド', 'Urban Legend', '都市传说', '都市傳說', '어반 레전드', 
 'SR', 'TEC', 4150, 0, 0, '2022-11-12', '3.7.0'),
-- Rachel swimsuits
(24, 15, 'ssr-rachel-fiend-hunter', 'フィエンドハンター', 'Fiend Hunter', '恶魔猎手', '惡魔獵手', '피엔드 헌터', 
 'SSR', 'APL', 6000, 1, 1, '2024-02-14', '5.4.0'),
(25, 15, 'sr-rachel-gothic-rose', 'ゴシックローズ', 'Gothic Rose', '哥特玫瑰', '哥德玫瑰', '고딕 로즈', 
 'SR', 'TEC', 4200, 1, 0, '2023-01-20', '4.5.0');

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
 'Participate in the Starlight Ocean Festival.', 'EVENT', 'events', 1, '4.5.0'),
(9, 'ep-char-tina-01', 'ティナの挑戦', 'Tina''s Challenge', '蒂娜的挑战', '蒂娜的挑戰', '티나의 도전', 
 'Reach Character Level 25 with Tina.', 'CHARACTER', 'characters', 11, '2.0.0'),
(10, 'ep-char-mila-01', 'ミラの戦い', 'Mila''s Battle', '米拉的战斗', '米拉的戰鬥', '밀라의 싸움', 
 'Reach Character Level 30 with Mila.', 'CHARACTER', 'characters', 12, '2.2.0'),
(11, 'ep-char-christie-01', 'クリスティの秘密', 'Christie''s Secret', '克里斯蒂的秘密', '克里斯蒂的秘密', '크리스티의 비밀', 
 'Reach Character Level 35 with Christie.', 'CHARACTER', 'characters', 13, '2.5.0'),
(12, 'ep-swimsuit-golden-thunder', '雷鳴の記憶', 'Memories of Thunder', '雷鸣的回忆', '雷鳴的回憶', '천둥의 기억', 
 'Obtain the "Golden Thunder" swimsuit for Tina.', 'SWIMSUIT', 'swimsuits', 16, '5.0.0'),
(13, 'ep-swimsuit-shadow-assassin', '影の刺客', 'Shadow Assassin', '影之刺客', '影之刺客', '그림자 암살자', 
 'Obtain the "Shadow Assassin" swimsuit for Christie.', 'SWIMSUIT', 'swimsuits', 20, '5.2.0'),
(14, 'ep-main-chapter-10', 'チャプター10～真実の扉～', 'Chapter 10 ~ Door of Truth ~', '第十章～真相之门～', '第十章～真相之門～', '챕터10 ~진실의 문~', 
 'Complete Chapter 9.', 'MAIN', NULL, NULL, '4.0.0'),
(15, 'ep-char-lisa-01', 'リサの過去', 'Lisa''s Past', '莉萨的过去', '莉薩的過去', '리사의 과거', 
 'Reach Character Level 40 with Lisa.', 'CHARACTER', 'characters', 14, '2.8.0'),
(16, 'ep-char-rachel-01', 'レイチェルの使命', 'Rachel''s Mission', '瑞秋的使命', '瑞秋的使命', '레이첼의 사명', 
 'Reach Character Level 45 with Rachel.', 'CHARACTER', 'characters', 15, '3.0.0'),
(17, 'ep-swimsuit-fiend-hunter', '悪魔狩りの証', 'Proof of Demon Hunting', '恶魔狩猎的证明', '惡魔狩獵的證明', '악마 사냥의 증거', 
 'Obtain the "Fiend Hunter" swimsuit for Rachel.', 'SWIMSUIT', 'swimsuits', 24, '5.4.0'),
(18, 'ep-main-finale', 'フィナーレ～新たなる始まり～', 'Finale ~ A New Beginning ~', '终章～新的开始～', '終章～新的開始～', '피날레 ~새로운 시작~', 
 'Complete all previous chapters.', 'MAIN', NULL, NULL, '5.0.0');

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
 'FESTIVAL_RANKING', '4.9.0', '2023-07-01 04:00:00', '2023-07-15 03:59:59'),
(9, 'tina-debut-celebration', 'ティナデビュー記念', 'Tina Debut Celebration', '蒂娜出道庆典', '蒂娜出道慶典', '티나 데뷔 기념', 
 'LOGIN_BONUS', '2.0.0', '2022-01-01 04:00:00', '2022-01-08 03:59:59'),
(10, 'halloween-horror-night', 'ハロウィンホラーナイト', 'Halloween Horror Night', '万圣节恐怖之夜', '萬聖節恐怖之夜', '할로윈 호러 나이트', 
 'FESTIVAL_CUMULATIVE', '4.10.0', '2023-10-25 04:00:00', '2023-11-02 03:59:59'),
(11, 'winter-wonderland-festival', 'ウィンターワンダーランド', 'Winter Wonderland Festival', '冬季仙境节', '冬季仙境節', '윈터 원더랜드 페스티벌', 
 'FESTIVAL_RANKING', '5.0.0', '2023-12-20 04:00:00', '2024-01-05 03:59:59'),
(12, 'spring-cherry-blossom', '春の桜祭り', 'Spring Cherry Blossom Festival', '春季樱花节', '春季櫻花節', '봄 벚꽃 축제', 
 'FESTIVAL_CUMULATIVE', '5.1.0', '2024-03-20 04:00:00', '2024-04-03 03:59:59'),
(13, 'mila-combat-tournament', 'ミラコンバットトーナメント', 'Mila Combat Tournament', '米拉格斗锦标赛', '米拉格鬥錦標賽', '밀라 컴뱃 토너먼트', 
 'TOWER', '3.4.0', '2022-08-20 04:00:00', '2022-09-05 03:59:59'),
(14, 'christie-stealth-mission', 'クリスティステルスミッション', 'Christie Stealth Mission', '克里斯蒂潜行任务', '克里斯蒂潛行任務', '크리스티 스텔스 미션', 
 'ROCK_CLIMBING', '3.6.0', '2022-10-05 04:00:00', '2022-10-15 03:59:59'),
(15, 'new-year-celebration-2024', '新年祝賀2024', 'New Year Celebration 2024', '新年庆典2024', '新年慶典2024', '신년 축하 2024', 
 'LOGIN_BONUS', '5.3.0', '2024-01-01 04:00:00', '2024-01-07 03:59:59'),
(16, 'rachel-dark-ritual', 'レイチェルダークリチュアル', 'Rachel Dark Ritual', '瑞秋黑暗仪式', '瑞秋黑暗儀式', '레이첼 다크 리추얼', 
 'BUTT_BATTLE', '5.4.0', '2024-02-14 04:00:00', '2024-02-25 03:59:59'),
(17, 'golden-week-special', 'ゴールデンウィークスペシャル', 'Golden Week Special', '黄金周特别活动', '黃金週特別活動', '골든위크 스페셜', 
 'FESTIVAL_RANKING', '5.5.0', '2024-04-29 04:00:00', '2024-05-05 03:59:59'),
(18, 'summer-solstice-festival', '夏至祭り', 'Summer Solstice Festival', '夏至节', '夏至節', '하지 축제', 
 'FESTIVAL_CUMULATIVE', '5.6.0', '2024-06-21 04:00:00', '2024-06-30 03:59:59');

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
 'TRENDY', '4.6.0', '2023-02-14 04:00:00', '2023-02-21 03:59:59'),
(7, 'gacha-tina-golden-thunder', 'ゴールデンサンダーガチャ', 'Golden Thunder Gacha', '黄金雷电扭蛋', '黃金雷電扭蛋', '골든 썬더 뽑기', 
 'TRENDY', '5.0.0', '2023-10-01 04:00:00', '2023-10-15 03:59:59'),
(8, 'gacha-halloween-horror', 'ハロウィンホラーガチャ', 'Halloween Horror Gacha', '万圣节恐怖扭蛋', '萬聖節恐怖扭蛋', '할로윈 호러 뽑기', 
 'NOSTALGIC', '4.10.0', '2023-10-25 04:00:00', '2023-11-02 03:59:59'),
(9, 'gacha-winter-wonderland', 'ウィンターワンダーランドガチャ', 'Winter Wonderland Gacha', '冬季仙境扭蛋', '冬季仙境扭蛋', '윈터 원더랜드 뽑기', 
 'ANNIVERSARY', '5.0.0', '2023-12-20 04:00:00', '2024-01-05 03:59:59'),
(10, 'gacha-mila-combat-special', 'ミラコンバットスペシャル', 'Mila Combat Special Gacha', '米拉格斗特别扭蛋', '米拉格鬥特別扭蛋', '밀라 컴뱃 스페셜 뽑기', 
 'PAID', '3.4.0', '2022-08-20 04:00:00', '2022-09-05 03:59:59'),
(11, 'gacha-christie-shadow-collection', 'クリスティシャドウコレクション', 'Christie Shadow Collection', '克里斯蒂暗影收藏', '克里斯蒂暗影收藏', '크리스티 섀도우 콜렉션', 
 'BIRTHDAY', '5.2.0', '2023-12-01 04:00:00', '2023-12-08 03:59:59'),
(12, 'gacha-new-year-2024', '新年記念ガチャ2024', 'New Year Memorial Gacha 2024', '新年纪念扭蛋2024', '新年紀念扭蛋2024', '신년 기념 뽑기 2024', 
 'ANNIVERSARY', '5.3.0', '2024-01-01 04:00:00', '2024-01-15 03:59:59'),
(13, 'gacha-lisa-street-fighter', 'リサストリートファイター', 'Lisa Street Fighter Gacha', '莉萨街头霸王扭蛋', '莉薩街頭霸王扭蛋', '리사 스트리트 파이터 뽑기', 
 'TRENDY', '5.3.0', '2024-01-15 04:00:00', '2024-01-29 03:59:59'),
(14, 'gacha-rachel-fiend-hunter', 'レイチェルフィエンドハンター', 'Rachel Fiend Hunter Gacha', '瑞秋恶魔猎手扭蛋', '瑞秋惡魔獵手扭蛋', '레이첼 피엔드 헌터 뽑기', 
 'PAID', '5.4.0', '2024-02-14 04:00:00', '2024-02-28 03:59:59'),
(15, 'gacha-spring-cherry-blossom', '春の桜ガチャ', 'Spring Cherry Blossom Gacha', '春季樱花扭蛋', '春季櫻花扭蛋', '봄 벚꽃 뽑기', 
 'NOSTALGIC', '5.1.0', '2024-03-20 04:00:00', '2024-04-03 03:59:59'),
(16, 'gacha-golden-week-premium', 'ゴールデンウィークプレミアム', 'Golden Week Premium Gacha', '黄金周高级扭蛋', '黃金週高級扭蛋', '골든위크 프리미엄 뽑기', 
 'ANNIVERSARY', '5.5.0', '2024-04-29 04:00:00', '2024-05-05 03:59:59');

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
 NOW(), NOW()),
('tina-character-guide', 'Tina Complete Character Guide',
 'Everything you need to know about mastering Tina in combat and events.',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Tina is a powerful POW-type character with unique wrestling-based abilities."}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Combat Strategy"}]},{"type":"paragraph","content":[{"type":"text","text":"Focus on building her POW stats for maximum damage output."}]}]}',
 NOW(), NOW()),
('mila-training-manual', 'Mila Training Manual',
 'Advanced combat techniques and build strategies for Mila players.',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Mila excels in defensive combat with her Sambo techniques."}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Defensive Builds"}]},{"type":"paragraph","content":[{"type":"text","text":"Prioritize STM and defensive skills for optimal performance."}]}]}',
 NOW(), NOW()),
('christie-stealth-tactics', 'Christie Stealth Tactics',
 'Master the art of stealth and precision with Christie advanced techniques.',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Christie specializes in TEC-based stealth attacks and critical hits."}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Stealth Mechanics"}]},{"type":"paragraph","content":[{"type":"text","text":"Use her stealth abilities to gain advantage in combat."}]}]}',
 NOW(), NOW()),
('skill-synergy-combinations', 'Ultimate Skill Synergy Guide',
 'Discover the most powerful skill combinations and synergies in the game.',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Learn how to combine different skills for maximum effectiveness."}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Top Synergies"}]},{"type":"paragraph","content":[{"type":"text","text":"Fever skills work best when combined with stat boost potentials."}]}]}',
 NOW(), NOW()),
('event-farming-efficiency', 'Event Farming Efficiency Guide',
 'Maximize your event rewards with these proven farming strategies.',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Efficient farming is key to getting the best event rewards."}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Farming Routes"}]},{"type":"paragraph","content":[{"type":"text","text":"Plan your farming routes based on event point multipliers."}]}]}',
 NOW(), NOW()),
('gacha-investment-strategy', 'Smart Gacha Investment Strategy',
 'Make informed decisions about your gacha pulls and resource management.',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Strategic gacha pulling can save you significant resources."}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Pull Timing"}]},{"type":"paragraph","content":[{"type":"text","text":"Wait for guaranteed SSR events when possible."}]}]}',
 NOW(), NOW()),
('bromide-decoration-mastery', 'Bromide Decoration Mastery',
 'Complete guide to optimizing bromide decorations for maximum stat gains.',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Bromide decorations can significantly boost your performance."}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Decoration Strategy"}]},{"type":"paragraph","content":[{"type":"text","text":"Match decoration skills with your character build for best results."}]}]}',
 NOW(), NOW()),
('competitive-ranking-guide', 'Competitive Ranking Strategies',
 'Advanced tactics for climbing the rankings in competitive events.',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Ranking events require specific strategies and timing."}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Timing Your Climbs"}]},{"type":"paragraph","content":[{"type":"text","text":"Save your best runs for the final hours of ranking events."}]}]}',
 NOW(), NOW()),
('resource-management-mastery', 'Resource Management Mastery',
 'Comprehensive guide to managing all in-game currencies and materials efficiently.',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Proper resource management is crucial for long-term success."}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Priority Spending"}]},{"type":"paragraph","content":[{"type":"text","text":"Invest in upgrade materials before luxury items."}]}]}',
 NOW(), NOW()),
('new-player-complete-roadmap', 'New Player Complete Roadmap',
 'Step-by-step progression guide for new players from beginner to advanced.',
 '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"A complete roadmap for new players to progress efficiently."}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"First Steps"}]},{"type":"paragraph","content":[{"type":"text","text":"Focus on completing the main story and daily missions first."}]}]}',
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
 '2023-02-14 04:00:00', '["valentine", "love", "special", "romance"]', NOW(), NOW()),
('v5-0-0-tina-golden-era', '5.0.0', 'Golden Era Update - Tina''s Ascension',
 'Major version update featuring Tina''s Golden Thunder swimsuit and revolutionary combat mechanics.',
 'The Golden Era begins with enhanced combat systems, new character abilities, and Tina''s ultimate transformation.',
 '2023-10-01 04:00:00', '["major-update", "tina", "golden-thunder", "combat"]', NOW(), NOW()),
('v5-1-0-mila-sambo-master', '5.1.0', 'Sambo Master Update',
 'Mila receives her championship swimsuit and introduces new defensive combat mechanics.',
 'Celebrate Mila''s mastery with her championship gear and enhanced defensive gameplay systems.',
 '2023-11-10 04:00:00', '["mila", "sambo", "defensive", "champion"]', NOW(), NOW()),
('v5-2-0-christie-shadow-arts', '5.2.0', 'Shadow Arts Update',
 'Christie''s stealth abilities reach new heights with the Shadow Assassin collection.',
 'Master the shadows with Christie''s new stealth mechanics and assassination techniques.',
 '2023-12-01 04:00:00', '["christie", "stealth", "shadow", "assassin"]', NOW(), NOW()),
('v5-3-0-lisa-street-legend', '5.3.0', 'Street Legend Update',
 'Lisa brings street fighting to Venus Island with her legendary combat style.',
 'Experience urban combat with Lisa''s street fighting techniques and legendary reputation.',
 '2024-01-15 04:00:00', '["lisa", "street-fighter", "urban", "legend"]', NOW(), NOW()),
('v5-4-0-rachel-demon-hunter', '5.4.0', 'Demon Hunter Chronicles',
 'Rachel''s supernatural abilities awaken with the Fiend Hunter transformation.',
 'Unleash supernatural powers with Rachel''s demon hunting abilities and mystical transformations.',
 '2024-02-14 04:00:00', '["rachel", "supernatural", "demon-hunter", "mystical"]', NOW(), NOW()),
('v4-10-0-halloween-horror', '4.10.0', 'Halloween Horror Spectacular',
 'Spooky Halloween event with horror-themed content and special limited swimsuits.',
 'Experience the thrill of Halloween with horror-themed events and spine-chilling content.',
 '2023-10-25 04:00:00', '["halloween", "horror", "spooky", "limited"]', NOW(), NOW()),
('v5-5-0-golden-week-celebration', '5.5.0', 'Golden Week Celebration',
 'Special Japanese holiday celebration with exclusive content and cultural themes.',
 'Celebrate Golden Week with traditional Japanese festivities and exclusive cultural content.',
 '2024-04-29 04:00:00', '["golden-week", "japanese", "cultural", "celebration"]', NOW(), NOW()),
('v3-4-0-mila-combat-debut', '3.4.0', 'Combat Specialist Debut',
 'Mila makes her combat debut with unique Sambo fighting techniques.',
 'Welcome the combat specialist with revolutionary fighting mechanics and martial arts expertise.',
 '2022-08-20 04:00:00', '["mila", "debut", "combat", "sambo"]', NOW(), NOW()),
('v3-6-0-christie-stealth-intro', '3.6.0', 'Stealth Operations Introduction',
 'Christie introduces stealth mechanics and covert operation gameplay.',
 'Master the art of stealth with Christie''s introduction of covert operations and tactical gameplay.',
 '2022-10-05 04:00:00', '["christie", "stealth", "covert", "tactical"]', NOW(), NOW()),
('v5-6-0-summer-solstice', '5.6.0', 'Summer Solstice Festival',
 'Celebrate the longest day of summer with solar-themed events and bright new content.',
 'Embrace the summer solstice with sun-themed festivities and radiant new features.',
 '2024-06-21 04:00:00', '["summer", "solstice", "solar", "festival"]', NOW(), NOW());

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
(15, 3, 'POTENTIAL_2'),
-- Golden Thunder (Tina, POW SSR)
(16, 1, 'ACTIVE'),     
(16, 16, 'PASSIVE_1'), 
(16, 13, 'POTENTIAL_1'),
(16, 18, 'POTENTIAL_2'),
-- Rock Star (Tina, STM SR)
(17, 11, 'ACTIVE'),    
(17, 22, 'POTENTIAL_1'),
-- Sambo Champion (Mila, STM SSR)
(18, 11, 'ACTIVE'),    
(18, 19, 'PASSIVE_1'), 
(18, 4, 'POTENTIAL_1'),
(18, 22, 'POTENTIAL_2'),
-- Combat Gear (Mila, POW SR)
(19, 1, 'ACTIVE'),     
(19, 17, 'POTENTIAL_1'),
-- Shadow Assassin (Christie, TEC SSR)
(20, 2, 'ACTIVE'),     
(20, 20, 'PASSIVE_1'), 
(20, 5, 'POTENTIAL_1'),
(20, 21, 'POTENTIAL_2'),
-- Midnight Silk (Christie, APL SR)
(21, 12, 'ACTIVE'),    
(21, 14, 'POTENTIAL_1'),
-- Street Fighter (Lisa, POW SSR)
(22, 1, 'ACTIVE'),     
(22, 24, 'PASSIVE_1'), 
(22, 13, 'POTENTIAL_1'),
(22, 16, 'POTENTIAL_2'),
-- Urban Legend (Lisa, TEC SR)
(23, 2, 'ACTIVE'),     
(23, 17, 'POTENTIAL_1'),
-- Fiend Hunter (Rachel, APL SSR)
(24, 12, 'ACTIVE'),    
(24, 23, 'PASSIVE_1'), 
(24, 14, 'POTENTIAL_1'),
(24, 25, 'POTENTIAL_2'),
-- Gothic Rose (Rachel, TEC SR)
(25, 2, 'ACTIVE'),     
(25, 20, 'POTENTIAL_1');

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
(6, 'BROMIDE', 8, 1.5000, 0),
-- Golden Thunder Gacha
(7, 'SWIMSUIT', 16, 0.8000, 1),  
(7, 'SWIMSUIT', 17, 3.5000, 0),  
(7, 'ITEM', 16, 5.0000, 0),      
(7, 'BROMIDE', 11, 2.0000, 0),   
-- Halloween Horror Gacha
(8, 'SWIMSUIT', 20, 1.2000, 1),  
(8, 'SWIMSUIT', 21, 2.8000, 0),  
(8, 'ITEM', 20, 6.0000, 0),      
(8, 'BROMIDE', 15, 1.8000, 0),   
-- Winter Wonderland Gacha
(9, 'SWIMSUIT', 18, 0.6000, 1),  
(9, 'SWIMSUIT', 19, 2.2000, 0),  
(9, 'ITEM', 18, 4.0000, 0),      
(9, 'BROMIDE', 13, 1.5000, 0),   
-- Mila Combat Special Gacha
(10, 'SWIMSUIT', 18, 1.8000, 1), 
(10, 'SWIMSUIT', 19, 4.0000, 0), 
(10, 'ITEM', 22, 7.0000, 0),     
(10, 'BROMIDE', 13, 2.5000, 0),  
-- Christie Shadow Collection
(11, 'SWIMSUIT', 20, 1.1000, 1), 
(11, 'SWIMSUIT', 21, 3.3000, 0), 
(11, 'ITEM', 21, 5.5000, 0),     
(11, 'BROMIDE', 15, 2.0000, 0),  
-- New Year 2024 Gacha
(12, 'SWIMSUIT', 22, 0.9000, 1), 
(12, 'SWIMSUIT', 24, 0.7000, 1), 
(12, 'ITEM', 25, 3.5000, 0),     
(12, 'BROMIDE', 17, 1.8000, 0),  
-- Lisa Street Fighter Gacha
(13, 'SWIMSUIT', 22, 1.0000, 1), 
(13, 'SWIMSUIT', 23, 3.8000, 0), 
(13, 'ITEM', 19, 8.0000, 0),     
(13, 'BROMIDE', 17, 2.2000, 0),  
-- Rachel Fiend Hunter Gacha
(14, 'SWIMSUIT', 24, 1.5000, 1), 
(14, 'SWIMSUIT', 25, 3.0000, 0), 
(14, 'ITEM', 21, 6.5000, 0),     
(14, 'BROMIDE', 19, 2.8000, 0),  
-- Spring Cherry Blossom Gacha
(15, 'SWIMSUIT', 13, 1.3000, 1), 
(15, 'SWIMSUIT', 25, 2.7000, 0), 
(15, 'ITEM', 23, 9.0000, 0),     
(15, 'BROMIDE', 12, 1.9000, 0),  
-- Golden Week Premium Gacha
(16, 'SWIMSUIT', 16, 0.5000, 1), 
(16, 'SWIMSUIT', 22, 0.6000, 1), 
(16, 'SWIMSUIT', 24, 0.4000, 1), 
(16, 'ITEM', 25, 2.5000, 0);     

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
('EVENT', 15, 7, 200, '2023-02-14 04:00:00', '2023-02-21 03:59:59'),
('VIP', 16, 1, 12000, NULL, NULL),                                  
('GENERAL', 17, 2, 8000, NULL, NULL),                               
('EVENT', 18, 17, 800, '2024-06-21 04:00:00', '2024-06-30 03:59:59'),
('VIP', 19, 1, 15000, NULL, NULL),                                  
('GENERAL', 20, 2, 50000, NULL, NULL),                              
('EVENT', 21, 17, 400, '2024-06-21 04:00:00', '2024-06-30 03:59:59'),
('VIP', 22, 1, 6000, NULL, NULL),                                   
('GENERAL', 23, 2, 3000, NULL, NULL),                               
('CURRENCY', 24, 2, 500, NULL, NULL),                               
('EVENT', 25, 19, 1000, '2024-04-29 04:00:00', '2024-05-05 03:59:59');

-- ============================================================================
-- DATA INSERTION COMPLETE
-- ============================================================================ 