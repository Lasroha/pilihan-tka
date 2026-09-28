/**
 * Frontend Logic - Web Pemilihan Mata Pelajaran TKA (Cloudflare D1 Stack)
 * Unit: Prosus INTEN Cabang Kebayoran - Jakarta (T.A. 2026/2027)
 */

// Application State
const state = {
  currentUser: null,
  walasData: null,
  adminData: null,
  authCredentials: null,
  activeView: 'view-login'
};

// DOM Elements
const elements = {
  // Navigation
  navAppTitle: document.getElementById('nav-app-title'),
  navInstName: document.getElementById('nav-inst-name'),
  navUserActions: document.getElementById('nav-user-actions'),
  navUserDisplay: document.getElementById('nav-user-display'),
  btnLogout: document.getElementById('btn-logout'),

  // Views
  viewLogin: document.getElementById('view-login'),
  viewStudent: document.getElementById('view-student'),
  viewProof: document.getElementById('view-proof'),
  viewWalas: document.getElementById('view-walas'),
  viewAdmin: document.getElementById('view-admin'),

  // Login Form
  formLogin: document.getElementById('form-login'),
  loginUsername: document.getElementById('login-username'),
  loginPassword: document.getElementById('login-password'),
  btnLoginSubmit: document.getElementById('btn-login-submit'),
  btnTogglePass: document.getElementById('btn-toggle-pass'),
  loginError: document.getElementById('login-error'),

  // Student Dashboard
  studentAvatarLetter: document.getElementById('student-avatar-letter'),
  studentDisplayName: document.getElementById('student-display-name'),
  studentDisplayNis: document.getElementById('student-display-nis'),
  studentDisplayKelas: document.getElementById('student-display-kelas'),
  studentDisplaySekolah: document.getElementById('student-display-sekolah'),
  studentDisplayWalas: document.getElementById('student-display-walas'),
  studentTargetJurusan: document.getElementById('student-target-jurusan'),
  studentStatusBadge: document.getElementById('student-status-badge'),
  studentLastUpdate: document.getElementById('student-last-update'),
  formSelection: document.getElementById('form-selection'),
  selectPilihan1: document.getElementById('select-pilihan-1'),
  selectPilihan2: document.getElementById('select-pilihan-2'),
  previewPilihan1: document.getElementById('preview-pilihan-1'),
  previewIcon1: document.getElementById('preview-icon-1'),
  previewName1: document.getElementById('preview-name-1'),
  previewGroup1: document.getElementById('preview-group-1'),
  previewPilihan2: document.getElementById('preview-pilihan-2'),
  previewIcon2: document.getElementById('preview-icon-2'),
  previewName2: document.getElementById('preview-name-2'),
  previewGroup2: document.getElementById('preview-group-2'),
  btnSubmitChoice: document.getElementById('btn-submit-choice'),
  btnViewProof: document.getElementById('btn-view-proof'),

  // Proof Card
  proofDocId: document.getElementById('proof-doc-id'),
  proofNis: document.getElementById('proof-nis'),
  proofName: document.getElementById('proof-name'),
  proofSekolah: document.getElementById('proof-sekolah'),
  proofKelas: document.getElementById('proof-kelas'),
  proofWalas: document.getElementById('proof-walas'),
  proofTargetJurusan: document.getElementById('proof-target-jurusan'),
  proofTimestamp: document.getElementById('proof-timestamp'),
  proofVal1: document.getElementById('proof-val-1'),
  proofVal2: document.getElementById('proof-val-2'),
  proofSignatureName: document.getElementById('proof-signature-name'),
  btnBackToEdit: document.getElementById('btn-back-to-edit'),
  btnPrintProof: document.getElementById('btn-print-proof'),

  // Walas Dashboard
  walasHeaderInisial: document.getElementById('walas-header-inisial'),
  btnWalasRefresh: document.getElementById('btn-walas-refresh'),
  btnWalasExport: document.getElementById('btn-walas-export'),
  btnWalasPrint: document.getElementById('btn-walas-print'),
  walasStatTotal: document.getElementById('walas-stat-total'),
  walasStatCompleted: document.getElementById('walas-stat-completed'),
  walasStatPending: document.getElementById('walas-stat-pending'),
  walasStatPercent: document.getElementById('walas-stat-percent'),
  walasSearchInput: document.getElementById('walas-search-input'),
  walasFilterStatus: document.getElementById('walas-filter-status'),
  walasFilterKelas: document.getElementById('walas-filter-kelas'),
  walasShowingCount: document.getElementById('walas-showing-count'),
  walasStudentTbody: document.getElementById('walas-student-tbody'),

  // Admin Dashboard
  btnAdminRefresh: document.getElementById('btn-admin-refresh'),
  btnAdminExport: document.getElementById('btn-admin-export'),
  btnAdminPrint: document.getElementById('btn-admin-print'),
  adminStatTotal: document.getElementById('admin-stat-total'),
  adminStatCompleted: document.getElementById('admin-stat-completed'),
  adminStatPending: document.getElementById('admin-stat-pending'),
  adminStatPercent: document.getElementById('admin-stat-percent'),
  adminSubjectStatsContainer: document.getElementById('admin-subject-stats-container'),
  adminWalasProgressContainer: document.getElementById('admin-walas-progress-container'),
  adminSearchInput: document.getElementById('admin-search-input'),
  adminFilterStatus: document.getElementById('admin-filter-status'),
  adminFilterWalas: document.getElementById('admin-filter-walas'),
  adminFilterKelas: document.getElementById('admin-filter-kelas'),
  adminShowingCount: document.getElementById('admin-showing-count'),
  adminStudentTbody: document.getElementById('admin-student-tbody'),

  // Toast Container
  toastContainer: document.getElementById('toast-container')
};

// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  initAppMeta();
  populateSubjectDropdowns();
  setupEventListeners();
  restoreSession();
});

function initAppMeta() {
  if (CONFIG.APP_TITLE) elements.navAppTitle.textContent = CONFIG.APP_TITLE;
  if (CONFIG.INSTITUTION_NAME) elements.navInstName.textContent = CONFIG.INSTITUTION_NAME;
}

function populateSubjectDropdowns() {
  const optionsHtml = CONFIG.SUBJECTS.map(subj => 
    `<option value="${subj.name}">${subj.icon} ${subj.name} (${subj.group})</option>`
  ).join('');

  elements.selectPilihan1.innerHTML = '<option value="">-- Pilih Mata Pelajaran Pilihan 1 --</option>' + optionsHtml;
  elements.selectPilihan2.innerHTML = '<option value="">-- Pilih Mata Pelajaran Pilihan 2 --</option>' + optionsHtml;
}

// ==========================================
// EVENT LISTENERS
// ==========================================
function setupEventListeners() {
  // Password Visibility Toggle
  elements.btnTogglePass.addEventListener('click', () => {
    const isPassword = elements.loginPassword.type === 'password';
    elements.loginPassword.type = isPassword ? 'text' : 'password';
    elements.btnTogglePass.textContent = isPassword ? '🙈' : '👁️';
  });

  // Login Form
  elements.formLogin.addEventListener('submit', handleLoginSubmit);

  // Subject Selection Previews
  elements.selectPilihan1.addEventListener('change', () => updateChoicePreview(1));
  elements.selectPilihan2.addEventListener('change', () => updateChoicePreview(2));

  // Submit Student Choices
  elements.formSelection.addEventListener('submit', handleSelectionSubmit);

  // Proof View & Print
  elements.btnViewProof.addEventListener('click', () => {
    populateProofCard();
    switchView('view-proof');
  });

  elements.btnBackToEdit.addEventListener('click', () => {
    switchView('view-student');
  });

  elements.btnPrintProof.addEventListener('click', () => {
    window.print();
  });

  // Walas Dashboard Actions
  if (elements.btnWalasRefresh) {
    elements.btnWalasRefresh.addEventListener('click', () => fetchWalasData(true));
  }
  if (elements.btnWalasExport) {
    elements.btnWalasExport.addEventListener('click', exportWalasCSV);
  }
  if (elements.btnWalasPrint) {
    elements.btnWalasPrint.addEventListener('click', () => window.print());
  }
  if (elements.walasSearchInput) {
    elements.walasSearchInput.addEventListener('input', renderWalasTable);
  }
  if (elements.walasFilterStatus) {
    elements.walasFilterStatus.addEventListener('change', renderWalasTable);
  }
  if (elements.walasFilterKelas) {
    elements.walasFilterKelas.addEventListener('change', renderWalasTable);
  }

  // Admin Dashboard Actions
  if (elements.btnAdminRefresh) {
    elements.btnAdminRefresh.addEventListener('click', () => fetchAdminData(true));
  }
  if (elements.btnAdminExport) {
    elements.btnAdminExport.addEventListener('click', exportAdminCSV);
  }
  if (elements.btnAdminPrint) {
    elements.btnAdminPrint.addEventListener('click', () => window.print());
  }
  if (elements.adminSearchInput) {
    elements.adminSearchInput.addEventListener('input', renderAdminTable);
  }
  if (elements.adminFilterStatus) {
    elements.adminFilterStatus.addEventListener('change', renderAdminTable);
  }
  if (elements.adminFilterWalas) {
    elements.adminFilterWalas.addEventListener('change', renderAdminTable);
  }
  if (elements.adminFilterKelas) {
    elements.adminFilterKelas.addEventListener('change', renderAdminTable);
  }

  // Logout
  elements.btnLogout.addEventListener('click', handleLogout);
}

// ==========================================
// VIEW SWITCHER
// ==========================================
function switchView(viewId) {
  state.activeView = viewId;
  elements.viewLogin.classList.remove('active');
  elements.viewStudent.classList.remove('active');
  elements.viewProof.classList.remove('active');
  if (elements.viewWalas) elements.viewWalas.classList.remove('active');
  if (elements.viewAdmin) elements.viewAdmin.classList.remove('active');

  const targetView = document.getElementById(viewId);
  if (targetView) targetView.classList.add('active');

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateChoicePreview(choiceNumber) {
  const select = choiceNumber === 1 ? elements.selectPilihan1 : elements.selectPilihan2;
  const previewBox = choiceNumber === 1 ? elements.previewPilihan1 : elements.previewPilihan2;
  const iconEl = choiceNumber === 1 ? elements.previewIcon1 : elements.previewIcon2;
  const nameEl = choiceNumber === 1 ? elements.previewName1 : elements.previewName2;
  const groupEl = choiceNumber === 1 ? elements.previewGroup1 : elements.previewGroup2;

  const selectedVal = select.value;
  if (!selectedVal) {
    previewBox.style.display = 'none';
    return;
  }

  const subject = CONFIG.SUBJECTS.find(s => s.name === selectedVal);
  if (subject) {
    iconEl.textContent = subject.icon;
    nameEl.textContent = subject.name;
    groupEl.textContent = `Kelompok: ${subject.group}`;
    previewBox.style.display = 'flex';
  }
}

// ==========================================
// API CLIENT (CLOUDFLARE PAGES FUNCTIONS)
// ==========================================
async function callApi(endpoint, payload) {
  const baseUrl = CONFIG.API_BASE_URL || '';
  const url = `${baseUrl}/api/${endpoint}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => ({ success: false, message: 'Invalid response from server.' }));
  if (!response.ok && !data.message) {
    data.message = `HTTP Error ${response.status}`;
  }
  return data;
}

// ==========================================
// AUTHENTICATION & LOGIN
// ==========================================
async function handleLoginSubmit(e) {
  e.preventDefault();
  elements.loginError.style.display = 'none';

  const username = elements.loginUsername.value.trim();
  const password = elements.loginPassword.value.trim();

  if (!username || !password) {
    showLoginError('Username dan password wajib diisi.');
    return;
  }

  setButtonLoading(elements.btnLoginSubmit, true);

  try {
    const res = await callApi('login', { username, password });

    if (res.success) {
      state.currentUser = res.data;
      state.authCredentials = { username, password };
      sessionStorage.setItem('TKA_SESSION_USER', JSON.stringify(res.data));
      sessionStorage.setItem('TKA_SESSION_AUTH', JSON.stringify(state.authCredentials));

      if (res.role === 'admin') {
        elements.navUserDisplay.textContent = `👑 Admin Utama`;
        elements.navUserActions.style.display = 'flex';
        showToast('Selamat datang di Dasbor Admin Utama!', 'success');
        switchView('view-admin');
        fetchAdminData();
      } else if (res.role === 'walas') {
        elements.navUserDisplay.textContent = `👨‍🏫 Walas (${res.data.inisial_user})`;
        elements.navUserActions.style.display = 'flex';
        elements.walasHeaderInisial.textContent = res.data.inisial_user;
        showToast(`Selamat datang, Wali Kelas ${res.data.inisial_user}!`, 'success');
        switchView('view-walas');
        fetchWalasData();
      } else {
        // Siswa
        elements.navUserDisplay.textContent = `${res.data.first_name} (${res.data.nama_kelas})`;
        elements.navUserActions.style.display = 'flex';
        showToast(`Selamat datang, ${res.data.first_name}!`, 'success');
        loadStudentDataToUI(res.data);
        switchView('view-student');
      }
    } else {
      showLoginError(res.message || 'Login gagal. Periksa kembali username dan password Anda.');
    }
  } catch (err) {
    showLoginError(err.message || 'Gagal terhubung ke server backend.');
  } finally {
    setButtonLoading(elements.btnLoginSubmit, false);
  }
}

function showLoginError(msg) {
  elements.loginError.textContent = msg;
  elements.loginError.style.display = 'block';
}

function restoreSession() {
  const savedUser = sessionStorage.getItem('TKA_SESSION_USER');
  const savedAuth = sessionStorage.getItem('TKA_SESSION_AUTH');

  if (savedUser && savedAuth) {
    try {
      const user = JSON.parse(savedUser);
      const auth = JSON.parse(savedAuth);
      state.currentUser = user;
      state.authCredentials = auth;

      if (user.role === 'admin') {
        elements.navUserDisplay.textContent = `👑 Admin Utama`;
        elements.navUserActions.style.display = 'flex';
        switchView('view-admin');
        fetchAdminData();
      } else if (user.role === 'walas') {
        elements.navUserDisplay.textContent = `👨‍🏫 Walas (${user.inisial_user})`;
        elements.navUserActions.style.display = 'flex';
        elements.walasHeaderInisial.textContent = user.inisial_user;
        switchView('view-walas');
        fetchWalasData();
      } else {
        elements.navUserDisplay.textContent = `${user.first_name} (${user.nama_kelas})`;
        elements.navUserActions.style.display = 'flex';
        loadStudentDataToUI(user);
        switchView('view-student');
      }
    } catch (e) {
      sessionStorage.removeItem('TKA_SESSION_USER');
      sessionStorage.removeItem('TKA_SESSION_AUTH');
    }
  }
}

function handleLogout() {
  state.currentUser = null;
  state.walasData = null;
  state.adminData = null;
  state.authCredentials = null;
  sessionStorage.clear();

  elements.formLogin.reset();
  elements.formSelection.reset();
  elements.previewPilihan1.style.display = 'none';
  elements.previewPilihan2.style.display = 'none';
  elements.navUserActions.style.display = 'none';
  switchView('view-login');
  showToast('Anda telah berhasil keluar.', 'success');
}

// ==========================================
// STUDENT VIEW LOGIC
// ==========================================
function loadStudentDataToUI(student) {
  elements.studentAvatarLetter.textContent = student.first_name ? student.first_name.charAt(0).toUpperCase() : 'S';
  elements.studentDisplayName.textContent = student.first_name;
  elements.studentDisplayNis.textContent = student.username;
  elements.studentDisplayKelas.textContent = student.nama_kelas || '-';
  elements.studentDisplaySekolah.textContent = student.sekolah || '-';
  elements.studentDisplayWalas.textContent = student.inisial_user || '-';
  elements.studentTargetJurusan.textContent = student.target_jurusan || 'Belum Ditentukan';

  if (student.is_submitted && student.choice_1 && student.choice_2) {
    elements.studentStatusBadge.className = 'badge badge-success';
    elements.studentStatusBadge.textContent = '✅ SUDAH MEMILIH';
    elements.btnViewProof.style.display = 'inline-flex';
  } else {
    elements.studentStatusBadge.className = 'badge badge-warning';
    elements.studentStatusBadge.textContent = '⏳ BELUM MEMILIH';
    elements.btnViewProof.style.display = 'none';
  }

  if (student.updated_at || student.submitted_at) {
    elements.studentLastUpdate.textContent = `Tersimpan: ${student.updated_at || student.submitted_at}`;
  } else {
    elements.studentLastUpdate.textContent = '';
  }

  if (student.choice_1) {
    elements.selectPilihan1.value = student.choice_1;
    updateChoicePreview(1);
  }
  if (student.choice_2) {
    elements.selectPilihan2.value = student.choice_2;
    updateChoicePreview(2);
  }
}

async function handleSelectionSubmit(e) {
  e.preventDefault();

  if (!state.currentUser) {
    showToast('Sesi Anda berakhir, silakan login kembali.', 'error');
    switchView('view-login');
    return;
  }

  const p1 = elements.selectPilihan1.value;
  const p2 = elements.selectPilihan2.value;

  if (!p1 || !p2) {
    showToast('Harap tentukan Pilihan 1 dan Pilihan 2!', 'error');
    return;
  }

  setButtonLoading(elements.btnSubmitChoice, true);

  try {
    const res = await callApi('submit-choice', {
      username: state.currentUser.username,
      choice_1: p1,
      choice_2: p2
    });

    if (res.success) {
      state.currentUser = res.data;
      sessionStorage.setItem('TKA_SESSION_USER', JSON.stringify(res.data));
      loadStudentDataToUI(res.data);
      showToast('Pilihan mata pelajaran berhasil disimpan!', 'success');

      populateProofCard();
      switchView('view-proof');
    } else {
      showToast(res.message || 'Gagal menyimpan pilihan.', 'error');
    }
  } catch (err) {
    showToast(err.message || 'Terjadi kesalahan saat menyimpan pilihan.', 'error');
  } finally {
    setButtonLoading(elements.btnSubmitChoice, false);
  }
}

function populateProofCard() {
  const s = state.currentUser;
  if (!s) return;

  elements.proofDocId.textContent = `TKA-2026-${s.username.toUpperCase()}`;
  elements.proofNis.textContent = s.username;
  elements.proofName.textContent = s.first_name;
  elements.proofSekolah.textContent = s.sekolah || '-';
  elements.proofKelas.textContent = s.nama_kelas || '-';
  elements.proofWalas.textContent = s.inisial_user ? `Wali Kelas ${s.inisial_user}` : '-';
  elements.proofTargetJurusan.textContent = s.target_jurusan || '-';
  elements.proofTimestamp.textContent = s.updated_at || s.submitted_at || 'Baru saja';
  elements.proofVal1.textContent = s.choice_1 || '-';
  elements.proofVal2.textContent = s.choice_2 || '-';
  elements.proofSignatureName.textContent = s.first_name;
}

// ==========================================
// WALI KELAS DASHBOARD LOGIC
// ==========================================
async function fetchWalasData(showToastMsg = false) {
  if (!state.authCredentials || !state.currentUser) return;

  try {
    if (elements.btnWalasRefresh) setButtonLoading(elements.btnWalasRefresh, true);

    const res = await callApi('walas-data', {
      inisial_user: state.currentUser.inisial_user,
      password: state.authCredentials.password
    });

    if (res.success) {
      state.walasData = res.data;
      renderWalasSummary(res.data.summary);
      populateWalasKelasFilter(res.data.classes);
      renderWalasTable();
      if (showToastMsg) showToast('Data siswa binaan berhasil diperbarui.', 'success');
    } else {
      showToast(res.message || 'Gagal memuat data walas.', 'error');
    }
  } catch (err) {
    showToast('Gagal terhubung ke backend.', 'error');
  } finally {
    if (elements.btnWalasRefresh) setButtonLoading(elements.btnWalasRefresh, false);
  }
}

function renderWalasSummary(summary) {
  if (!summary) return;
  elements.walasStatTotal.textContent = summary.total;
  elements.walasStatCompleted.textContent = summary.completed;
  elements.walasStatPending.textContent = summary.pending;
  elements.walasStatPercent.textContent = `${summary.percent}%`;
}

function populateWalasKelasFilter(classes) {
  if (!classes || !elements.walasFilterKelas) return;
  const currentVal = elements.walasFilterKelas.value;
  let options = '<option value="ALL">Semua Kelas Binaan</option>';
  classes.forEach(k => {
    options += `<option value="${k}">Kelas ${k}</option>`;
  });
  elements.walasFilterKelas.innerHTML = options;
  if (classes.includes(currentVal)) {
    elements.walasFilterKelas.value = currentVal;
  }
}

function renderWalasTable() {
  if (!state.walasData || !state.walasData.students || !elements.walasStudentTbody) return;

  const searchQuery = (elements.walasSearchInput ? elements.walasSearchInput.value : '').toLowerCase().trim();
  const statusFilter = elements.walasFilterStatus ? elements.walasFilterStatus.value : 'ALL';
  const kelasFilter = elements.walasFilterKelas ? elements.walasFilterKelas.value : 'ALL';

  const filtered = state.walasData.students.filter(s => {
    const matchSearch = !searchQuery ||
      String(s.first_name || '').toLowerCase().includes(searchQuery) ||
      String(s.username || '').toLowerCase().includes(searchQuery) ||
      String(s.sekolah || '').toLowerCase().includes(searchQuery) ||
      String(s.target_jurusan || '').toLowerCase().includes(searchQuery);

    const isDone = s.is_submitted && s.choice_1 && s.choice_2;
    const matchStatus = statusFilter === 'ALL' || (statusFilter === 'SUDAH' ? isDone : !isDone);
    const matchKelas = kelasFilter === 'ALL' || s.nama_kelas === kelasFilter;

    return matchSearch && matchStatus && matchKelas;
  });

  if (elements.walasShowingCount) {
    elements.walasShowingCount.textContent = `Menampilkan ${filtered.length} dari ${state.walasData.students.length} siswa binaan`;
  }

  if (filtered.length === 0) {
    elements.walasStudentTbody.innerHTML = `
      <tr>
        <td colspan="9" style="text-align: center; padding: 2rem; color: #94a3b8;">
          Tidak ada data siswa binaan yang cocok dengan kriteria filter.
        </td>
      </tr>
    `;
    return;
  }

  const rows = filtered.map((s, idx) => {
    const isDone = s.is_submitted && s.choice_1 && s.choice_2;
    const statusBadge = isDone 
      ? '<span class="badge badge-success">✅ SUDAH</span>' 
      : '<span class="badge badge-warning">⏳ BELUM</span>';

    return `
      <tr>
        <td style="font-weight: 600; color: #64748b;">${idx + 1}</td>
        <td style="font-family: monospace; font-weight: 700;">${s.username}</td>
        <td style="font-weight: 700;">${s.first_name}</td>
        <td><span class="badge badge-purple">${s.nama_kelas || '-'}</span></td>
        <td style="font-size: 0.8rem; color: #475569;">${s.sekolah || '-'}</td>
        <td style="font-size: 0.8rem; font-weight: 600; color: #15803d;">${s.target_jurusan || '-'}</td>
        <td>${s.choice_1 ? `<strong>${s.choice_1}</strong>` : '<span style="color: #cbd5e1;">-</span>'}</td>
        <td>${s.choice_2 ? `<strong>${s.choice_2}</strong>` : '<span style="color: #cbd5e1;">-</span>'}</td>
        <td>${statusBadge}</td>
      </tr>
    `;
  }).join('');

  elements.walasStudentTbody.innerHTML = rows;
}

function exportWalasCSV() {
  if (!state.walasData || !state.walasData.students) return;

  const inisial = state.currentUser.inisial_user;
  const headers = ['No', 'NIS', 'Nama Siswa', 'Kelas', 'Asal Sekolah', 'Walas', 'Target Prodi PTN', 'Pilihan 1', 'Pilihan 2', 'Status', 'Waktu Simpan'];
  const rows = state.walasData.students.map((s, idx) => [
    idx + 1,
    `"${s.username}"`,
    `"${s.first_name}"`,
    `"${s.nama_kelas}"`,
    `"${s.sekolah || ''}"`,
    `"${s.inisial_user}"`,
    `"${s.target_jurusan || ''}"`,
    `"${s.choice_1 || ''}"`,
    `"${s.choice_2 || ''}"`,
    `"${s.is_submitted ? 'SUDAH' : 'BELUM'}"`,
    `"${s.updated_at || s.submitted_at || ''}"`
  ]);

  const csv = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  downloadBlob(csv, `Rekap_TKA_Walas_${inisial}_${new Date().toISOString().slice(0,10)}.csv`, 'text/csv');
  showToast('File CSV siswa binaan berhasil diunduh.', 'success');
}

// ==========================================
// ADMIN DASHBOARD LOGIC
// ==========================================
async function fetchAdminData(showToastMsg = false) {
  if (!state.authCredentials) return;

  try {
    if (elements.btnAdminRefresh) setButtonLoading(elements.btnAdminRefresh, true);

    const res = await callApi('admin-data', {
      password: state.authCredentials.password
    });

    if (res.success) {
      state.adminData = res.data;
      renderAdminSummary(res.data.summary);
      renderAdminSubjectStats(res.data.subject_stats);
      renderAdminWalasProgress(res.data.walas_progress);
      populateAdminFilters(res.data.walas_progress, res.data.classes);
      renderAdminTable();
      if (showToastMsg) showToast('Master data rekapitulasi berhasil diperbarui.', 'success');
    } else {
      showToast(res.message || 'Gagal memuat master data admin.', 'error');
    }
  } catch (err) {
    showToast('Gagal terhubung ke backend.', 'error');
  } finally {
    if (elements.btnAdminRefresh) setButtonLoading(elements.btnAdminRefresh, false);
  }
}

function renderAdminSummary(summary) {
  if (!summary) return;
  elements.adminStatTotal.textContent = summary.total;
  elements.adminStatCompleted.textContent = summary.completed;
  elements.adminStatPending.textContent = summary.pending;
  elements.adminStatPercent.textContent = `${summary.percent}%`;
}

function renderAdminSubjectStats(stats) {
  if (!stats || !elements.adminSubjectStatsContainer) return;

  const html = CONFIG.SUBJECTS.map(subj => {
    const stat = stats[subj.name] || { total: 0, choice_1: 0, choice_2: 0 };
    return `
      <div class="subject-stat-item">
        <div class="subject-stat-name">
          <span>${subj.icon}</span>
          <span>${subj.name}</span>
        </div>
        <div class="subject-stat-count" title="Pilihan 1: ${stat.choice_1} | Pilihan 2: ${stat.choice_2}">
          ${stat.total} Kursi
        </div>
      </div>
    `;
  }).join('');

  elements.adminSubjectStatsContainer.innerHTML = html;
}

function renderAdminWalasProgress(walasList) {
  if (!walasList || !elements.adminWalasProgressContainer) return;

  const html = walasList.map(w => `
    <div class="walas-card-item">
      <div class="walas-header">
        <strong style="color: #0f172a; font-size: 0.9rem;">Walas ${w.inisial}</strong>
        <span style="font-size: 0.8rem; font-weight: 700; color: #4f46e5;">${w.percent}% (${w.completed}/${w.total})</span>
      </div>
      <div class="progress-bar-bg">
        <div class="progress-bar-fill" style="width: ${w.percent}%;"></div>
      </div>
    </div>
  `).join('');

  elements.adminWalasProgressContainer.innerHTML = html;
}

function populateAdminFilters(walasList, classes) {
  if (walasList && elements.adminFilterWalas) {
    const currentVal = elements.adminFilterWalas.value;
    let options = '<option value="ALL">Semua Walas</option>';
    walasList.forEach(w => {
      options += `<option value="${w.inisial}">Walas ${w.inisial}</option>`;
    });
    elements.adminFilterWalas.innerHTML = options;
    if (walasList.some(w => w.inisial === currentVal)) elements.adminFilterWalas.value = currentVal;
  }

  if (classes && elements.adminFilterKelas) {
    const currentVal = elements.adminFilterKelas.value;
    let options = '<option value="ALL">Semua Kelas</option>';
    classes.forEach(k => {
      options += `<option value="${k}">Kelas ${k}</option>`;
    });
    elements.adminFilterKelas.innerHTML = options;
    if (classes.includes(currentVal)) elements.adminFilterKelas.value = currentVal;
  }
}

function renderAdminTable() {
  if (!state.adminData || !state.adminData.students || !elements.adminStudentTbody) return;

  const searchQuery = (elements.adminSearchInput ? elements.adminSearchInput.value : '').toLowerCase().trim();
  const statusFilter = elements.adminFilterStatus ? elements.adminFilterStatus.value : 'ALL';
  const walasFilter = elements.adminFilterWalas ? elements.adminFilterWalas.value : 'ALL';
  const kelasFilter = elements.adminFilterKelas ? elements.adminFilterKelas.value : 'ALL';

  const filtered = state.adminData.students.filter(s => {
    const matchSearch = !searchQuery ||
      String(s.first_name || '').toLowerCase().includes(searchQuery) ||
      String(s.username || '').toLowerCase().includes(searchQuery) ||
      String(s.sekolah || '').toLowerCase().includes(searchQuery) ||
      String(s.target_jurusan || '').toLowerCase().includes(searchQuery);

    const isDone = s.is_submitted && s.choice_1 && s.choice_2;
    const matchStatus = statusFilter === 'ALL' || (statusFilter === 'SUDAH' ? isDone : !isDone);
    const matchWalas = walasFilter === 'ALL' || s.inisial_user === walasFilter;
    const matchKelas = kelasFilter === 'ALL' || s.nama_kelas === kelasFilter;

    return matchSearch && matchStatus && matchWalas && matchKelas;
  });

  if (elements.adminShowingCount) {
    elements.adminShowingCount.textContent = `Menampilkan ${filtered.length} dari ${state.adminData.students.length} total siswa`;
  }

  if (filtered.length === 0) {
    elements.adminStudentTbody.innerHTML = `
      <tr>
        <td colspan="10" style="text-align: center; padding: 2rem; color: #94a3b8;">
          Tidak ada data yang cocok dengan kriteria pencarian / filter.
        </td>
      </tr>
    `;
    return;
  }

  const rows = filtered.map((s, idx) => {
    const isDone = s.is_submitted && s.choice_1 && s.choice_2;
    const statusBadge = isDone 
      ? '<span class="badge badge-success">✅ SUDAH</span>' 
      : '<span class="badge badge-warning">⏳ BELUM</span>';

    return `
      <tr>
        <td style="font-weight: 600; color: #64748b;">${idx + 1}</td>
        <td style="font-family: monospace; font-weight: 700;">${s.username}</td>
        <td style="font-weight: 700;">${s.first_name}</td>
        <td><span class="badge badge-purple">${s.nama_kelas || '-'}</span></td>
        <td><span class="badge badge-warning">${s.inisial_user || '-'}</span></td>
        <td style="font-size: 0.8rem; font-weight: 600; color: #15803d;">${s.target_jurusan || '-'}</td>
        <td>${s.choice_1 ? `<strong>${s.choice_1}</strong>` : '<span style="color: #cbd5e1;">-</span>'}</td>
        <td>${s.choice_2 ? `<strong>${s.choice_2}</strong>` : '<span style="color: #cbd5e1;">-</span>'}</td>
        <td>${statusBadge}</td>
        <td style="font-size: 0.75rem; color: #64748b;">${s.updated_at || s.submitted_at || '-'}</td>
      </tr>
    `;
  }).join('');

  elements.adminStudentTbody.innerHTML = rows;
}

function exportAdminCSV() {
  if (!state.adminData || !state.adminData.students) return;

  const headers = ['No', 'NIS', 'Nama Siswa', 'Asal Sekolah', 'Kelas', 'Cabang', 'Walas', 'Target Prodi PTN', 'Pilihan 1', 'Pilihan 2', 'Status', 'Waktu Submit'];
  const rows = state.adminData.students.map((s, idx) => [
    idx + 1,
    `"${s.username}"`,
    `"${s.first_name}"`,
    `"${s.sekolah || ''}"`,
    `"${s.nama_kelas}"`,
    `"${s.nama_cabang || 'KEBAYORAN'}"`,
    `"${s.inisial_user}"`,
    `"${s.target_jurusan || ''}"`,
    `"${s.choice_1 || ''}"`,
    `"${s.choice_2 || ''}"`,
    `"${s.is_submitted ? 'SUDAH' : 'BELUM'}"`,
    `"${s.updated_at || s.submitted_at || ''}"`
  ]);

  const csv = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  downloadBlob(csv, `Master_Rekap_TKA_Kebayoran_${new Date().toISOString().slice(0,10)}.csv`, 'text/csv');
  showToast('Seluruh Master Data berhasil diunduh.', 'success');
}

// ==========================================
// UTILITIES
// ==========================================
function downloadBlob(content, filename, contentType) {
  const blob = new Blob([content], { type: `${contentType};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function setButtonLoading(btn, isLoading) {
  const textEl = btn.querySelector('.btn-text');
  const spinnerEl = btn.querySelector('.spinner');

  if (isLoading) {
    btn.disabled = true;
    if (textEl) textEl.style.opacity = '0.5';
    if (spinnerEl) spinnerEl.style.display = 'inline-block';
  } else {
    btn.disabled = false;
    if (textEl) textEl.style.opacity = '1';
    if (spinnerEl) spinnerEl.style.display = 'none';
  }
}

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
  toast.innerHTML = `<span>${icon}</span> <div>${message}</div>`;

  elements.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
