/**
 * Cloudflare Pages / Workers Entrypoint (_worker.js)
 * Web Pemilihan Mapel TKA - Prosus INTEN Cabang Kebayoran (T.A. 2026/2027)
 */

const VALID_SUBJECTS = [
  "Matematika Tingkat Lanjut",
  "Fisika",
  "Kimia",
  "Biologi",
  "Ekonomi",
  "Geografi",
  "Sejarah",
  "Sosiologi",
  "Pend. Kewarganegaraan",
  "B. Indonesia Tingkat Lanjut",
  "B. Inggris Tingkat Lanjut"
];

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders()
      });
    }

    // ==========================================
    // API ROUTER
    // ==========================================
    if (pathname === '/api/login' && request.method === 'POST') {
      return handleLogin(request, env);
    }

    if (pathname === '/api/submit-choice' && request.method === 'POST') {
      return handleSubmitChoice(request, env);
    }

    if (pathname === '/api/walas-data' && request.method === 'POST') {
      return handleWalasData(request, env);
    }

    if (pathname === '/api/admin-data' && request.method === 'POST') {
      return handleAdminData(request, env);
    }

    if (pathname === '/api/reset-choice' && request.method === 'POST') {
      return handleResetChoice(request, env);
    }

    // Serve static assets
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response('Not Found', { status: 404 });
  }
};

// ==========================================
// API HANDLERS
// ==========================================

async function handleLogin(request, env) {
  try {
    const body = await request.json().catch(() => ({}));
    const username = String(body.username || '').trim().toLowerCase();
    const password = String(body.password || '').trim();

    if (!username || !password) {
      return jsonResponse({ success: false, message: 'Username dan password wajib diisi.' }, 400);
    }

    // 1. Admin Utama (admin.jakarta / AdminPTN@2027)
    if (username === 'admin.jakarta') {
      if (password === 'AdminPTN@2027') {
        return jsonResponse({
          success: true,
          role: 'admin',
          message: 'Login Admin Utama Berhasil.',
          data: {
            username: 'admin.jakarta',
            nama_lengkap: 'Admin Utama Cabang Kebayoran',
            cabang: 'KEBAYORAN',
            kota: 'JAKARTA',
            role: 'admin'
          }
        });
      }
      return jsonResponse({ success: false, message: 'Password Admin salah.' }, 401);
    }

    // 2. Wali Kelas (*.jakarta / WalasPTN@2027)
    if (username.endsWith('.jakarta')) {
      const inisial = username.replace('.jakarta', '').toUpperCase();
      if (password === 'WalasPTN@2027') {
        return jsonResponse({
          success: true,
          role: 'walas',
          message: `Login Wali Kelas (${inisial}) Berhasil.`,
          data: {
            username: username,
            inisial_user: inisial,
            nama_lengkap: `Wali Kelas ${inisial}`,
            cabang: 'KEBAYORAN',
            kota: 'JAKARTA',
            role: 'walas'
          }
        });
      }
      return jsonResponse({ success: false, message: 'Password Wali Kelas salah.' }, 401);
    }

    // 3. Siswa (D1 Database)
    if (!env.DB) {
      return jsonResponse({ success: false, message: 'Database D1 belum terhubung ke aplikasi.' }, 500);
    }

    const student = await env.DB.prepare(
      'SELECT * FROM students WHERE LOWER(username) = ?'
    ).bind(username).first();

    if (!student) {
      return jsonResponse({ success: false, message: 'Username / NIS tidak terdaftar.' }, 404);
    }

    if (student.password !== password) {
      return jsonResponse({ success: false, message: 'Password siswa salah.' }, 401);
    }

    return jsonResponse({
      success: true,
      role: 'student',
      message: 'Login siswa berhasil.',
      data: {
        username: student.username,
        first_name: student.first_name,
        sekolah: student.sekolah,
        nama_kelas: student.nama_kelas,
        nama_cabang: student.nama_cabang,
        jenis_intensif: student.jenis_intensif,
        nama_kota: student.nama_kota,
        inisial_user: student.inisial_user,
        target_jurusan: student.target_jurusan,
        choice_1: student.choice_1,
        choice_2: student.choice_2,
        is_submitted: Boolean(student.is_submitted),
        submitted_at: student.submitted_at,
        updated_at: student.updated_at,
        role: 'student'
      }
    });
  } catch (err) {
    return jsonResponse({ success: false, message: 'Terjadi kesalahan server: ' + err.message }, 500);
  }
}

async function handleSubmitChoice(request, env) {
  try {
    const body = await request.json().catch(() => ({}));
    const username = String(body.username || '').trim().toLowerCase();
    const choice1 = String(body.choice_1 || '').trim();
    const choice2 = String(body.choice_2 || '').trim();

    if (!username || !choice1 || !choice2) {
      return jsonResponse({ success: false, message: 'Data tidak lengkap.' }, 400);
    }

    if (!VALID_SUBJECTS.includes(choice1) || !VALID_SUBJECTS.includes(choice2)) {
      return jsonResponse({ success: false, message: 'Mata pelajaran tidak valid.' }, 400);
    }

    if (!env.DB) {
      return jsonResponse({ success: false, message: 'Database D1 belum terhubung.' }, 500);
    }

    const now = new Date();
    const nowWib = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    const timestampStr = nowWib.toISOString().replace('T', ' ').substring(0, 19);

    const result = await env.DB.prepare(`
      UPDATE students 
      SET 
        choice_1 = ?, 
        choice_2 = ?, 
        is_submitted = 1, 
        submitted_at = COALESCE(submitted_at, ?),
        updated_at = ?
      WHERE LOWER(username) = ?
    `).bind(choice1, choice2, timestampStr, timestampStr, username).run();

    if (result.meta.changes === 0) {
      return jsonResponse({ success: false, message: 'Siswa tidak ditemukan.' }, 404);
    }

    const updatedStudent = await env.DB.prepare(
      'SELECT * FROM students WHERE LOWER(username) = ?'
    ).bind(username).first();

    return jsonResponse({
      success: true,
      message: 'Pilihan mata pelajaran berhasil disimpan.',
      data: {
        username: updatedStudent.username,
        first_name: updatedStudent.first_name,
        sekolah: updatedStudent.sekolah,
        nama_kelas: updatedStudent.nama_kelas,
        nama_cabang: updatedStudent.nama_cabang,
        jenis_intensif: updatedStudent.jenis_intensif,
        nama_kota: updatedStudent.nama_kota,
        inisial_user: updatedStudent.inisial_user,
        target_jurusan: updatedStudent.target_jurusan,
        choice_1: updatedStudent.choice_1,
        choice_2: updatedStudent.choice_2,
        is_submitted: true,
        submitted_at: updatedStudent.submitted_at,
        updated_at: updatedStudent.updated_at,
        role: 'student'
      }
    });
  } catch (err) {
    return jsonResponse({ success: false, message: 'Terjadi kesalahan server: ' + err.message }, 500);
  }
}

async function handleWalasData(request, env) {
  try {
    const body = await request.json().catch(() => ({}));
    const inisial = String(body.inisial_user || '').trim().toUpperCase();
    const password = String(body.password || '').trim();

    if (!inisial || password !== 'WalasPTN@2027') {
      return jsonResponse({ success: false, message: 'Otorisasi Walas ditolak.' }, 401);
    }

    if (!env.DB) return jsonResponse({ success: false, message: 'Database D1 belum terhubung.' }, 500);

    const { results } = await env.DB.prepare(`
      SELECT 
        username, first_name, sekolah, nama_kelas, nama_cabang, 
        jenis_intensif, nama_kota, inisial_user, target_jurusan,
        choice_1, choice_2, is_submitted, submitted_at, updated_at
      FROM students 
      WHERE UPPER(inisial_user) = ?
      ORDER BY nama_kelas ASC, first_name ASC
    `).bind(inisial).all();

    const students = results || [];
    const total = students.length;
    let completed = 0;
    let pending = 0;

    const subjectStats = {};
    VALID_SUBJECTS.forEach(s => {
      subjectStats[s] = { choice_1: 0, choice_2: 0, total: 0 };
    });

    const classesSet = new Set();
    students.forEach(s => {
      if (s.nama_kelas) classesSet.add(s.nama_kelas);
      if (s.is_submitted && s.choice_1 && s.choice_2) {
        completed++;
        if (subjectStats[s.choice_1]) {
          subjectStats[s.choice_1].choice_1++;
          subjectStats[s.choice_1].total++;
        }
        if (subjectStats[s.choice_2]) {
          subjectStats[s.choice_2].choice_2++;
          subjectStats[s.choice_2].total++;
        }
      } else {
        pending++;
      }
    });

    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    return jsonResponse({
      success: true,
      data: {
        inisial_user: inisial,
        summary: { total, completed, pending, percent },
        classes: Array.from(classesSet).sort(),
        subject_stats: subjectStats,
        students
      }
    });
  } catch (err) {
    return jsonResponse({ success: false, message: 'Terjadi kesalahan: ' + err.message }, 500);
  }
}

async function handleAdminData(request, env) {
  try {
    const body = await request.json().catch(() => ({}));
    const password = String(body.password || '').trim();

    if (password !== 'AdminPTN@2027') {
      return jsonResponse({ success: false, message: 'Otorisasi Admin ditolak.' }, 401);
    }

    if (!env.DB) return jsonResponse({ success: false, message: 'Database D1 belum terhubung.' }, 500);

    const { results } = await env.DB.prepare(`
      SELECT 
        username, first_name, sekolah, nama_kelas, nama_cabang, 
        jenis_intensif, nama_kota, inisial_user, target_jurusan,
        choice_1, choice_2, is_submitted, submitted_at, updated_at
      FROM students 
      ORDER BY inisial_user ASC, nama_kelas ASC, first_name ASC
    `).all();

    const students = results || [];
    const total = students.length;
    let completed = 0;
    let pending = 0;

    const subjectStats = {};
    VALID_SUBJECTS.forEach(s => {
      subjectStats[s] = { choice_1: 0, choice_2: 0, total: 0 };
    });

    const walasStats = {};
    const classesSet = new Set();

    students.forEach(s => {
      const walas = (s.inisial_user || 'UNASSIGNED').toUpperCase();
      if (!walasStats[walas]) {
        walasStats[walas] = { inisial: walas, total: 0, completed: 0, pending: 0, percent: 0 };
      }
      walasStats[walas].total++;

      if (s.nama_kelas) classesSet.add(s.nama_kelas);

      if (s.is_submitted && s.choice_1 && s.choice_2) {
        completed++;
        walasStats[walas].completed++;
        if (subjectStats[s.choice_1]) {
          subjectStats[s.choice_1].choice_1++;
          subjectStats[s.choice_1].total++;
        }
        if (subjectStats[s.choice_2]) {
          subjectStats[s.choice_2].choice_2++;
          subjectStats[s.choice_2].total++;
        }
      } else {
        pending++;
        walasStats[walas].pending++;
      }
    });

    const walasList = Object.values(walasStats).map(w => {
      w.percent = w.total > 0 ? Math.round((w.completed / w.total) * 100) : 0;
      return w;
    }).sort((a, b) => a.inisial.localeCompare(b.inisial));

    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    return jsonResponse({
      success: true,
      data: {
        summary: { total, completed, pending, percent },
        subject_stats: subjectStats,
        walas_progress: walasList,
        classes: Array.from(classesSet).sort(),
        students
      }
    });
  } catch (err) {
    return jsonResponse({ success: false, message: 'Terjadi kesalahan: ' + err.message }, 500);
  }
}

async function handleResetChoice(request, env) {
  try {
    const body = await request.json().catch(() => ({}));
    const role = String(body.role || '').trim();
    const password = String(body.password || '').trim();
    const targetUsername = String(body.target_username || '').trim().toLowerCase();

    if (!targetUsername) return jsonResponse({ success: false, message: 'Target username kosong.' }, 400);
    if (role === 'admin' && password !== 'AdminPTN@2027') return jsonResponse({ success: false, message: 'Otorisasi ditolak.' }, 401);
    if (role === 'walas' && password !== 'WalasPTN@2027') return jsonResponse({ success: false, message: 'Otorisasi ditolak.' }, 401);

    if (!env.DB) return jsonResponse({ success: false, message: 'Database D1 belum terhubung.' }, 500);

    await env.DB.prepare(`
      UPDATE students 
      SET 
        choice_1 = NULL, 
        choice_2 = NULL, 
        is_submitted = 0,
        submitted_at = NULL,
        updated_at = datetime('now', '+7 hours')
      WHERE LOWER(username) = ?
    `).bind(targetUsername).run();

    return jsonResponse({ success: true, message: `Pilihan siswa ${targetUsername} berhasil direset.` });
  } catch (err) {
    return jsonResponse({ success: false, message: 'Terjadi kesalahan: ' + err.message }, 500);
  }
}

// ==========================================
// HELPERS
// ==========================================
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders()
    }
  });
}
