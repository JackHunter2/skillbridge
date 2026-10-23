# SkillBridge

Platform upskilling dan reviu portofolio berbasis AI untuk fresh graduate dan anak magang.

Stack: React (Vite) + Tailwind, Node.js (Express), MySQL 8.

## Menjalankan di komputer baru

1. Pasang Node.js (v20+), MySQL 8, dan Git.
2. Buat database dan impor skema serta data awal (jalankan dari folder root proyek):

   mysql -u root -p -e "CREATE DATABASE upskilling_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
   mysql -u root -p upskilling_platform -e "source database/schema.sql"
   mysql -u root -p upskilling_platform -e "source database/seed_1_roles.sql"
   mysql -u root -p upskilling_platform -e "source database/seed_2_data.sql"

3. Server:

   cd server
   npm install
   copy .env.example .env      (lalu isi nilainya)
   npm start

4. Client (terminal lain):

   cd client
   npm install
   npm run dev

Buka http://localhost:5173
Untuk menjadikan satu akun admin: UPDATE users SET user_type='admin' WHERE email='...';