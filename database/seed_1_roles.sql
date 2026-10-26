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
-- Dumping data for table `target_roles`
--
-- WHERE:  is_custom=0

LOCK TABLES `target_roles` WRITE;
/*!40000 ALTER TABLE `target_roles` DISABLE KEYS */;
INSERT INTO `target_roles` (`role_id`, `role_name`, `field`, `description`, `is_active`, `is_custom`, `created_by`, `created_at`) VALUES (1,'Data Analyst','teknologi','Menganalisis data untuk mendukung keputusan bisnis',1,0,NULL,'2026-10-16 04:17:45'),(2,'UI/UX Designer','kreatif','Merancang antarmuka dan pengalaman pengguna',1,0,NULL,'2026-10-16 04:17:45'),(3,'Digital Marketing','bisnis','Mengelola kampanye dan konten pemasaran digital',1,0,NULL,'2026-10-16 04:17:45'),(4,'Web Developer','teknologi','Membangun aplikasi web',1,0,NULL,'2026-10-16 04:17:45'),(5,'Umum / Lintas Bidang','lainnya','Untuk semua bidang atau yang belum menentukan peran. Dinilai dari kemampuan dasar yang dicari hampir semua perusahaan.',1,0,NULL,'2026-10-26 06:27:11'),(6,'Business Analyst','bisnis','Menerjemahkan kebutuhan bisnis menjadi analisis dan rekomendasi',1,0,NULL,'2026-10-26 06:27:11'),(7,'Project Manager','bisnis','Merencanakan, mengoordinasi, dan menyelesaikan proyek tepat waktu',1,0,NULL,'2026-10-26 06:27:11'),(8,'Graphic Designer','kreatif','Membuat desain visual untuk media cetak dan digital',1,0,NULL,'2026-10-26 06:27:11'),(9,'Content Creator','kreatif','Membuat konten tulisan, visual, dan video untuk audiens',1,0,NULL,'2026-10-26 06:27:11'),(10,'Finance & Accounting','bisnis','Mengelola pencatatan dan pelaporan keuangan',1,0,NULL,'2026-10-26 06:27:11'),(11,'Human Resources','bisnis','Mengelola rekrutmen, administrasi, dan pengembangan karyawan',1,0,NULL,'2026-10-26 06:27:11'),(12,'Sales & Business Development','bisnis','Mencari dan mengembangkan peluang penjualan dan kemitraan',1,0,NULL,'2026-10-26 06:27:11'),(13,'QA Tester','teknologi','Menguji perangkat lunak agar bebas bug sebelum dirilis',1,0,NULL,'2026-10-26 06:27:11');
/*!40000 ALTER TABLE `target_roles` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-26  6:32:23
