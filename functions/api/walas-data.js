/**
 * Cloudflare Pages Function: /api/walas-data
 * Mengambil Rekapitulasi Khusus Siswa Binaan Wali Kelas
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

    const inisial = String(body.inisial_user || '').trim().toUpperCase();
    const password = String(body.password || '').trim();

    if (!inisial) {
      return jsonResponse({ success: false, message: 'Inisial Wali Kelas tidak valid.' }, 400);
    }

    if (password !== 'WalasPTN@2027') {
      return jsonResponse({ success: false, message: 'Otorisasi ditolak. Password Walas salah.' }, 401);
    }

    if (!env.DB) {
      return jsonResponse({ success: false, message: 'Database D1 belum terhubung.' }, 500);
    }

    // Query semua siswa binaan walas terkait
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
        summary: {
          total,
          completed,
          pending,
          percent
        },
        classes: Array.from(classesSet).sort(),
        subject_stats: subjectStats,
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
