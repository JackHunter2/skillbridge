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
-- Dumping data for table `skills`
--

LOCK TABLES `skills` WRITE;
/*!40000 ALTER TABLE `skills` DISABLE KEYS */;
INSERT INTO `skills` (`skill_id`, `skill_name`, `category`, `description`) VALUES (1,'SQL','technical',NULL),(2,'Excel / Spreadsheet','tools',NULL),(3,'Data Visualization','technical',NULL),(4,'Python','technical',NULL),(5,'Figma','tools',NULL),(6,'User Research','domain',NULL),(7,'SEO & Content','domain',NULL),(8,'Komunikasi','soft',NULL),(9,'Storytelling Data','soft',NULL),(10,'HTML & CSS','technical',NULL),(11,'JavaScript','technical',NULL),(12,'React','technical',NULL),(13,'Git & GitHub','tools',NULL),(14,'Node.js','technical',NULL),(15,'REST API','technical',NULL),(16,'Copywriting','domain',NULL),(17,'Google Analytics','tools',NULL),(18,'Problem Solving','soft',NULL),(19,'Kerja Tim','soft',NULL),(20,'Manajemen Waktu','soft',NULL),(21,'Penulisan Profesional','soft',NULL),(22,'Adaptabilitas','soft',NULL),(23,'Negosiasi','soft',NULL),(24,'Analisis Kebutuhan Bisnis','domain',NULL),(25,'Dokumentasi Proses','domain',NULL),(26,'Manajemen Proyek','domain',NULL),(27,'Manajemen Risiko','domain',NULL),(28,'Media Sosial','domain',NULL),(29,'Akuntansi Dasar','domain',NULL),(30,'Laporan Keuangan','domain',NULL),(31,'Rekrutmen & Seleksi','domain',NULL),(32,'Administrasi SDM','domain',NULL),(33,'Pengetahuan Produk','domain',NULL),(34,'Desain Grafis','technical',NULL),(35,'Tipografi & Layout','technical',NULL),(36,'Pengeditan Video','technical',NULL),(37,'Pengujian Perangkat Lunak','technical',NULL),(38,'Penulisan Test Case','technical',NULL),(39,'CRM','tools',NULL);
/*!40000 ALTER TABLE `skills` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `role_skills`
--

LOCK TABLES `role_skills` WRITE;
/*!40000 ALTER TABLE `role_skills` DISABLE KEYS */;
INSERT INTO `role_skills` (`role_id`, `skill_id`, `required_level`, `importance`) VALUES (1,1,4,'wajib'),(1,2,4,'wajib'),(1,3,4,'wajib'),(1,4,3,'penting'),(1,9,3,'penting'),(2,5,4,'wajib'),(2,6,4,'wajib'),(2,8,3,'penting'),(3,7,4,'wajib'),(3,8,3,'penting'),(3,16,4,'wajib'),(3,17,4,'wajib'),(4,10,4,'wajib'),(4,11,4,'wajib'),(4,12,4,'wajib'),(4,13,3,'penting'),(4,14,3,'penting'),(4,15,3,'penting'),(5,2,3,'penting'),(5,8,4,'wajib'),(5,18,4,'wajib'),(5,19,3,'wajib'),(5,20,3,'penting'),(5,21,3,'penting'),(5,22,3,'nilai_tambah'),(6,1,3,'wajib'),(6,2,4,'wajib'),(6,3,3,'penting'),(6,8,4,'penting'),(6,24,4,'wajib'),(6,25,3,'penting'),(7,8,4,'wajib'),(7,19,4,'penting'),(7,20,4,'wajib'),(7,21,3,'nilai_tambah'),(7,26,4,'wajib'),(7,27,3,'penting'),(8,5,3,'penting'),(8,8,3,'penting'),(8,34,4,'wajib'),(8,35,4,'wajib'),(8,36,2,'nilai_tambah'),(9,7,3,'penting'),(9,16,4,'wajib'),(9,17,2,'nilai_tambah'),(9,28,4,'wajib'),(9,34,3,'penting'),(9,36,3,'penting'),(10,2,4,'wajib'),(10,8,3,'penting'),(10,21,3,'nilai_tambah'),(10,29,4,'wajib'),(10,30,4,'wajib'),(11,8,4,'wajib'),(11,21,3,'penting'),(11,23,3,'penting'),(11,31,4,'wajib'),(11,32,4,'wajib'),(12,8,4,'wajib'),(12,21,3,'nilai_tambah'),(12,23,4,'wajib'),(12,33,3,'penting'),(12,39,3,'penting'),(13,1,2,'penting'),(13,8,3,'penting'),(13,25,3,'penting'),(13,37,4,'wajib'),(13,38,4,'wajib');
/*!40000 ALTER TABLE `role_skills` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `review_criteria`
--

LOCK TABLES `review_criteria` WRITE;
/*!40000 ALTER TABLE `review_criteria` DISABLE KEYS */;
INSERT INTO `review_criteria` (`criteria_id`, `criteria_name`, `description`, `weight`) VALUES (1,'Kejelasan','Seberapa jelas proyek, peran, dan hasil dijelaskan',1.00),(2,'Bukti Dampak','Ada angka/hasil terukur dari pekerjaan',1.50),(3,'Relevansi','Kecocokan dengan peran target',1.50),(4,'Tampilan','Kerapian, struktur, dan visual portofolio',0.75);
/*!40000 ALTER TABLE `review_criteria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `review_criteria_weights`
--

LOCK TABLES `review_criteria_weights` WRITE;
/*!40000 ALTER TABLE `review_criteria_weights` DISABLE KEYS */;
INSERT INTO `review_criteria_weights` (`criteria_id`, `user_type`, `weight`) VALUES (1,'fresh_graduate',1.25),(1,'anak_magang',1.00),(2,'fresh_graduate',1.00),(2,'anak_magang',2.00),(3,'fresh_graduate',1.75),(3,'anak_magang',1.25),(4,'fresh_graduate',1.00),(4,'anak_magang',0.75);
/*!40000 ALTER TABLE `review_criteria_weights` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-26  6:32:30
