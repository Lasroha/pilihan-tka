/**
 * Konfigurasi Frontend Aplikasi Pemilihan TKA
 */
const CONFIG = {
  // Masukkan URL Google Apps Script Web App yang Anda dapatkan setelah Deploy
  // Contoh: 'https://script.google.com/macros/s/AKfycbx.../exec'
  SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbx8nNqyVwUL-dYM0cUWMfahWr8Oju0qpGXk1RsgH-tz4bR2Hz3wddU0axk0Yo4ULHBvHA/exec',

  // Nama Sekolah / Instansi
  APP_TITLE: 'Pemilihan Mata Pelajaran TKA',
  INSTITUTION_NAME: 'Prosus INTEN KEBAYORAN SAMBAS',
  ACADEMIC_YEAR: 'Tahun Ajaran 2026/2027',

  // 11 Mata Pelajaran Resmi
  SUBJECTS: [
    { id: 1, name: 'Matematika Tingkat Lanjut', group: 'MIPA', icon: '📐' },
    { id: 2, name: 'Fisika', group: 'MIPA', icon: '⚡' },
    { id: 3, name: 'Kimia', group: 'MIPA', icon: '🧪' },
    { id: 4, name: 'Biologi', group: 'MIPA', icon: '🧬' },
    { id: 5, name: 'Ekonomi', group: 'IPS', icon: '📈' },
    { id: 6, name: 'Geografi', group: 'IPS', icon: '🌍' },
    { id: 7, name: 'Sejarah', group: 'IPS', icon: '🏛️' },
    { id: 8, name: 'Sosiologi', group: 'IPS', icon: '👥' },
    { id: 9, name: 'Pend. Kewarganegaraan', group: 'Umum', icon: '🇮🇩' },
    { id: 10, name: 'B. Indonesia Tingkat Lanjut', group: 'Bahasa', icon: '📖' },
    { id: 11, name: 'B. Inggris Tingkat Lanjut', group: 'Bahasa', icon: '🌐' }
  ]
};
