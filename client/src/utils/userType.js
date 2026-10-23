const teks = {
    fresh_graduate: {
        label: 'Fresh graduate',
        sapaan: 'Unggah CV atau proyek kuliah Anda, lalu biarkan AI menunjukkan apa yang bisa ditingkatkan.',
        kosong: 'Unggah CV atau proyek kuliah pertama Anda untuk mendapatkan skor dan saran.',
        judulUpload: 'Unggah CV atau portofolio',
        petunjukUpload: 'Cantumkan proyek kuliah, tugas akhir, kegiatan organisasi, atau proyek pribadi beserta tools dan hasilnya.',
        contohJudul: 'Contoh: CV Data Analyst 2026',
        contohIsi: 'Tempel teks CV/portofolio Anda: proyek kuliah, tugas akhir, organisasi, tools yang dipakai, dan hasil yang dicapai...',
        deskripsiDaftar: 'Baru lulus atau akan lulus, dan sedang menyiapkan lamaran pertama.',
        judulTips: 'Tips untuk fresh graduate',
        tips: [
            'Tonjolkan proyek, bukan hanya mata kuliah. Rekruter ingin melihat hal yang pernah Anda bangun.',
            'Tulis hasil dengan angka: jumlah data, pengguna, atau peningkatan yang dicapai.',
            'Sertakan link proyek (GitHub, Figma, atau situs) agar mudah dibuktikan.',
        ],
    },
    anak_magang: {
        label: 'Anak magang',
        sapaan: 'Unggah laporan atau hasil kerja magang Anda, lalu biarkan AI menunjukkan cara membuatnya lebih berdampak.',
        kosong: 'Unggah laporan atau ringkasan pekerjaan magang pertama Anda untuk mendapatkan skor dan saran.',
        judulUpload: 'Unggah laporan atau portofolio magang',
        petunjukUpload: 'Cantumkan tugas yang Anda kerjakan di magang, kontribusi di tim, tools yang dipakai, dan hasil yang terukur.',
        contohJudul: 'Contoh: Portofolio Magang Digital Marketing',
        contohIsi: 'Tempel ringkasan pekerjaan magang Anda: tugas, kontribusi di tim, tools yang dipakai, dan hasil yang dicapai...',
        deskripsiDaftar: 'Sedang atau baru selesai magang, dan ingin pekerjaannya terlihat berdampak.',
        judulTips: 'Tips untuk anak magang',
        tips: [
            'Ubah daftar tugas menjadi pencapaian: apa yang berubah berkat kontribusi Anda?',
            'Catat angka selama magang, misalnya jumlah laporan, konten, atau peningkatan efisiensi.',
            'Minta izin atasan atau mentor untuk mencantumkan hasil kerja yang boleh dipublikasikan.',
        ],
    },
};

export const getTeks = (tipe) =>
    tipe === 'admin'
        ? { ...teks.fresh_graduate, label: 'Admin' }
        : teks[tipe] || teks.fresh_graduate;