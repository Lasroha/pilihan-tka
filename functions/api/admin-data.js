/**
 * Cloudflare Pages Function: /api/admin-data
 * Mengambil Rekapitulasi Global Admin Utama (Matriks 11 Mapel, Capaian 14 Walas, Master Data)
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

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json().catch(() => ({}));

    const password = String(body.password || '').trim();

    if (password !== 'AdminPTN@2027') {
      return jsonResponse({ success: false, message: 'Otorisasi ditolak. Password Admin Utama salah.' }, 401);
    }

    if (!env.DB) {
      return jsonResponse({ success: false, message: 'Database D1 belum terhubung.' }, 500);
    }

    // Ambil seluruh master data siswa
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

    // Matriks 11 Mapel
    const subjectStats = {};
    VALID_SUBJECTS.forEach(s => {
      subjectStats[s] = { choice_1: 0, choice_2: 0, total: 0 };
    });

    // Progres Capaian per Walas
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

    // Hitung persentase walas
    const walasList = Object.values(walasStats).map(w => {
      w.percent = w.total > 0 ? Math.round((w.completed / w.total) * 100) : 0;
      return w;
    }).sort((a, b) => a.inisial.localeCompare(b.inisial));

    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    return jsonResponse({
      success: true,
      data: {
        summary: {
          total,
          completed,
          pending,
          percent
        },
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

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
