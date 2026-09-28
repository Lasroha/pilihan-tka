/**
 * Cloudflare Pages Function: /api/login
 * Unified Login: Siswa, Wali Kelas (*.jakarta), Admin (admin.jakarta)
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
    const password = String(body.password || '').trim();

    if (!username || !password) {
      return jsonResponse({ success: false, message: 'Username dan password wajib diisi.' }, 400);
    }

    // 1. Cek Admin Utama (admin.jakarta / AdminPTN@2027)
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
      } else {
        return jsonResponse({ success: false, message: 'Password Admin salah.' }, 401);
      }
    }

    // 2. Cek Wali Kelas (*.jakarta / WalasPTN@2027)
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
      } else {
        return jsonResponse({ success: false, message: 'Password Wali Kelas salah.' }, 401);
      }
    }

    // 3. Cek Siswa pada Database D1
    if (!env.DB) {
      return jsonResponse({
        success: false,
        message: 'Database D1 belum terhubung ke Cloudflare Pages. Pastikan D1 Binding diberi nama "DB".'
      }, 500);
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
