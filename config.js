/**
 * Konfigurasi Web Pemilihan Mata Pelajaran TKA
 * Unit: Prosus INTEN Cabang Kebayoran - Jakarta (T.A. 2026/2027)
 */
const CONFIG = {
  // Otomatis mendeteksi domain: Jika dibuka di Cloudflare gunakan relative path, jika dibuka di GitHub Pages gunakan URL Worker
  API_BASE_URL: (typeof window !== 'undefined' && (window.location.hostname.includes('workers.dev') || window.location.hostname.includes('pages.dev')))
    ? ''
    : 'https://pilihan-tka.lasroha-panjaitan1.workers.dev',

  // Identitas Cabang & Sekolah
  APP_TITLE: 'Pemilihan Mata Pelajaran TKA',
  INSTITUTION_NAME: 'Prosus INTEN Cabang Kebayoran',
  BRANCH_NAME: 'KEBAYORAN - JAKARTA',
  ACADEMIC_YEAR: 'Tahun Ajaran 2026/2027',

  // 11 Mata Pelajaran Resmi sesuai PRD
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
