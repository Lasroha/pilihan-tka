# Web Pemilihan Mata Pelajaran Pilihan TKA (Tes Kemampuan Akademik)

Aplikasi web modern, responsif, dan mandiri untuk pemilihan 2 mata pelajaran pilihan TKA siswa dengan Google Sheets sebagai database utama dan Google Apps Script sebagai API Backend.

---

## 🚀 Fitur Utama

1. **Autentikasi Siswa Tertutup:**
   - Login menggunakan NIS/Username & Password yang telah disusun oleh admin di Google Sheets.
2. **Pemilihan 2 Mata Pelajaran Wajib:**
   - Memilih tepat 2 mata pelajaran dari 11 daftar resmi (MIPA, IPS, Bahasa, Umum).
   - Diperbolehkan memilih mata pelajaran yang sama (Pilihan 1 = Pilihan 2) untuk pendalaman materi.
3. **Fleksibilitas Pembaruan (Edit & Update):**
   - Siswa dapat memperbarui pilihan selama periode masih aktif; data akan otomatis tertimpa (*overwrite*) beserta *timestamp* pembaruan.
4. **Cetak / Simpan Bukti Pendaftaran (PDF/Print View):**
   - Tampilan dokumen resmi bukti pendaftaran dengan tata letak cetak (*print-friendly*) rapi untuk arsip siswa & sekolah.
5. **Dashboard Administrator Real-Time:**
   - Login khusus Admin (Default: Username `admin` / Password `adminTKA2026`).
   - Kartu statistik: Total siswa, siswa sudah memilih, siswa belum memilih, dan persentase progres.
   - Rekapitulasi peminat untuk ke-11 mata pelajaran.
   - Pencarian siswa langsung & filter berdasarkan Status atau Kelas.
   - Tombol **Export CSV / Excel** dan **Cetak Rekap**.

---

## 📂 Struktur Proyek

```
d:/PILIHAN TKA/
├── backend/
│   ├── Code.gs                  # Script Google Apps Script (doPost/doGet API)
│   └── SPREADSHEET_SETUP.md     # Panduan struktur kolom & deployment Google Sheets
├── index.html                   # Halaman Single Page Application (Login, Dashboard, Bukti)
├── styles.css                   # Desain modern, glassmorphism, responsive & cetak (@media print)
├── config.js                    # Konfigurasi nama instansi & URL Web App
├── app.js                       # Logika JavaScript: auth, validasi, submit, dan print
└── prd.md                       # Product Requirements Document
```

---

## 🛠️ Cara Menjalankan

1. **Setup Google Sheets & Apps Script:**
   - Ikuti langkah-langkah di [SPREADSHEET_SETUP.md](file:///d:/PILIHAN%20TKA/backend/SPREADSHEET_SETUP.md).
   - Deploy script [Code.gs](file:///d:/PILIHAN%20TKA/backend/Code.gs) sebagai Web App (`Execute as: Me`, `Who has access: Anyone`).
   - Dapatkan Web App URL-nya.

2. **Hubungkan Web App URL:**
   - Buka [config.js](file:///d:/PILIHAN%20TKA/config.js) lalu masukkan URL pada baris:
     ```javascript
     SCRIPT_URL: 'https://script.google.com/macros/s/.../exec',
     ```
   - Sesuaikan juga nama instansi/sekolah pada `INSTITUTION_NAME` jika diinginkan.

3. **Buka Aplikasi Web:**
   - Buka [index.html](file:///d:/PILIHAN%20TKA/index.html) langsung di browser atau host menggunakan static web server (misalnya GitHub Pages, Vercel, Live Server VS Code).
