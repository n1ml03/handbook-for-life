CREATE DATABASE IF NOT EXISTS doaxvv_handbook
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE doaxvv_handbook;

-- ============================================================================
-- 1. CÁC BẢNG CỐT LÕI (Core Entities)
-- ============================================================================

CREATE TABLE characters (
    id SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'ID tự tăng, khóa chính của nhân vật',
    unique_key VARCHAR(100) NOT NULL UNIQUE COMMENT 'Khóa định danh dạng text, không đổi, dùng cho URL và API',
    name_jp VARCHAR(100) NOT NULL COMMENT 'Tên nhân vật (tiếng Nhật)',
    name_en VARCHAR(100) NOT NULL COMMENT 'Tên nhân vật (tiếng Anh)',
    name_cn VARCHAR(100) NOT NULL COMMENT 'Tên nhân vật (tiếng Trung Giản)',
    name_tw VARCHAR(100) NOT NULL COMMENT 'Tên nhân vật (tiếng Trung Phồn)',
    name_kr VARCHAR(100) NOT NULL COMMENT 'Tên nhân vật (tiếng Hàn)',
    birthday DATE COMMENT 'Ngày sinh của nhân vật',
    height SMALLINT UNSIGNED COMMENT 'Chiều cao (cm)',
    measurements VARCHAR(20) COMMENT 'Số đo 3 vòng',
    blood_type VARCHAR(5) COMMENT 'Nhóm máu',
    voice_actor_jp VARCHAR(100) COMMENT 'Tên diễn viên lồng tiếng (tiếng Nhật)',
    profile_image_url VARCHAR(255) COMMENT 'URL đến ảnh đại diện của nhân vật',
    is_active BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Nhân vật có còn hoạt động trong game không',
    INDEX idx_birthday (birthday) COMMENT 'Index cho việc tìm kiếm sinh nhật sắp tới'
) ENGINE=InnoDB COMMENT='Lưu trữ thông tin cơ bản về các nhân vật.';

CREATE TABLE swimsuits (
    id MEDIUMINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'ID tự tăng, khóa chính của swimsuit',
    character_id SMALLINT UNSIGNED NOT NULL COMMENT 'Khóa ngoại, liên kết đến nhân vật sở hữu',
    unique_key VARCHAR(150) NOT NULL UNIQUE COMMENT 'Khóa định danh dạng text, không đổi',
    name_jp VARCHAR(255) NOT NULL COMMENT 'Tên swimsuit (tiếng Nhật)',
    name_en VARCHAR(255) NOT NULL COMMENT 'Tên swimsuit (tiếng Anh)',
    name_cn VARCHAR(255) NOT NULL COMMENT 'Tên swimsuit (tiếng Trung Giản)',
    name_tw VARCHAR(255) NOT NULL COMMENT 'Tên swimsuit (tiếng Trung Phồn)',
    name_kr VARCHAR(255) NOT NULL COMMENT 'Tên swimsuit (tiếng Hàn)',
    description_en TEXT COMMENT 'Mô tả swimsuit (tiếng Anh)',
    rarity ENUM('N','R','SR','SSR', 'SSR+') NOT NULL COMMENT 'Độ hiếm',
    suit_type ENUM('POW', 'TEC', 'STM', 'APL', 'N/A') NOT NULL COMMENT 'Loại chỉ số chính',
    total_stats_awakened SMALLINT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Tổng chỉ số sau khi đã thức tỉnh hoàn toàn',
    has_malfunction BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Có hiệu ứng Malfunction không',
    is_limited BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Là swimsuit giới hạn thời gian hay không',
    release_date_gl DATE COMMENT 'Ngày ra mắt trên server Quốc tế (Global)',
    FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
    INDEX idx_char_rarity_type (character_id, rarity, suit_type) COMMENT 'Index phức hợp cho bộ lọc mạnh mẽ',
    INDEX idx_stats_awakened (total_stats_awakened DESC) COMMENT 'Tối ưu cho việc sắp xếp theo chỉ số'
) ENGINE=InnoDB COMMENT='Thư viện đồ bơi, phục vụ trang SwimsuitPage.';

CREATE TABLE skills (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'ID tự tăng, khóa chính của kỹ năng',
    unique_key VARCHAR(120) NOT NULL UNIQUE COMMENT 'Khóa định danh dạng text, không đổi',
    name_jp VARCHAR(150) NOT NULL COMMENT 'Tên kỹ năng (tiếng Nhật)',
    name_en VARCHAR(150) NOT NULL COMMENT 'Tên kỹ năng (tiếng Anh)',
    name_cn VARCHAR(150) NOT NULL COMMENT 'Tên kỹ năng (tiếng Trung Giản)',
    name_tw VARCHAR(150) NOT NULL COMMENT 'Tên kỹ năng (tiếng Trung Phồn)',
    name_kr VARCHAR(150) NOT NULL COMMENT 'Tên kỹ năng (tiếng Hàn)',
    description_en TEXT COMMENT 'Mô tả hiệu ứng kỹ năng (tiếng Anh)',
    skill_category ENUM('ACTIVE', 'PASSIVE', 'POTENTIAL') NOT NULL COMMENT 'Phân loại kỹ năng',
    effect_type VARCHAR(50) COMMENT 'Loại hiệu ứng (e.g., "POW_UP")',
    INDEX idx_skill_category (skill_category) COMMENT 'Tối ưu cho việc lọc kỹ năng'
) ENGINE=InnoDB COMMENT='Thư viện kỹ năng, phục vụ trang SkillsPage.';

CREATE TABLE items (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'ID tự tăng, khóa chính của vật phẩm',
    unique_key VARCHAR(120) NOT NULL UNIQUE COMMENT 'Khóa định danh dạng text, không đổi',
    name_jp VARCHAR(150) NOT NULL COMMENT 'Tên vật phẩm (tiếng Nhật)',
    name_en VARCHAR(150) NOT NULL COMMENT 'Tên vật phẩm (tiếng Anh)',
    name_cn VARCHAR(150) NOT NULL COMMENT 'Tên vật phẩm (tiếng Trung Giản)',
    name_tw VARCHAR(150) NOT NULL COMMENT 'Tên vật phẩm (tiếng Trung Phồn)',
    name_kr VARCHAR(150) NOT NULL COMMENT 'Tên vật phẩm (tiếng Hàn)',
    description_en TEXT COMMENT 'Mô tả vật phẩm (tiếng Anh)',
    source_description_en TEXT COMMENT 'Mô tả nguồn gốc vật phẩm (tiếng Anh)',
    item_category ENUM('CURRENCY', 'UPGRADE_MATERIAL', 'CONSUMABLE', 'GIFT', 'ACCESSORY', 'FURNITURE', 'SPECIAL') NOT NULL COMMENT 'Phân loại nhóm vật phẩm chính',
    rarity ENUM('N','R','SR','SSR') NOT NULL COMMENT 'Độ hiếm',
    icon_url VARCHAR(255) COMMENT 'URL đến hình ảnh icon',
    INDEX idx_item_category (item_category) COMMENT 'Tối ưu cho việc lọc vật phẩm'
) ENGINE=InnoDB COMMENT='Bảng tổng hợp tất cả vật phẩm, phục vụ nhiều trang.';

CREATE TABLE bromides (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'ID tự tăng, khóa chính của bromide',
    unique_key VARCHAR(120) NOT NULL UNIQUE COMMENT 'Khóa định danh dạng text, không đổi',
    name_jp VARCHAR(150) NOT NULL COMMENT 'Tên bromide (tiếng Nhật)',
    name_en VARCHAR(150) NOT NULL COMMENT 'Tên bromide (tiếng Anh)',
    name_cn VARCHAR(150) NOT NULL COMMENT 'Tên bromide (tiếng Trung Giản)',
    name_tw VARCHAR(150) NOT NULL COMMENT 'Tên bromide (tiếng Trung Phồn)',
    name_kr VARCHAR(150) NOT NULL COMMENT 'Tên bromide (tiếng Hàn)',
    bromide_type ENUM('DECO', 'OWNER') NOT NULL DEFAULT 'DECO' COMMENT 'Loại bromide',
    rarity ENUM('R','SR','SSR') NOT NULL COMMENT 'Độ hiếm',
    skill_id INT UNSIGNED NULL COMMENT 'Khóa ngoại, liên kết đến kỹ năng đi kèm',
    art_url VARCHAR(255) COMMENT 'URL đến hình ảnh đầy đủ',
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE SET NULL,
    INDEX idx_bromide_type (bromide_type) COMMENT 'Tối ưu cho trang DecorateBromidePage'
) ENGINE=InnoDB COMMENT='Dữ liệu Deco-Bromide, phục vụ trang DecorateBromidePage.';

CREATE TABLE episodes (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'ID tự tăng, khóa chính của tập truyện',
    unique_key VARCHAR(200) NOT NULL UNIQUE COMMENT 'Khóa định danh dạng text, không đổi',
    title_jp VARCHAR(255) NOT NULL COMMENT 'Tiêu đề tập truyện (tiếng Nhật)',
    title_en VARCHAR(255) NOT NULL COMMENT 'Tiêu đề tập truyện (tiếng Anh)',
    title_cn VARCHAR(255) NOT NULL COMMENT 'Tiêu đề tập truyện (tiếng Trung Giản)',
    title_tw VARCHAR(255) NOT NULL COMMENT 'Tiêu đề tập truyện (tiếng Trung Phồn)',
    title_kr VARCHAR(255) NOT NULL COMMENT 'Tiêu đề tập truyện (tiếng Hàn)',
    unlock_condition_en TEXT COMMENT 'Điều kiện mở khóa (tiếng Anh)',
    episode_type ENUM('MAIN', 'CHARACTER', 'EVENT', 'SWIMSUIT', 'ITEM') NOT NULL COMMENT 'Loại cốt truyện',
    related_entity_type VARCHAR(64) COMMENT 'Tên bảng của thực thể liên quan',
    related_entity_id INT UNSIGNED COMMENT 'ID của thực thể liên quan',
    INDEX idx_episode_type_entity (episode_type, related_entity_type, related_entity_id) COMMENT 'Tối ưu lọc truyện'
) ENGINE=InnoDB COMMENT='Dữ liệu các tập cốt truyện, phục vụ trang MemoriesPage.';


-- ============================================================================
-- 2. CÁC BẢNG NỘI DUNG & SỰ KIỆN (Content & Event Tables)
-- ============================================================================

CREATE TABLE events (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'ID tự tăng, khóa chính của sự kiện',
    unique_key VARCHAR(150) NOT NULL UNIQUE COMMENT 'Khóa định danh dạng text, không đổi',
    name_jp VARCHAR(255) NOT NULL COMMENT 'Tên sự kiện (tiếng Nhật)',
    name_en VARCHAR(255) NOT NULL COMMENT 'Tên sự kiện (tiếng Anh)',
    name_cn VARCHAR(255) NOT NULL COMMENT 'Tên sự kiện (tiếng Trung Giản)',
    name_tw VARCHAR(255) NOT NULL COMMENT 'Tên sự kiện (tiếng Trung Phồn)',
    name_kr VARCHAR(255) NOT NULL COMMENT 'Tên sự kiện (tiếng Hàn)',
    type ENUM('FESTIVAL_RANKING','FESTIVAL_CUMULATIVE','TOWER','ROCK_CLIMBING', 'BUTT_BATTLE', 'LOGIN_BONUS', 'STORY') NOT NULL COMMENT 'Loại hình gameplay',
    start_date DATETIME NOT NULL COMMENT 'Thời gian bắt đầu',
    end_date DATETIME NOT NULL COMMENT 'Thời gian kết thúc',
    is_active BOOLEAN GENERATED ALWAYS AS (NOW() BETWEEN start_date AND end_date) STORED COMMENT 'Tự động tính sự kiện có đang hoạt động không',
    INDEX idx_active_date (is_active, start_date DESC) COMMENT 'Tối ưu cho việc lấy sự kiện đang hoạt động'
) ENGINE=InnoDB COMMENT='Dữ liệu sự kiện, phục vụ trang FestivalPage/EventsPage.';

CREATE TABLE gachas (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'ID tự tăng, khóa chính của gacha',
    unique_key VARCHAR(150) NOT NULL UNIQUE COMMENT 'Khóa định danh dạng text, không đổi',
    name_jp VARCHAR(255) NOT NULL COMMENT 'Tên gacha (tiếng Nhật)',
    name_en VARCHAR(255) NOT NULL COMMENT 'Tên gacha (tiếng Anh)',
    name_cn VARCHAR(255) NOT NULL COMMENT 'Tên gacha (tiếng Trung Giản)',
    name_tw VARCHAR(255) NOT NULL COMMENT 'Tên gacha (tiếng Trung Phồn)',
    name_kr VARCHAR(255) NOT NULL COMMENT 'Tên gacha (tiếng Hàn)',
    gacha_subtype ENUM('TRENDY', 'NOSTALGIC', 'BIRTHDAY', 'ANNIVERSARY', 'PAID', 'FREE', 'ETC') NOT NULL COMMENT 'Phân loại chi tiết',
    start_date DATETIME NOT NULL COMMENT 'Thời gian bắt đầu',
    end_date DATETIME NOT NULL COMMENT 'Thời gian kết thúc',
    INDEX idx_dates (start_date DESC) COMMENT 'Tối ưu cho việc lấy gacha mới nhất'
) ENGINE=InnoDB COMMENT='Dữ liệu các banner Gacha, phục vụ trang GachaPage.';

CREATE TABLE shop_listings (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'ID tự tăng, khóa chính',
    shop_type ENUM('EVENT', 'VIP', 'GENERAL', 'CURRENCY') NOT NULL COMMENT 'Loại cửa hàng',
    item_id INT UNSIGNED NOT NULL COMMENT 'Vật phẩm được bán',
    cost_currency_item_id INT UNSIGNED NOT NULL COMMENT 'Loại tiền tệ dùng để mua',
    cost_amount INT UNSIGNED NOT NULL COMMENT 'Số tiền cần trả',
    start_date DATETIME COMMENT 'Ngày bắt đầu bán',
    end_date DATETIME COMMENT 'Ngày kết thúc bán',
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
    FOREIGN KEY (cost_currency_item_id) REFERENCES items(id) ON DELETE CASCADE,
    INDEX idx_shop_type_dates (shop_type, start_date, end_date) COMMENT 'Tối ưu lọc shop theo loại và thời gian'
) ENGINE=InnoDB COMMENT='Dữ liệu các vật phẩm trong cửa hàng game, phục vụ ShopPage.';

CREATE TABLE documents (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'ID tự tăng, khóa chính của tài liệu',
    unique_key VARCHAR(150) NOT NULL UNIQUE COMMENT 'Khóa định danh dạng text, dùng cho URL',
    title_en VARCHAR(255) NOT NULL COMMENT 'Tiêu đề chính của tài liệu (tiếng Anh)',
    summary_en TEXT COMMENT 'Tóm tắt của tài liệu (tiếng Anh)',
    -- Cột duy nhất lưu nội dung từ Tiptap
    content_json_en JSON NULL COMMENT 'Nội dung tài liệu tiếng Anh, lưu dưới dạng JSON từ Tiptap',
    is_published BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Cờ cho phép soạn thảo trước',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian tạo',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Thời gian cập nhật lần cuối',
    INDEX idx_published_key (is_published, unique_key) COMMENT 'Tối ưu cho việc truy cập các tài liệu đã xuất bản'
) ENGINE=InnoDB COMMENT='Quản lý các tài liệu, bài viết hướng dẫn.';

-- ============================================================================
-- 3. CÁC BẢNG LIÊN KẾT (Linking Tables)
-- ============================================================================

CREATE TABLE swimsuit_skills (
    swimsuit_id MEDIUMINT UNSIGNED NOT NULL COMMENT 'Khóa ngoại, liên kết đến swimsuit',
    skill_id INT UNSIGNED NOT NULL COMMENT 'Khóa ngoại, liên kết đến kỹ năng',
    skill_slot ENUM('ACTIVE', 'PASSIVE_1', 'PASSIVE_2', 'POTENTIAL_1', 'POTENTIAL_2', 'POTENTIAL_3', 'POTENTIAL_4') NOT NULL COMMENT 'Vị trí của kỹ năng trên swimsuit',
    PRIMARY KEY (swimsuit_id, skill_slot),
    FOREIGN KEY (swimsuit_id) REFERENCES swimsuits(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Liên kết Swimsuit và Skill.';

CREATE TABLE gacha_pools (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'ID tự tăng, khóa chính',
    gacha_id INT UNSIGNED NOT NULL COMMENT 'Khóa ngoại, cho biết mục này thuộc gacha nào',
    pool_item_type ENUM('SWIMSUIT', 'BROMIDE', 'ITEM') NOT NULL COMMENT 'Loại vật phẩm trong pool',
    item_id INT UNSIGNED NOT NULL COMMENT 'ID của vật phẩm tương ứng (ID từ bảng swimsuits, bromides hoặc items)',
    drop_rate DECIMAL(6,4) NOT NULL COMMENT 'Tỷ lệ rớt',
    is_featured BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Là vật phẩm được rate-up không',
    FOREIGN KEY (gacha_id) REFERENCES gachas(id) ON DELETE CASCADE,
    INDEX idx_gacha_id (gacha_id) COMMENT 'Tối ưu lấy toàn bộ pool của một gacha'
) ENGINE=InnoDB COMMENT='Pool vật phẩm của từng Gacha.';

-- ============================================================================
-- 4. VIEWS (Bảng Ảo) - Tối Ưu Hóa Truy Vấn Cho HomePage
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

COMMENT ON VIEW v_timeline IS 'Bảng ảo tạo dòng thời gian cập nhật cho HomePage.';