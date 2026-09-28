/**
 * Cloudflare Pages Function: /api/submit-choice
 * Menyimpan / Memperbarui Pilihan Mata Pelajaran TKA Siswa
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

    const username = String(body.username || '').trim().toLowerCase();
    const choice1 = String(body.choice_1 || '').trim();
    const choice2 = String(body.choice_2 || '').trim();

    if (!username) {
      return jsonResponse({ success: false, message: 'Username tidak valid.' }, 400);
    }

    if (!choice1 || !choice2) {
      return jsonResponse({ success: false, message: 'Pilihan 1 dan Pilihan 2 wajib diisi.' }, 400);
    }

    if (!VALID_SUBJECTS.includes(choice1) || !VALID_SUBJECTS.includes(choice2)) {
      return jsonResponse({ success: false, message: 'Salah satu mata pelajaran tidak valid.' }, 400);
    }

    if (!env.DB) {
      return jsonResponse({ success: false, message: 'Database D1 belum terhubung.' }, 500);
    }

    // Format ISO Timestamp Waktu Indonesia Barat (WIB / UTC+7)
    const now = new Date();
    const nowWib = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    const timestampStr = nowWib.toISOString().replace('T', ' ').substring(0, 19);

    // Update query
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
      return jsonResponse({ success: false, message: 'Data siswa tidak ditemukan.' }, 404);
    }

    // Ambil data terbaru
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
