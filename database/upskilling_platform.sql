-- =====================================================================
-- Platform Upskilling & Portofolio Reviu Berbasis AI
-- Target: Fresh Graduate & Anak Magang
-- =====================================================================

DROP DATABASE IF EXISTS upskilling_platform;
CREATE DATABASE upskilling_platform
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE upskilling_platform;

-- ---------------------------------------------------------------------
-- 1. MASTER DATA
-- ---------------------------------------------------------------------

-- Peran target (Data Analyst, UI/UX Designer, Digital Marketing, dst.)
CREATE TABLE target_roles (
  role_id       INT UNSIGNED NOT NULL AUTO_INCREMENT,
  role_name     VARCHAR(100) NOT NULL,
  field         ENUM('digital','bisnis','kreatif','teknologi','lainnya') NOT NULL DEFAULT 'digital',
  description   TEXT NULL,
  is_active     TINYINT(1) NOT NULL DEFAULT 1,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (role_id),
  UNIQUE KEY uq_role_name (role_name)
) ENGINE=InnoDB;

-- Katalog skill
CREATE TABLE skills (
  skill_id      INT UNSIGNED NOT NULL AUTO_INCREMENT,
  skill_name    VARCHAR(100) NOT NULL,
  category      ENUM('technical','soft','tools','domain') NOT NULL DEFAULT 'technical',
  description   TEXT NULL,
  PRIMARY KEY (skill_id),
  UNIQUE KEY uq_skill_name (skill_name)
) ENGINE=InnoDB;

-- Kebutuhan skill per peran (dasar analisis skill gap)
CREATE TABLE role_skills (
  role_id         INT UNSIGNED NOT NULL,
  skill_id        INT UNSIGNED NOT NULL,
  required_level  TINYINT UNSIGNED NOT NULL DEFAULT 3,   -- 1-5
  importance      ENUM('wajib','penting','nilai_tambah') NOT NULL DEFAULT 'penting',
  PRIMARY KEY (role_id, skill_id),
  CONSTRAINT fk_rs_role  FOREIGN KEY (role_id)  REFERENCES target_roles(role_id) ON DELETE CASCADE,
  CONSTRAINT fk_rs_skill FOREIGN KEY (skill_id) REFERENCES skills(skill_id)      ON DELETE CASCADE,
  CONSTRAINT chk_rs_level CHECK (required_level BETWEEN 1 AND 5)
) ENGINE=InnoDB;

-- Rubrik reviu (kejelasan, bukti dampak, relevansi, tampilan, dst.)
CREATE TABLE review_criteria (
  criteria_id   INT UNSIGNED NOT NULL AUTO_INCREMENT,
  criteria_name VARCHAR(80) NOT NULL,
  description   TEXT NULL,
  weight        DECIMAL(4,2) NOT NULL DEFAULT 1.00,
  PRIMARY KEY (criteria_id),
  UNIQUE KEY uq_criteria_name (criteria_name)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 2. PENGGUNA
-- ---------------------------------------------------------------------

CREATE TABLE users (
  user_id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  full_name       VARCHAR(120) NOT NULL,
  email           VARCHAR(150) NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  user_type       ENUM('fresh_graduate','anak_magang','praktisi','admin') NOT NULL DEFAULT 'fresh_graduate',
  university      VARCHAR(150) NULL,
  major           VARCHAR(120) NULL,
  graduation_year YEAR NULL,
  target_role_id  INT UNSIGNED NULL,
  is_active       TINYINT(1) NOT NULL DEFAULT 1,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  UNIQUE KEY uq_user_email (email),
  KEY idx_user_type (user_type),
  CONSTRAINT fk_user_role FOREIGN KEY (target_role_id) REFERENCES target_roles(role_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Skill yang sudah dimiliki pengguna
CREATE TABLE user_skills (
  user_id        BIGINT UNSIGNED NOT NULL,
  skill_id       INT UNSIGNED NOT NULL,
  current_level  TINYINT UNSIGNED NOT NULL DEFAULT 1,    -- 1-5
  source         ENUM('self_declared','ai_detected','verified') NOT NULL DEFAULT 'self_declared',
  updated_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, skill_id),
  CONSTRAINT fk_us_user  FOREIGN KEY (user_id)  REFERENCES users(user_id)   ON DELETE CASCADE,
  CONSTRAINT fk_us_skill FOREIGN KEY (skill_id) REFERENCES skills(skill_id) ON DELETE CASCADE,
  CONSTRAINT chk_us_level CHECK (current_level BETWEEN 1 AND 5)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 3. PORTOFOLIO & REVIU AI
-- ---------------------------------------------------------------------

CREATE TABLE portfolios (
  portfolio_id   BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id        BIGINT UNSIGNED NOT NULL,
  role_id        INT UNSIGNED NOT NULL,                  -- peran target saat diunggah
  title          VARCHAR(150) NOT NULL,
  source_type    ENUM('file','link') NOT NULL,
  file_path      VARCHAR(255) NULL,
  external_url   VARCHAR(500) NULL,
  extracted_text LONGTEXT NULL,                          -- hasil ekstraksi untuk dianalisis AI
  version_no     INT UNSIGNED NOT NULL DEFAULT 1,
  parent_id      BIGINT UNSIGNED NULL,                   -- versi sebelumnya (untuk reviu ulang)
  uploaded_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (portfolio_id),
  KEY idx_pf_user (user_id),
  CONSTRAINT fk_pf_user   FOREIGN KEY (user_id)   REFERENCES users(user_id)         ON DELETE CASCADE,
  CONSTRAINT fk_pf_role   FOREIGN KEY (role_id)   REFERENCES target_roles(role_id),
  CONSTRAINT fk_pf_parent FOREIGN KEY (parent_id) REFERENCES portfolios(portfolio_id) ON DELETE SET NULL,
  CONSTRAINT chk_pf_source CHECK (
    (source_type = 'file' AND file_path IS NOT NULL) OR
    (source_type = 'link' AND external_url IS NOT NULL)
  )
) ENGINE=InnoDB;

CREATE TABLE ai_reviews (
  review_id      BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  portfolio_id   BIGINT UNSIGNED NOT NULL,
  model_name     VARCHAR(80) NULL,
  overall_score  DECIMAL(5,2) NOT NULL,                  -- 0-100
  summary        TEXT NULL,
  status         ENUM('queued','processing','done','failed') NOT NULL DEFAULT 'queued',
  created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (review_id),
  KEY idx_rv_portfolio (portfolio_id),
  CONSTRAINT fk_rv_portfolio FOREIGN KEY (portfolio_id) REFERENCES portfolios(portfolio_id) ON DELETE CASCADE,
  CONSTRAINT chk_rv_score CHECK (overall_score BETWEEN 0 AND 100)
) ENGINE=InnoDB;

-- Skor per aspek
CREATE TABLE review_scores (
  review_id    BIGINT UNSIGNED NOT NULL,
  criteria_id  INT UNSIGNED NOT NULL,
  score        DECIMAL(5,2) NOT NULL,                    -- 0-100
  explanation  TEXT NULL,                                -- penjelasan skor (agar mudah dipahami)
  PRIMARY KEY (review_id, criteria_id),
  CONSTRAINT fk_sc_review   FOREIGN KEY (review_id)   REFERENCES ai_reviews(review_id)        ON DELETE CASCADE,
  CONSTRAINT fk_sc_criteria FOREIGN KEY (criteria_id) REFERENCES review_criteria(criteria_id),
  CONSTRAINT chk_sc_score CHECK (score BETWEEN 0 AND 100)
) ENGINE=InnoDB;

-- Saran perbaikan spesifik (dengan contoh before/after)
CREATE TABLE review_suggestions (
  suggestion_id  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  review_id      BIGINT UNSIGNED NOT NULL,
  criteria_id    INT UNSIGNED NULL,
  section_ref    VARCHAR(120) NULL,                      -- bagian portofolio yang dimaksud
  suggestion     TEXT NOT NULL,
  example_before TEXT NULL,
  example_after  TEXT NULL,
  priority       ENUM('tinggi','sedang','rendah') NOT NULL DEFAULT 'sedang',
  is_done        TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (suggestion_id),
  KEY idx_sg_review (review_id),
  CONSTRAINT fk_sg_review   FOREIGN KEY (review_id)   REFERENCES ai_reviews(review_id) ON DELETE CASCADE,
  CONSTRAINT fk_sg_criteria FOREIGN KEY (criteria_id) REFERENCES review_criteria(criteria_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 4. SKILL GAP & ROADMAP
-- ---------------------------------------------------------------------

CREATE TABLE skill_gaps (
  gap_id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  review_id       BIGINT UNSIGNED NOT NULL,
  skill_id        INT UNSIGNED NOT NULL,
  current_level   TINYINT UNSIGNED NOT NULL DEFAULT 0,
  required_level  TINYINT UNSIGNED NOT NULL,
  gap_size        TINYINT GENERATED ALWAYS AS (GREATEST(CAST(required_level AS SIGNED) - CAST(current_level AS SIGNED), 0)) STORED,
  PRIMARY KEY (gap_id),
  UNIQUE KEY uq_gap (review_id, skill_id),
  CONSTRAINT fk_gap_review FOREIGN KEY (review_id) REFERENCES ai_reviews(review_id) ON DELETE CASCADE,
  CONSTRAINT fk_gap_skill  FOREIGN KEY (skill_id)  REFERENCES skills(skill_id)
) ENGINE=InnoDB;

CREATE TABLE mini_projects (
  project_id    INT UNSIGNED NOT NULL AUTO_INCREMENT,
  skill_id      INT UNSIGNED NOT NULL,
  role_id       INT UNSIGNED NULL,
  title         VARCHAR(150) NOT NULL,
  brief         TEXT NOT NULL,
  difficulty    ENUM('pemula','menengah','lanjut') NOT NULL DEFAULT 'pemula',
  est_hours     SMALLINT UNSIGNED NULL,
  provider      VARCHAR(120) NULL,                       -- perusahaan mitra
  PRIMARY KEY (project_id),
  CONSTRAINT fk_mp_skill FOREIGN KEY (skill_id) REFERENCES skills(skill_id),
  CONSTRAINT fk_mp_role  FOREIGN KEY (role_id)  REFERENCES target_roles(role_id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE roadmaps (
  roadmap_id   BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id      BIGINT UNSIGNED NOT NULL,
  review_id    BIGINT UNSIGNED NULL,
  duration_days SMALLINT UNSIGNED NOT NULL DEFAULT 30,    -- 30/60/90
  start_date   DATE NULL,
  status       ENUM('aktif','selesai','dibatalkan') NOT NULL DEFAULT 'aktif',
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (roadmap_id),
  KEY idx_rm_user (user_id),
  CONSTRAINT fk_rm_user   FOREIGN KEY (user_id)   REFERENCES users(user_id)       ON DELETE CASCADE,
  CONSTRAINT fk_rm_review FOREIGN KEY (review_id) REFERENCES ai_reviews(review_id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE roadmap_items (
  item_id      BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  roadmap_id   BIGINT UNSIGNED NOT NULL,
  skill_id     INT UNSIGNED NOT NULL,
  project_id   INT UNSIGNED NULL,
  week_no      TINYINT UNSIGNED NOT NULL,
  title        VARCHAR(150) NOT NULL,
  resource_url VARCHAR(500) NULL,
  status       ENUM('belum','berjalan','selesai') NOT NULL DEFAULT 'belum',
  completed_at DATETIME NULL,
  PRIMARY KEY (item_id),
  KEY idx_ri_roadmap (roadmap_id),
  CONSTRAINT fk_ri_roadmap FOREIGN KEY (roadmap_id) REFERENCES roadmaps(roadmap_id) ON DELETE CASCADE,
  CONSTRAINT fk_ri_skill   FOREIGN KEY (skill_id)   REFERENCES skills(skill_id),
  CONSTRAINT fk_ri_project FOREIGN KEY (project_id) REFERENCES mini_projects(project_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 5. REVIU PRAKTISI (opsional, AI + manusia)
-- ---------------------------------------------------------------------

CREATE TABLE practitioner_reviews (
  pr_id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  portfolio_id  BIGINT UNSIGNED NOT NULL,
  reviewer_id   BIGINT UNSIGNED NOT NULL,                -- users.user_type = 'praktisi'
  rating        TINYINT UNSIGNED NULL,                   -- 1-5
  comments      TEXT NULL,
  status        ENUM('diminta','dikerjakan','selesai') NOT NULL DEFAULT 'diminta',
  requested_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at  DATETIME NULL,
  PRIMARY KEY (pr_id),
  CONSTRAINT fk_pr_portfolio FOREIGN KEY (portfolio_id) REFERENCES portfolios(portfolio_id) ON DELETE CASCADE,
  CONSTRAINT fk_pr_reviewer  FOREIGN KEY (reviewer_id)  REFERENCES users(user_id),
  CONSTRAINT chk_pr_rating CHECK (rating IS NULL OR rating BETWEEN 1 AND 5)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 6. TEST & FEEDBACK PENGGUNA (untuk tahap TEST Design Thinking)
-- ---------------------------------------------------------------------

CREATE TABLE user_feedback (
  feedback_id     BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id         BIGINT UNSIGNED NOT NULL,
  review_id       BIGINT UNSIGNED NULL,
  tested_feature  ENUM('upload','hasil_reviu','skill_gap','roadmap','lainnya') NOT NULL,
  observed_issue  TEXT NULL,                             -- di mana pengguna berhenti / bingung
  most_helpful    TEXT NULL,
  most_difficult  TEXT NULL,
  would_change    TEXT NULL,
  ai_accuracy     TINYINT UNSIGNED NULL,                 -- 1-5: apakah feedback AI terasa akurat
  feedback_type   ENUM('umum','spesifik','actionable') NOT NULL DEFAULT 'spesifik',
  improvement_priority ENUM('tinggi','sedang','rendah') NOT NULL DEFAULT 'sedang',
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (feedback_id),
  CONSTRAINT fk_fb_user   FOREIGN KEY (user_id)   REFERENCES users(user_id)       ON DELETE CASCADE,
  CONSTRAINT fk_fb_review FOREIGN KEY (review_id) REFERENCES ai_reviews(review_id) ON DELETE SET NULL,
  CONSTRAINT chk_fb_acc CHECK (ai_accuracy IS NULL OR ai_accuracy BETWEEN 1 AND 5)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 7. VIEW: ringkasan progres reviu per pengguna
-- ---------------------------------------------------------------------

CREATE VIEW v_user_progress AS
SELECT
  u.user_id,
  u.full_name,
  tr.role_name AS target_role,
  COUNT(DISTINCT p.portfolio_id)        AS total_portfolio_versions,
  MIN(r.overall_score)                  AS first_score,
  MAX(r.overall_score)                  AS best_score,
  (SELECT r2.overall_score
     FROM ai_reviews r2
     JOIN portfolios p2 ON p2.portfolio_id = r2.portfolio_id
    WHERE p2.user_id = u.user_id AND r2.status = 'done'
    ORDER BY r2.created_at DESC LIMIT 1) AS latest_score
FROM users u
LEFT JOIN target_roles tr ON tr.role_id = u.target_role_id
LEFT JOIN portfolios p    ON p.user_id = u.user_id
LEFT JOIN ai_reviews r    ON r.portfolio_id = p.portfolio_id AND r.status = 'done'
WHERE u.user_type IN ('fresh_graduate','anak_magang')
GROUP BY u.user_id, u.full_name, tr.role_name;

-- ---------------------------------------------------------------------
-- 8. SEED DATA CONTOH
-- ---------------------------------------------------------------------

INSERT INTO target_roles (role_name, field, description) VALUES
 ('Data Analyst',        'teknologi', 'Menganalisis data untuk mendukung keputusan bisnis'),
 ('UI/UX Designer',      'kreatif',   'Merancang antarmuka dan pengalaman pengguna'),
 ('Digital Marketing',   'bisnis',    'Mengelola kampanye dan konten pemasaran digital'),
 ('Web Developer',       'teknologi', 'Membangun aplikasi web');

INSERT INTO skills (skill_name, category) VALUES
 ('SQL',                  'technical'),
 ('Excel / Spreadsheet',  'tools'),
 ('Data Visualization',   'technical'),
 ('Python',               'technical'),
 ('Figma',                'tools'),
 ('User Research',        'domain'),
 ('SEO & Content',        'domain'),
 ('Komunikasi',           'soft'),
 ('Storytelling Data',    'soft');

INSERT INTO role_skills (role_id, skill_id, required_level, importance) VALUES
 (1, 1, 4, 'wajib'), (1, 2, 4, 'wajib'), (1, 3, 4, 'wajib'),
 (1, 4, 3, 'penting'), (1, 9, 3, 'penting'),
 (2, 5, 4, 'wajib'), (2, 6, 4, 'wajib'), (2, 8, 3, 'penting'),
 (3, 7, 4, 'wajib'), (3, 8, 3, 'penting');

INSERT INTO review_criteria (criteria_name, description, weight) VALUES
 ('Kejelasan',      'Seberapa jelas proyek, peran, dan hasil dijelaskan', 1.00),
 ('Bukti Dampak',   'Ada angka/hasil terukur dari pekerjaan',              1.50),
 ('Relevansi',      'Kecocokan dengan peran target',                       1.50),
 ('Tampilan',       'Kerapian, struktur, dan visual portofolio',           0.75);

-- Contoh pengguna & praktisi (password_hash hanya placeholder)
INSERT INTO users (full_name, email, password_hash, user_type, university, major, graduation_year, target_role_id) VALUES
 ('Contoh Fresh Graduate', 'fresh@example.com',    'HASH_PLACEHOLDER', 'fresh_graduate', 'Universitas Contoh', 'Sistem Informasi', 2026, 1),
 ('Contoh Praktisi',       'praktisi@example.com', 'HASH_PLACEHOLDER', 'praktisi',       NULL, NULL, NULL, NULL);

SHOW TABLES;                          -- harus ada 16 tabel + 1 view
SELECT * FROM target_roles;           -- 4 peran
SELECT * FROM skills;                 -- 9 skill
SELECT * FROM users;

-- Kebutuhan skill per peran
SELECT tr.role_name, s.skill_name, rs.required_level, rs.importance
FROM role_skills rs
JOIN target_roles tr ON tr.role_id = rs.role_id
JOIN skills s ON s.skill_id = rs.skill_id
ORDER BY tr.role_name;

SELECT * FROM v_user_progress;        -- ringkasan progres pengguna

DESCRIBE v_user_progress;