-- MySQL dump 10.13  Distrib 8.0.46, for Linux (x86_64)
--
-- Host: localhost    Database: pulih
-- ------------------------------------------------------
-- Server version	8.0.46-0ubuntu0.24.04.4

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `ai_reviews`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ai_reviews` (
  `review_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `portfolio_id` bigint unsigned NOT NULL,
  `model_name` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `overall_score` decimal(5,2) NOT NULL,
  `summary` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `status` enum('queued','processing','done','failed') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'queued',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`review_id`),
  KEY `idx_rv_portfolio` (`portfolio_id`),
  KEY `idx_rv_portfolio_status` (`portfolio_id`,`status`,`created_at`),
  CONSTRAINT `fk_rv_portfolio` FOREIGN KEY (`portfolio_id`) REFERENCES `portfolios` (`portfolio_id`) ON DELETE CASCADE,
  CONSTRAINT `chk_rv_score` CHECK ((`overall_score` between 0 and 100))
) ENGINE=InnoDB AUTO_INCREMENT=125 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `password_resets`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_resets` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `token_hash` char(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_reset_token` (`token_hash`),
  KEY `idx_reset_user` (`user_id`),
  KEY `idx_reset_exp` (`expires_at`),
  CONSTRAINT `fk_reset_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `portfolios`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `portfolios` (
  `portfolio_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `role_id` int unsigned NOT NULL,
  `title` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `source_type` enum('file','link') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `external_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `extracted_text` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `version_no` int unsigned NOT NULL DEFAULT '1',
  `parent_id` bigint unsigned DEFAULT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `text_purged_at` datetime DEFAULT NULL,
  PRIMARY KEY (`portfolio_id`),
  KEY `idx_pf_user` (`user_id`),
  KEY `fk_pf_role` (`role_id`),
  KEY `fk_pf_parent` (`parent_id`),
  CONSTRAINT `fk_pf_parent` FOREIGN KEY (`parent_id`) REFERENCES `portfolios` (`portfolio_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_pf_role` FOREIGN KEY (`role_id`) REFERENCES `target_roles` (`role_id`),
  CONSTRAINT `fk_pf_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `chk_pf_source` CHECK ((((`source_type` = _utf8mb4'file') and (`file_path` is not null)) or ((`source_type` = _utf8mb4'link') and (`external_url` is not null))))
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `review_criteria`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `review_criteria` (
  `criteria_id` int unsigned NOT NULL AUTO_INCREMENT,
  `criteria_name` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `weight` decimal(4,2) NOT NULL DEFAULT '1.00',
  PRIMARY KEY (`criteria_id`),
  UNIQUE KEY `uq_criteria_name` (`criteria_name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `review_criteria_weights`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `review_criteria_weights` (
  `criteria_id` int unsigned NOT NULL,
  `user_type` enum('fresh_graduate','anak_magang') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `weight` decimal(4,2) NOT NULL,
  PRIMARY KEY (`criteria_id`,`user_type`),
  CONSTRAINT `fk_w_criteria` FOREIGN KEY (`criteria_id`) REFERENCES `review_criteria` (`criteria_id`) ON DELETE CASCADE,
  CONSTRAINT `chk_w_weight` CHECK ((`weight` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `review_scores`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `review_scores` (
  `review_id` bigint unsigned NOT NULL,
  `criteria_id` int unsigned NOT NULL,
  `score` decimal(5,2) NOT NULL,
  `explanation` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `weight` decimal(4,2) DEFAULT NULL,
  PRIMARY KEY (`review_id`,`criteria_id`),
  KEY `fk_sc_criteria` (`criteria_id`),
  CONSTRAINT `fk_sc_criteria` FOREIGN KEY (`criteria_id`) REFERENCES `review_criteria` (`criteria_id`),
  CONSTRAINT `fk_sc_review` FOREIGN KEY (`review_id`) REFERENCES `ai_reviews` (`review_id`) ON DELETE CASCADE,
  CONSTRAINT `chk_sc_score` CHECK ((`score` between 0 and 100))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `review_suggestions`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `review_suggestions` (
  `suggestion_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `review_id` bigint unsigned NOT NULL,
  `criteria_id` int unsigned DEFAULT NULL,
  `section_ref` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `suggestion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `example_before` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `example_after` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `priority` enum('tinggi','sedang','rendah') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'sedang',
  `is_done` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`suggestion_id`),
  KEY `idx_sg_review` (`review_id`),
  KEY `fk_sg_criteria` (`criteria_id`),
  CONSTRAINT `fk_sg_criteria` FOREIGN KEY (`criteria_id`) REFERENCES `review_criteria` (`criteria_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_sg_review` FOREIGN KEY (`review_id`) REFERENCES `ai_reviews` (`review_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=294 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `roadmap_items`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roadmap_items` (
  `item_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `roadmap_id` bigint unsigned NOT NULL,
  `skill_id` int unsigned NOT NULL,
  `week_no` tinyint unsigned NOT NULL,
  `title` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `resource_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('belum','berjalan','selesai') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'belum',
  `completed_at` datetime DEFAULT NULL,
  PRIMARY KEY (`item_id`),
  KEY `idx_ri_roadmap` (`roadmap_id`),
  KEY `fk_ri_skill` (`skill_id`),
  CONSTRAINT `fk_ri_roadmap` FOREIGN KEY (`roadmap_id`) REFERENCES `roadmaps` (`roadmap_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ri_skill` FOREIGN KEY (`skill_id`) REFERENCES `skills` (`skill_id`)
) ENGINE=InnoDB AUTO_INCREMENT=188 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `roadmaps`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roadmaps` (
  `roadmap_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `review_id` bigint unsigned DEFAULT NULL,
  `duration_days` smallint unsigned NOT NULL DEFAULT '30',
  `start_date` date DEFAULT NULL,
  `status` enum('aktif','selesai','dibatalkan') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'aktif',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`roadmap_id`),
  KEY `idx_rm_user` (`user_id`),
  KEY `fk_rm_review` (`review_id`),
  CONSTRAINT `fk_rm_review` FOREIGN KEY (`review_id`) REFERENCES `ai_reviews` (`review_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_rm_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `role_skills`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role_skills` (
  `role_id` int unsigned NOT NULL,
  `skill_id` int unsigned NOT NULL,
  `required_level` tinyint unsigned NOT NULL DEFAULT '3',
  `importance` enum('wajib','penting','nilai_tambah') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'penting',
  PRIMARY KEY (`role_id`,`skill_id`),
  KEY `fk_rs_skill` (`skill_id`),
  CONSTRAINT `fk_rs_role` FOREIGN KEY (`role_id`) REFERENCES `target_roles` (`role_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_rs_skill` FOREIGN KEY (`skill_id`) REFERENCES `skills` (`skill_id`) ON DELETE CASCADE,
  CONSTRAINT `chk_rs_level` CHECK ((`required_level` between 1 and 5))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `skill_gaps`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `skill_gaps` (
  `gap_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `review_id` bigint unsigned NOT NULL,
  `skill_id` int unsigned NOT NULL,
  `current_level` tinyint unsigned NOT NULL DEFAULT '0',
  `required_level` tinyint unsigned NOT NULL,
  `gap_size` tinyint GENERATED ALWAYS AS (greatest((cast(`required_level` as signed) - cast(`current_level` as signed)),0)) STORED,
  PRIMARY KEY (`gap_id`),
  UNIQUE KEY `uq_gap` (`review_id`,`skill_id`),
  KEY `fk_gap_skill` (`skill_id`),
  CONSTRAINT `fk_gap_review` FOREIGN KEY (`review_id`) REFERENCES `ai_reviews` (`review_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_gap_skill` FOREIGN KEY (`skill_id`) REFERENCES `skills` (`skill_id`)
) ENGINE=InnoDB AUTO_INCREMENT=177 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `skills`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `skills` (
  `skill_id` int unsigned NOT NULL AUTO_INCREMENT,
  `skill_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` enum('technical','soft','tools','domain') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'technical',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`skill_id`),
  UNIQUE KEY `uq_skill_name` (`skill_name`)
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `target_roles`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `target_roles` (
  `role_id` int unsigned NOT NULL AUTO_INCREMENT,
  `role_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `field` enum('digital','bisnis','kreatif','teknologi','lainnya') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'digital',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `is_custom` tinyint(1) NOT NULL DEFAULT '0',
  `created_by` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`role_id`),
  UNIQUE KEY `uq_role_name` (`role_name`),
  KEY `fk_role_creator` (`created_by`),
  CONSTRAINT `fk_role_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_feedback`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_feedback` (
  `feedback_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `review_id` bigint unsigned DEFAULT NULL,
  `tested_feature` enum('upload','hasil_reviu','skill_gap','roadmap','lainnya') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `observed_issue` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `most_helpful` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `most_difficult` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `would_change` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `ai_accuracy` tinyint unsigned DEFAULT NULL,
  `feedback_type` enum('umum','spesifik','actionable') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'spesifik',
  `improvement_priority` enum('tinggi','sedang','rendah') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'sedang',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`feedback_id`),
  UNIQUE KEY `uq_feedback_user_review` (`user_id`,`review_id`,`tested_feature`),
  KEY `fk_fb_user` (`user_id`),
  KEY `fk_fb_review` (`review_id`),
  CONSTRAINT `fk_fb_review` FOREIGN KEY (`review_id`) REFERENCES `ai_reviews` (`review_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_fb_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `chk_fb_acc` CHECK (((`ai_accuracy` is null) or (`ai_accuracy` between 1 and 5)))
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `full_name` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_type` enum('fresh_graduate','anak_magang','praktisi','admin') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'fresh_graduate',
  `university` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `major` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `graduation_year` year DEFAULT NULL,
  `target_role_id` int unsigned DEFAULT NULL,
  `avatar_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `uq_user_email` (`email`),
  KEY `idx_user_type` (`user_type`),
  KEY `fk_user_role` (`target_role_id`),
  CONSTRAINT `fk_user_role` FOREIGN KEY (`target_role_id`) REFERENCES `target_roles` (`role_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping events for database 'pulih'
--
/*!50106 SET @save_time_zone= @@TIME_ZONE */ ;
DELIMITER ;;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;;
/*!50003 SET character_set_client  = utf8mb4 */ ;;
/*!50003 SET character_set_results = utf8mb4 */ ;;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;;
/*!50003 SET @saved_time_zone      = @@time_zone */ ;;
/*!50003 SET time_zone             = 'SYSTEM' */ ;;
/*!50106 CREATE*/ /*!50117 DEFINER=`root`@`localhost`*/ /*!50106 EVENT `ev_bersihkan_harian` ON SCHEDULE EVERY 1 DAY STARTS '2026-10-27 02:00:00' ON COMPLETION NOT PRESERVE ENABLE DO CALL sp_bersihkan_data() */ ;;
/*!50003 SET time_zone             = @saved_time_zone */ ;;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;;
/*!50003 SET character_set_client  = @saved_cs_client */ ;;
/*!50003 SET character_set_results = @saved_cs_results */ ;;
/*!50003 SET collation_connection  = @saved_col_connection */ ;;
DELIMITER ;
/*!50106 SET TIME_ZONE= @save_time_zone */ ;

--
-- Dumping routines for database 'pulih'
--
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_bersihkan_data`()
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
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_hapus_pengguna`(IN p_email VARCHAR(150))
BEGIN
  DECLARE v_id BIGINT UNSIGNED;
  SELECT user_id INTO v_id FROM users WHERE email = p_email;

  IF v_id IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Pengguna tidak ditemukan';
  END IF;

  DELETE FROM users WHERE user_id = v_id;
  SELECT CONCAT('Akun ', p_email, ' beserta seluruh datanya telah dihapus') AS hasil;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_ringkasan_sistem`()
BEGIN
  SELECT
    (SELECT COUNT(*) FROM users WHERE user_type IN ('fresh_graduate','anak_magang')) AS total_pengguna,
    (SELECT COUNT(*) FROM portfolios)                                               AS total_portofolio,
    (SELECT COUNT(*) FROM ai_reviews WHERE status = 'done')                         AS reviu_selesai,
    (SELECT COUNT(*) FROM ai_reviews WHERE status = 'failed')                       AS reviu_gagal,
    (SELECT ROUND(AVG(overall_score), 1) FROM ai_reviews WHERE status = 'done')    AS rata_rata_skor,
    (SELECT COUNT(*) FROM user_feedback)                                            AS total_feedback,
    (SELECT ROUND(AVG(ai_accuracy), 1) FROM user_feedback)                          AS rata_rata_akurasi_ai;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-26  6:32:16
