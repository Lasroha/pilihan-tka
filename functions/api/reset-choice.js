/**
 * Cloudflare Pages Function: /api/reset-choice
 * Reset Pilihan Siswa oleh Admin atau Wali Kelas
 */

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json().catch(() => ({}));

    const role = String(body.role || '').trim();
    const password = String(body.password || '').trim();
    const targetUsername = String(body.target_username || '').trim().toLowerCase();

    if (!targetUsername) {
      return jsonResponse({ success: false, message: 'Username target tidak valid.' }, 400);
    }

    if (role === 'admin' && password !== 'AdminPTN@2027') {
      return jsonResponse({ success: false, message: 'Otorisasi Admin ditolak.' }, 401);
    }

    if (role === 'walas' && password !== 'WalasPTN@2027') {
      return jsonResponse({ success: false, message: 'Otorisasi Walas ditolak.' }, 401);
    }

    if (!env.DB) {
      return jsonResponse({ success: false, message: 'Database D1 belum terhubung.' }, 500);
    }

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

    return jsonResponse({
      success: true,
      message: `Pilihan siswa ${targetUsername} berhasil direset.`
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
