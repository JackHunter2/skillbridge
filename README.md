# SkillBridge

Platform upskilling dan reviu portofolio berbasis AI untuk **fresh graduate dan anak magang**.

Pengguna mengunggah CV atau portofolio, lalu mendapat skor per aspek, saran perbaikan dengan contoh sebelum/sesudah, analisis skill gap terhadap peran yang dituju, dan roadmap belajar 30 hari.

Proyek ini dikembangkan dengan pendekatan **Design Thinking** (Empathize, Define, Ideate, Prototype, Test).

## Latar belakang

- **Insight:** pengguna bukan kurang belajar, tetapi kurang arah dan kurang feedback.
- **Problem statement:** fresh graduate dan anak magang membutuhkan arah upskilling yang jelas serta feedback portofolio yang cepat dan spesifik, karena mereka tidak tahu skill gap terhadap kebutuhan industri dan jarang mendapat reviu dari praktisi.
- **How Might We:** bagaimana membantu fresh graduate mengetahui skill gap dan memperbaiki portofolio dengan feedback spesifik dalam hitungan menit?

## Fitur

**Untuk pengguna**
- Daftar, masuk, lupa password dan reset password lewat tautan sekali pakai.
- Pilih peran target dari 13 peran bawaan (dengan pencarian), atau tulis peran sendiri (maksimal 5 per akun).
- Unggah portofolio berupa PDF atau link beserta teksnya.
- Reviu AI yang berjalan di latar belakang. Halaman memantau statusnya dan pindah sendiri saat selesai.
- Skor per aspek (Kejelasan, Bukti Dampak, Relevansi, Tampilan) dengan bobot yang berbeda untuk fresh graduate dan anak magang.
- Saran perbaikan berprioritas, dengan contoh sebelum/sesudah.
- Skill gap terhadap peran target, dan roadmap 30 hari yang langkahnya bisa dicentang.
- Grafik radar dan grafik perkembangan skor antar reviu.
- Unduh laporan PDF.
- Form feedback untuk tahap pengujian.
- Profil (foto, nama, status) dan ringkasan kemajuan.
- Pengaturan: pilihan warna aksen, ganti password, hapus akun.
- Hapus portofolio kapan saja (file dan semua hasil reviunya ikut terhapus).

**Untuk admin**
- Ringkasan statistik (pengguna, portofolio, reviu, rata-rata skor, akurasi AI menurut pengguna, peran terpopuler, model AI yang dipakai).
- Daftar feedback dengan pencarian, filter nilai, dan ekspor CSV (tanpa nama dan email).
- Daftar peran buatan pengguna, dengan tombol untuk menjadikannya peran resmi.
- Daftar pengguna.
- Admin **tidak** dapat melihat isi CV, teks portofolio, atau hasil reviu pengguna.

## Teknologi

| Bagian | Teknologi |
|---|---|
| Frontend | React (Vite), Tailwind CSS v4, React Router, Axios, Recharts, lucide-react |
| Backend | Node.js (Express, ES Modules), mysql2, zod, jsonwebtoken, bcryptjs, multer, pdf-parse 1.1.1, pdfkit, nodemailer |
| Database | MySQL 8 |
| AI | Google Gemini lewat REST API, dengan cadangan Groq (opsional) |
| Server | Ubuntu, Nginx, PM2, Certbot (Let's Encrypt) |

## Struktur proyek

```
skillbridge/
├── client/                      Aplikasi React
│   ├── public/                  logo, favicon, gambar latar login
│   └── src/
│       ├── components/          ui, layout, review
│       ├── context/             AuthContext
│       ├── pages/               Landing, Login, Register, Dashboard, ReviewResult, Admin, dst.
│       ├── services/            instance axios
│       └── utils/               tema, teks per status pengguna, nada skor
├── server/                      API Express
│   └── src/
│       ├── config/              koneksi database
│       ├── controllers/         auth, role, portfolio, review, feedback, roadmap, profile, admin
│       ├── middlewares/         auth, admin, upload PDF, upload foto
│       ├── routes/
│       ├── services/            aiReview (penyedia AI), reviewPdf (laporan PDF)
│       └── utils/               mailer
├── database/
│   ├── schema.sql               struktur tabel, prosedur, dan event (tanpa DROP)
│   ├── seed_1_roles.sql         peran bawaan
│   ├── seed_2_data.sql          skill, kebutuhan skill per peran, kriteria, dan bobot
│   └── migrasi_*.sql            perubahan struktur bertahap
├── .gitignore
└── README.md
```

## Menjalankan di komputer sendiri

### 1. Prasyarat
Node.js 20 atau lebih baru, MySQL 8, dan Git.

### 2. Ambil kode
```bash
git clone https://github.com/<username>/skillbridge.git
cd skillbridge
```

### 3. Siapkan database
Dijalankan dari folder root proyek. Gunakan bentuk `source` (bukan tanda `<`) agar juga berjalan di PowerShell.
```bash
mysql -u root -p -e "CREATE DATABASE skillbridge CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
mysql -u root -p skillbridge -e "source database/schema.sql"
mysql -u root -p skillbridge -e "source database/seed_1_roles.sql"
mysql -u root -p skillbridge -e "source database/seed_2_data.sql"
```
Hasil yang diharapkan: 15 tabel, 13 peran, 4 kriteria, 8 baris bobot, 3 prosedur, dan 1 event.

`schema.sql` sengaja **tidak** memuat `DROP` maupun `CREATE DATABASE`. Jika dijalankan ke database yang sudah berisi, ia akan berhenti dengan error dan tidak menghapus apa pun.

### 4. Server
```bash
cd server
npm install
cp .env.example .env      # di Windows: copy .env.example .env
```
Isi `.env` (lihat tabel di bawah), lalu:
```bash
npm start
```
Server berjalan di `http://localhost:5000`. Cek `http://localhost:5000/api/health`.

Saat menguji reviu AI, gunakan `npm start`, bukan `npm run dev`. Nodemon me-restart server tiap file disimpan, sehingga reviu yang sedang berjalan ikut terhenti.

### 5. Client
Di terminal lain:
```bash
cd client
npm install
npm run dev
```
Buka `http://localhost:5173`. Permintaan ke `/api` diteruskan otomatis ke server lewat proxy Vite.

### 6. Akun admin
Daftar akun lewat aplikasi, lalu jadikan admin lewat SQL:
```sql
UPDATE users SET user_type = 'admin' WHERE email = 'email@anda.com';
```
Keluar lalu masuk lagi, dan menu **Admin** muncul.

## Konfigurasi (`server/.env`)

| Variabel | Keterangan |
|---|---|
| `PORT` | Port server, bawaan 5000 |
| `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Koneksi MySQL |
| `JWT_SECRET` | Teks acak panjang. Buat dengan `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `CLIENT_URL` | Alamat aplikasi. Dipakai untuk tautan reset password |
| `GEMINI_API_KEY` | Key dari Google AI Studio |
| `AI_MODELS` | Daftar model Gemini dipisah koma, dicoba berurutan |
| `GROQ_API_KEY`, `GROQ_MODELS` | Opsional. Penyedia cadangan jika semua model Gemini gagal |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` | Opsional. Jika kosong, tautan reset password dicetak di terminal server |

File `.env` tidak boleh di-commit. Hanya `.env.example` yang ada di repositori.

## Cara kerja reviu AI

1. `POST /api/portfolios/:id/review` membuat baris reviu berstatus `processing` dan langsung membalas `202`.
2. Server memproses di latar belakang: mengirim teks portofolio, peran target, daftar kriteria beserta bobotnya, kebutuhan skill, dan profil pengguna (fresh graduate atau anak magang) ke model AI. Jawaban wajib berupa JSON dan divalidasi dengan zod.
3. Hasil (skor, saran, level skill, roadmap) disimpan dalam satu transaksi.
4. Frontend memeriksa `GET /api/reviews/:id/status` tiap 3 detik, lalu membuka halaman hasil.

Ketahanan terhadap kegagalan: model dicoba berurutan sesuai `AI_MODELS`. Kesalahan sementara (503, timeout) dicoba ulang satu kali. Kesalahan lain (kuota habis, model tidak ditemukan) langsung pindah ke model berikutnya, lalu ke Groq bila dikonfigurasi.

Catatan paket gratis: kuota Gemini gratis berbeda per model dan bisa berubah. Pantau di `aistudio.google.com/rate-limit`. Paket gratis penyedia AI umumnya tidak menjamin privasi data, jadi gunakan CV contoh saat menguji.

## Database

15 tabel:

| Kelompok | Tabel |
|---|---|
| Pengguna | `users`, `password_resets` |
| Master | `target_roles`, `skills`, `role_skills`, `review_criteria`, `review_criteria_weights` |
| Portofolio dan reviu | `portfolios`, `ai_reviews`, `review_scores`, `review_suggestions`, `skill_gaps` |
| Roadmap | `roadmaps`, `roadmap_items` |
| Pengujian | `user_feedback` |

Stored procedure:
- `sp_bersihkan_data()`: menghapus token reset kedaluwarsa, menandai reviu macet, menghapus reviu gagal lebih dari 7 hari, dan menghapus teks portofolio yang tidak aktif lebih dari 180 hari.
- `sp_hapus_pengguna(email)`: menghapus satu akun beserta seluruh datanya.
- `sp_ringkasan_sistem()`: statistik ringkas.

Event `ev_bersihkan_harian` memanggil `sp_bersihkan_data()` setiap hari pukul 02.00. Event hanya berjalan jika `event_scheduler` bernilai `ON`.

### Perubahan struktur
Simpan setiap perubahan sebagai file `database/migrasi_NN_keterangan.sql`, dan jalankan manual. **Selalu ambil backup sebelum menjalankannya.**

### Backup
```bash
mysqldump --single-transaction --routines --events skillbridge > backup.sql
```
Di server produksi, backup harian diatur lewat cron. Jangan meng-commit file backup (sudah diabaikan oleh `.gitignore`).

### Peringatan
Jangan menjalankan file `.sql` lama atau yang tidak dikenal ke database yang berisi data. File skema versi awal proyek memuat `DROP DATABASE` dan pernah menimpa database sungguhan.

## Privasi dan keamanan

- File PDF dihapus dari server segera setelah teksnya diekstrak. Hanya teks yang disimpan.
- Teks portofolio dihapus otomatis setelah 180 hari tanpa aktivitas. Hasil reviu tetap tersimpan.
- Pengguna bisa menghapus portofolio atau seluruh akunnya sendiri. Data dan file terkait ikut terhapus.
- Password disimpan sebagai hash bcrypt. Token reset hanya disimpan dalam bentuk hash, berlaku 30 menit, dan sekali pakai.
- Respons lupa password selalu sama, baik email terdaftar maupun tidak.
- Akses admin diperiksa ke database di setiap permintaan, bukan hanya disembunyikan di tampilan.
- Foto profil dibuka lewat `/api/avatars`. File PDF portofolio tidak pernah disajikan ke publik.
- CSV ekspor feedback tidak memuat nama maupun email, dan sel yang diawali karakter rumus diberi tanda kutip.

## Endpoint API (ringkas)

| Method | Path | Keterangan |
|---|---|---|
| GET | `/api/health` | Cek server dan database |
| POST | `/api/auth/register`, `/login` | Daftar dan masuk |
| GET | `/api/auth/me` | Data akun saat ini |
| POST | `/api/auth/forgot-password`, `/reset-password` | Reset password |
| GET | `/api/roles` | Daftar peran |
| POST | `/api/roles/custom` | Peran buatan sendiri |
| PUT | `/api/users/me`, `/me/password`, `/me/target-role` | Profil, password, peran target |
| GET | `/api/users/me/summary` | Ringkasan kemajuan |
| POST, DELETE | `/api/users/me/avatar` | Foto profil |
| DELETE | `/api/users/me` | Hapus akun |
| GET, POST | `/api/portfolios` | Daftar dan unggah portofolio |
| DELETE | `/api/portfolios/:id` | Hapus portofolio |
| GET | `/api/portfolios/history` | Riwayat skor |
| POST | `/api/portfolios/:id/review` | Mulai reviu AI |
| GET | `/api/reviews/:id`, `/:id/status`, `/:id/pdf` | Hasil, status, dan laporan PDF |
| POST, GET | `/api/feedback`, `/api/feedback/review/:reviewId` | Feedback pengguna |
| PATCH | `/api/roadmap/items/:id` | Centang langkah roadmap |
| GET, POST | `/api/admin/...` | Khusus admin: summary, feedback, feedback.csv, roles, users |

## Deploy ke VPS (Ubuntu)

Ringkasan langkah. Jalankan sebagai pengguna biasa (bukan root) untuk aplikasinya.

1. **Paket:** Node.js, Nginx, MySQL 8, Git, PM2, Certbot. Tambahkan swap 2 GB jika RAM kecil agar proses build tidak terhenti.
2. **Database:** buat database dan akun MySQL khusus aplikasi yang hanya bisa masuk dari `localhost`, lalu impor `schema.sql`, `seed_1_roles.sql`, dan `seed_2_data.sql`.
3. **Kode:** clone repositori (untuk repo privat, gunakan *deploy key* hanya-baca di GitHub).
4. **Server:** `cd server && npm install --omit=dev`, isi `.env` (`DB_HOST=127.0.0.1`, `JWT_SECRET` baru, `CLIENT_URL=https://domain-anda`), lalu `pm2 start src/server.js --name skillbridge-api`. Jalankan `pm2 save` dan `pm2 startup`.
5. **Client:** `cd client && npm install && npm run build`, lalu salin `dist/` ke `/var/www/skillbridge`.
6. **Nginx:** sajikan `/var/www/skillbridge`, teruskan `/api/` ke `http://127.0.0.1:5000`, `try_files $uri /index.html` untuk rute React, dan `client_max_body_size 10M`. Tambahkan `listen [::]:80;` agar pengesahan sertifikat lewat IPv6 tidak jatuh ke situs lain.
7. **HTTPS:** `sudo certbot --nginx -d domain-anda --redirect`.
8. **Firewall:** izinkan hanya SSH dan Nginx. **Jangan membuka port 3306.** Pastikan `bind-address = 127.0.0.1` pada MySQL. Untuk melihat database dari komputer sendiri, gunakan SSH tunnel.

### Memperbarui aplikasi
Buat skrip `~/update.sh` di server:
```bash
#!/usr/bin/env bash
set -euo pipefail
cd ~/skillbridge
git pull --ff-only
(cd server && npm install --omit=dev)
(cd client && npm install && npm run build)
rsync -a --delete client/dist/ /var/www/skillbridge/
pm2 restart skillbridge-api --update-env
pm2 status skillbridge-api
curl -fsS http://127.0.0.1:5000/api/health; echo
```
Alurnya: ubah kode di komputer, `git push`, lalu jalankan `~/update.sh` di server. Skrip ini tidak menyentuh database. Perubahan struktur dijalankan manual lewat file migrasi, setelah backup.

## Pemecahan masalah

| Gejala | Kemungkinan penyebab |
|---|---|
| Reviu sering gagal dengan 429 | Kuota model habis. Pindahkan model di `AI_MODELS` ke yang kuotanya lebih longgar, atau tunggu reset |
| Reviu gagal dengan 503 | Server penyedia AI sedang sibuk. Cukup ulangi beberapa saat lagi |
| `Illegal ... DEFINER` saat impor skema | Impor memakai akun yang bukan pembuat prosedur. Impor sebagai `root`, atau hapus klausa `DEFINER` dari file |
| 502 Bad Gateway di server | Proses Node mati. Cek `pm2 status` dan `pm2 logs skillbridge-api` |
| Sertifikat HTTPS gagal didapat | Cek DNS, port 80, dan apakah nama domain juga mengarah ke IPv6 yang dilayani situs lain |
| Layar putih setelah deploy | Isi `/var/www/skillbridge` kosong atau tidak diperbarui. Ulangi `rsync` |
| Ikon tab atau gambar tidak berubah | Cache browser. Tekan Ctrl+F5 atau buka jendela penyamaran |

## Lisensi dan penggunaan

Proyek ini dibuat untuk keperluan tugas dan pembelajaran.
