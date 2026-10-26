-- =====================================================================
-- MIGRASI 02: dari backup 23 Oktober ke skema terbaru SkillBridge
--
-- Dijalankan pada database hasil pemulihan backup (bernama "pulih"):
--   mysql pulih < database/migrasi_02_versi_terbaru.sql
--
-- Kondisi awal (backup 23 Okt): 18 tabel + view v_user_progress,
-- sudah memuat password_resets, review_criteria_weights, review_scores.weight,
-- dan gap_size yang sudah diperbaiki.
-- Kondisi akhir: 15 tabel + 3 prosedur + 1 event.
--
-- Skrip berhenti pada error pertama. Jika berhenti di tengah,
-- JANGAN dijalankan ulang: pulihkan dulu dari salinan pengaman.
-- =====================================================================

SET NAMES utf8mb4;

-- ---------------------------------------------------------------------
-- 1. Hapus yang tidak dipakai (perapian database)
-- ---------------------------------------------------------------------
ALTER TABLE roadmap_items DROP FOREIGN KEY fk_ri_project;
ALTER TABLE roadmap_items DROP COLUMN project_id;

DROP VIEW  IF EXISTS v_user_progress;
DROP TABLE IF EXISTS mini_projects;
DROP TABLE IF EXISTS practitioner_reviews;
DROP TABLE IF EXISTS user_skills;

-- ---------------------------------------------------------------------
-- 2. Index dan constraint
-- ---------------------------------------------------------------------
ALTER TABLE user_feedback
  ADD UNIQUE KEY uq_feedback_user_review (user_id, review_id, tested_feature);

ALTER TABLE ai_reviews
  ADD INDEX idx_rv_portfolio_status (portfolio_id, status, created_at);

ALTER TABLE password_resets
  ADD INDEX idx_reset_exp (expires_at);

-- ---------------------------------------------------------------------
-- 3. Kolom baru
-- ---------------------------------------------------------------------
-- Foto profil
ALTER TABLE users
  ADD COLUMN avatar_path VARCHAR(255) NULL AFTER target_role_id;

-- Peran buatan pengguna
ALTER TABLE target_roles
  ADD COLUMN is_custom  TINYINT(1) NOT NULL DEFAULT 0 AFTER is_active,
  ADD COLUMN created_by BIGINT UNSIGNED NULL AFTER is_custom,
  ADD CONSTRAINT fk_role_creator FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL;

-- Retensi data: penanda teks portofolio yang sudah dihapus otomatis
ALTER TABLE portfolios
  ADD COLUMN text_purged_at DATETIME NULL;

-- ---------------------------------------------------------------------
-- 4. Skill dan peran baru
-- ---------------------------------------------------------------------
INSERT IGNORE INTO skills (skill_name, category) VALUES
 ('Problem Solving','soft'), ('Kerja Tim','soft'), ('Manajemen Waktu','soft'),
 ('Penulisan Profesional','soft'), ('Adaptabilitas','soft'), ('Negosiasi','soft'),
 ('Analisis Kebutuhan Bisnis','domain'), ('Dokumentasi Proses','domain'),
 ('Manajemen Proyek','domain'), ('Manajemen Risiko','domain'), ('Media Sosial','domain'),
 ('Akuntansi Dasar','domain'), ('Laporan Keuangan','domain'),
 ('Rekrutmen & Seleksi','domain'), ('Administrasi SDM','domain'), ('Pengetahuan Produk','domain'),
 ('Desain Grafis','technical'), ('Tipografi & Layout','technical'), ('Pengeditan Video','technical'),
 ('Pengujian Perangkat Lunak','technical'), ('Penulisan Test Case','technical'),
 ('CRM','tools');

INSERT IGNORE INTO target_roles (role_name, field, description) VALUES
 ('Umum / Lintas Bidang','lainnya','Untuk semua bidang atau yang belum menentukan peran. Dinilai dari kemampuan dasar yang dicari hampir semua perusahaan.'),
 ('Business Analyst','bisnis','Menerjemahkan kebutuhan bisnis menjadi analisis dan rekomendasi'),
 ('Project Manager','bisnis','Merencanakan, mengoordinasi, dan menyelesaikan proyek tepat waktu'),
 ('Graphic Designer','kreatif','Membuat desain visual untuk media cetak dan digital'),
 ('Content Creator','kreatif','Membuat konten tulisan, visual, dan video untuk audiens'),
 ('Finance & Accounting','bisnis','Mengelola pencatatan dan pelaporan keuangan'),
 ('Human Resources','bisnis','Mengelola rekrutmen, administrasi, dan pengembangan karyawan'),
 ('Sales & Business Development','bisnis','Mencari dan mengembangkan peluang penjualan dan kemitraan'),
 ('QA Tester','teknologi','Menguji perangkat lunak agar bebas bug sebelum dirilis');

CREATE TEMPORARY TABLE tmp_rs (
  rn VARCHAR(100), sn VARCHAR(100), lvl TINYINT, imp VARCHAR(20)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO tmp_rs VALUES
 ('Umum / Lintas Bidang','Komunikasi',4,'wajib'), ('Umum / Lintas Bidang','Problem Solving',4,'wajib'),
 ('Umum / Lintas Bidang','Kerja Tim',3,'wajib'), ('Umum / Lintas Bidang','Penulisan Profesional',3,'penting'),
 ('Umum / Lintas Bidang','Manajemen Waktu',3,'penting'), ('Umum / Lintas Bidang','Excel / Spreadsheet',3,'penting'),
 ('Umum / Lintas Bidang','Adaptabilitas',3,'nilai_tambah'),

 ('Business Analyst','Analisis Kebutuhan Bisnis',4,'wajib'), ('Business Analyst','SQL',3,'wajib'),
 ('Business Analyst','Excel / Spreadsheet',4,'wajib'), ('Business Analyst','Data Visualization',3,'penting'),
 ('Business Analyst','Komunikasi',4,'penting'), ('Business Analyst','Dokumentasi Proses',3,'penting'),

 ('Project Manager','Manajemen Proyek',4,'wajib'), ('Project Manager','Komunikasi',4,'wajib'),
 ('Project Manager','Manajemen Waktu',4,'wajib'), ('Project Manager','Manajemen Risiko',3,'penting'),
 ('Project Manager','Kerja Tim',4,'penting'), ('Project Manager','Penulisan Profesional',3,'nilai_tambah'),

 ('Graphic Designer','Desain Grafis',4,'wajib'), ('Graphic Designer','Tipografi & Layout',4,'wajib'),
 ('Graphic Designer','Figma',3,'penting'), ('Graphic Designer','Komunikasi',3,'penting'),
 ('Graphic Designer','Pengeditan Video',2,'nilai_tambah'),

 ('Content Creator','Copywriting',4,'wajib'), ('Content Creator','Media Sosial',4,'wajib'),
 ('Content Creator','SEO & Content',3,'penting'), ('Content Creator','Desain Grafis',3,'penting'),
 ('Content Creator','Pengeditan Video',3,'penting'), ('Content Creator','Google Analytics',2,'nilai_tambah'),

 ('Finance & Accounting','Akuntansi Dasar',4,'wajib'), ('Finance & Accounting','Laporan Keuangan',4,'wajib'),
 ('Finance & Accounting','Excel / Spreadsheet',4,'wajib'), ('Finance & Accounting','Komunikasi',3,'penting'),
 ('Finance & Accounting','Penulisan Profesional',3,'nilai_tambah'),

 ('Human Resources','Rekrutmen & Seleksi',4,'wajib'), ('Human Resources','Administrasi SDM',4,'wajib'),
 ('Human Resources','Komunikasi',4,'wajib'), ('Human Resources','Penulisan Profesional',3,'penting'),
 ('Human Resources','Negosiasi',3,'penting'),

 ('Sales & Business Development','Negosiasi',4,'wajib'), ('Sales & Business Development','Komunikasi',4,'wajib'),
 ('Sales & Business Development','Pengetahuan Produk',3,'penting'), ('Sales & Business Development','CRM',3,'penting'),
 ('Sales & Business Development','Penulisan Profesional',3,'nilai_tambah'),

 ('QA Tester','Pengujian Perangkat Lunak',4,'wajib'), ('QA Tester','Penulisan Test Case',4,'wajib'),
 ('QA Tester','Dokumentasi Proses',3,'penting'), ('QA Tester','SQL',2,'penting'),
 ('QA Tester','Komunikasi',3,'penting');

INSERT IGNORE INTO role_skills (role_id, skill_id, required_level, importance)
SELECT r.role_id, s.skill_id, t.lvl, t.imp
FROM tmp_rs t
JOIN target_roles r ON r.role_name = t.rn
JOIN skills s ON s.skill_name = t.sn;

DROP TEMPORARY TABLE tmp_rs;

-- ---------------------------------------------------------------------
-- 5. Stored procedure dan event
-- ---------------------------------------------------------------------
DELIMITER $$

DROP PROCEDURE IF EXISTS sp_bersihkan_data$$
CREATE PROCEDURE sp_bersihkan_data()
BEGIN
  DECLARE v_hari  INT DEFAULT 180;
  DECLARE v_reset INT DEFAULT 0;
  DECLARE v_macet INT DEFAULT 0;
  DECLARE v_gagal INT DEFAULT 0;
  DECLARE v_teks  INT DEFAULT 0;

  DELETE FROM password_resets WHERE expires_at < NOW();
  SET v_reset = ROW_COUNT();

  UPDATE ai_reviews
     SET status = 'failed', summary = 'Reviu terhenti, silakan ulangi.'
   WHERE status = 'processing' AND created_at < (NOW() - INTERVAL 10 MINUTE);
  SET v_macet = ROW_COUNT();

  DELETE FROM ai_reviews
   WHERE status = 'failed' AND created_at < (NOW() - INTERVAL 7 DAY);
  SET v_gagal = ROW_COUNT();

  UPDATE portfolios p
     SET p.extracted_text = NULL, p.text_purged_at = NOW()
   WHERE p.extracted_text IS NOT NULL
     AND GREATEST(
           p.uploaded_at,
           COALESCE((SELECT MAX(r.created_at) FROM ai_reviews r WHERE r.portfolio_id = p.portfolio_id), p.uploaded_at)
         ) < (NOW() - INTERVAL v_hari DAY);
  SET v_teks = ROW_COUNT();

  SELECT v_reset AS token_reset_dihapus,
         v_macet AS reviu_macet_ditandai,
         v_gagal AS reviu_gagal_dihapus,
         v_teks  AS teks_portofolio_dihapus;
END$$

DROP PROCEDURE IF EXISTS sp_hapus_pengguna$$
CREATE PROCEDURE sp_hapus_pengguna(IN p_email VARCHAR(150))
BEGIN
  DECLARE v_id BIGINT UNSIGNED;
  SELECT user_id INTO v_id FROM users WHERE email = p_email;

  IF v_id IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Pengguna tidak ditemukan';
  END IF;

  DELETE FROM users WHERE user_id = v_id;
  SELECT CONCAT('Akun ', p_email, ' beserta seluruh datanya telah dihapus') AS hasil;
END$$

DROP PROCEDURE IF EXISTS sp_ringkasan_sistem$$
CREATE PROCEDURE sp_ringkasan_sistem()
BEGIN
  SELECT
    (SELECT COUNT(*) FROM users WHERE user_type IN ('fresh_graduate','anak_magang')) AS total_pengguna,
    (SELECT COUNT(*) FROM portfolios)                                               AS total_portofolio,
    (SELECT COUNT(*) FROM ai_reviews WHERE status = 'done')                         AS reviu_selesai,
    (SELECT COUNT(*) FROM ai_reviews WHERE status = 'failed')                       AS reviu_gagal,
    (SELECT ROUND(AVG(overall_score), 1) FROM ai_reviews WHERE status = 'done')    AS rata_rata_skor,
    (SELECT COUNT(*) FROM user_feedback)                                            AS total_feedback,
    (SELECT ROUND(AVG(ai_accuracy), 1) FROM user_feedback)                          AS rata_rata_akurasi_ai;
END$$

DELIMITER ;

DROP EVENT IF EXISTS ev_bersihkan_harian;
CREATE EVENT ev_bersihkan_harian
  ON SCHEDULE EVERY 1 DAY
  STARTS (CURRENT_DATE + INTERVAL 1 DAY + INTERVAL 2 HOUR)
  DO CALL sp_bersihkan_data();

-- ---------------------------------------------------------------------
-- 6. Ringkasan hasil (nilai yang diharapkan ada di panduan)
-- ---------------------------------------------------------------------
SELECT
  (SELECT COUNT(*) FROM information_schema.tables
    WHERE table_schema = DATABASE() AND table_type = 'BASE TABLE') AS tabel,
  (SELECT COUNT(*) FROM information_schema.views
    WHERE table_schema = DATABASE())                               AS view_sisa,
  (SELECT COUNT(*) FROM target_roles)                              AS peran,
  (SELECT COUNT(*) FROM skills)                                    AS skill,
  (SELECT COUNT(*) FROM role_skills)                               AS role_skill,
  (SELECT COUNT(*) FROM review_criteria)                           AS kriteria,
  (SELECT COUNT(*) FROM review_criteria_weights)                   AS bobot,
  (SELECT COUNT(*) FROM information_schema.routines
    WHERE routine_schema = DATABASE())                             AS prosedur,
  (SELECT COUNT(*) FROM information_schema.events
    WHERE event_schema = DATABASE())                               AS event_terjadwal;
