/**
 * Frontend Logic - Web Pemilihan Mata Pelajaran TKA
 */

// Application State
const state = {
  currentUser: null,
  adminData: null,
  adminAuth: null,
  scriptUrl: localStorage.getItem('GAS_SCRIPT_URL') || CONFIG.SCRIPT_URL || '',
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
  setupWarning: document.getElementById('setup-warning'),
  linkOpenConfigModal: document.getElementById('link-open-config-modal'),

  // Views
  viewLogin: document.getElementById('view-login'),
  viewDashboard: document.getElementById('view-dashboard'),
  viewProof: document.getElementById('view-proof'),
  viewAdmin: document.getElementById('view-admin'),

  // Login Form
  formLogin: document.getElementById('form-login'),
  loginUsername: document.getElementById('login-username'),
  loginPassword: document.getElementById('login-password'),
  btnLoginSubmit: document.getElementById('btn-login-submit'),
  btnTogglePass: document.getElementById('btn-toggle-pass'),
  loginError: document.getElementById('login-error'),

  // Student Dashboard / Selection Form
  studentAvatarLetter: document.getElementById('student-avatar-letter'),
  studentDisplayName: document.getElementById('student-display-name'),
  studentDisplayNis: document.getElementById('student-display-nis'),
  studentDisplayKelas: document.getElementById('student-display-kelas'),
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
  proofSchoolName: document.getElementById('proof-school-name'),
  proofDocId: document.getElementById('proof-doc-id'),
  proofNis: document.getElementById('proof-nis'),
  proofName: document.getElementById('proof-name'),
  proofKelas: document.getElementById('proof-kelas'),
  proofTimestamp: document.getElementById('proof-timestamp'),
  proofStatus: document.getElementById('proof-status'),
  proofVal1: document.getElementById('proof-val-1'),
  proofVal2: document.getElementById('proof-val-2'),
  proofSignatureName: document.getElementById('proof-signature-name'),
  btnBackToEdit: document.getElementById('btn-back-to-edit'),
  btnPrintProof: document.getElementById('btn-print-proof'),

  // Admin Dashboard Elements
  btnAdminRefresh: document.getElementById('btn-admin-refresh'),
  btnAdminExport: document.getElementById('btn-admin-export'),
  btnAdminPrint: document.getElementById('btn-admin-print'),
  statTotalStudents: document.getElementById('stat-total-students'),
  statCompletedStudents: document.getElementById('stat-completed-students'),
  statPendingStudents: document.getElementById('stat-pending-students'),
  statPercentProgress: document.getElementById('stat-percent-progress'),
  adminSubjectStatsContainer: document.getElementById('admin-subject-stats-container'),
  adminSearchInput: document.getElementById('admin-search-input'),
  adminFilterStatus: document.getElementById('admin-filter-status'),
  adminFilterKelas: document.getElementById('admin-filter-kelas'),
  adminShowingCount: document.getElementById('admin-showing-count'),
  adminStudentTbody: document.getElementById('admin-student-tbody'),

  // Modal Config
  configModal: document.getElementById('config-modal'),
  inputCustomScriptUrl: document.getElementById('input-custom-script-url'),
  btnSaveConfig: document.getElementById('btn-save-config'),
  btnCancelConfig: document.getElementById('btn-cancel-config'),

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
  checkScriptUrlConfig();
  restoreSession();
});

function initAppMeta() {
  if (CONFIG.APP_TITLE) elements.navAppTitle.textContent = CONFIG.APP_TITLE;
  if (CONFIG.INSTITUTION_NAME) {
    elements.navInstName.textContent = CONFIG.INSTITUTION_NAME;
    elements.proofSchoolName.textContent = CONFIG.INSTITUTION_NAME;
  }
}

function checkScriptUrlConfig() {
  if (!state.scriptUrl) {
    elements.setupWarning.style.display = 'block';
  } else {
    elements.setupWarning.style.display = 'none';
  }
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
  // Toggle Password Visibility
  elements.btnTogglePass.addEventListener('click', () => {
    const isPassword = elements.loginPassword.type === 'password';
    elements.loginPassword.type = isPassword ? 'text' : 'password';
    elements.btnTogglePass.textContent = isPassword ? '🙈' : '👁️';
  });

  // Login Submit
  elements.formLogin.addEventListener('submit', handleLoginSubmit);

  // Dropdown Change Previews
  elements.selectPilihan1.addEventListener('change', () => updateChoicePreview(1));
  elements.selectPilihan2.addEventListener('change', () => updateChoicePreview(2));

  // Submit Choices
  elements.formSelection.addEventListener('submit', handleSelectionSubmit);

  // Proof View & Print Actions
  elements.btnViewProof.addEventListener('click', () => {
    populateProofCard();
    switchView('view-proof');
  });

  elements.btnBackToEdit.addEventListener('click', () => {
    switchView('view-dashboard');
  });

  elements.btnPrintProof.addEventListener('click', () => {
    window.print();
  });

  // Admin Actions
  if (elements.btnAdminRefresh) {
    elements.btnAdminRefresh.addEventListener('click', () => fetchAdminRecap(true));
  }
  if (elements.btnAdminExport) {
    elements.btnAdminExport.addEventListener('click', exportAdminCSV);
  }
  if (elements.btnAdminPrint) {
    elements.btnAdminPrint.addEventListener('click', () => window.print());
  }

  // Admin Filters
  if (elements.adminSearchInput) {
    elements.adminSearchInput.addEventListener('input', renderAdminTable);
  }
  if (elements.adminFilterStatus) {
    elements.adminFilterStatus.addEventListener('change', renderAdminTable);
  }
  if (elements.adminFilterKelas) {
    elements.adminFilterKelas.addEventListener('change', renderAdminTable);
  }

  // Logout
  elements.btnLogout.addEventListener('click', handleLogout);

  // Config Modal
  elements.linkOpenConfigModal.addEventListener('click', (e) => {
    e.preventDefault();
    elements.inputCustomScriptUrl.value = state.scriptUrl;
    elements.configModal.classList.add('active');
  });

  elements.btnCancelConfig.addEventListener('click', () => {
    elements.configModal.classList.remove('active');
  });

  elements.btnSaveConfig.addEventListener('click', () => {
    const url = elements.inputCustomScriptUrl.value.trim();
    if (url) {
      state.scriptUrl = url;
      localStorage.setItem('GAS_SCRIPT_URL', url);
      elements.configModal.classList.remove('active');
      checkScriptUrlConfig();
      showToast('URL Web App Google Apps Script berhasil disimpan!', 'success');
    }
  });
}

// ==========================================
// VIEW SWITCHER & HELPERS
// ==========================================
function switchView(viewId) {
  state.activeView = viewId;
  elements.viewLogin.classList.remove('active');
  elements.viewDashboard.classList.remove('active');
  elements.viewProof.classList.remove('active');
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
// API CALL HELPER (GAS CORS-FRIENDLY)
// ==========================================
async function callGasApi(payload) {
  const url = state.scriptUrl;
  if (!url) {
    throw new Error('URL Google Apps Script belum dikonfigurasi. Silakan atur URL Web App terlebih dahulu.');
  }

  // Menggunakan 'text/plain;charset=utf-8' untuk menghindari CORS preflight OPTIONS request pada GAS
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
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
    const res = await callGasApi({
      action: 'login',
      username: username,
      password: password
    });

    if (res.success) {
      if (res.role === 'admin') {
        state.currentUser = res.data;
        state.adminAuth = { username: username, password: password };
        sessionStorage.setItem('TKA_SESSION_USER', JSON.stringify(res.data));
        sessionStorage.setItem('TKA_SESSION_ADMIN_AUTH', JSON.stringify(state.adminAuth));
        
        elements.navUserDisplay.textContent = `👑 Administrator`;
        elements.navUserActions.style.display = 'flex';

        showToast('Login Administrator Berhasil!', 'success');
        switchView('view-admin');
        fetchAdminRecap();
      } else {
        state.currentUser = res.data;
        sessionStorage.setItem('TKA_SESSION_USER', JSON.stringify(res.data));
        showToast('Selamat datang, ' + res.data.nama_lengkap, 'success');
        loadUserDataToUI(res.data);
        switchView('view-dashboard');
      }
    } else {
      showLoginError(res.message || 'Login gagal. Periksa kembali NIS dan Password Anda.');
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
  const saved = sessionStorage.getItem('TKA_SESSION_USER');
  const savedAdminAuth = sessionStorage.getItem('TKA_SESSION_ADMIN_AUTH');

  if (saved) {
    try {
      const user = JSON.parse(saved);
      state.currentUser = user;

      if (user.role === 'admin') {
        if (savedAdminAuth) state.adminAuth = JSON.parse(savedAdminAuth);
        elements.navUserDisplay.textContent = `👑 Administrator`;
        elements.navUserActions.style.display = 'flex';
        switchView('view-admin');
        fetchAdminRecap();
      } else {
        loadUserDataToUI(user);
        switchView('view-dashboard');
      }
    } catch (e) {
      sessionStorage.removeItem('TKA_SESSION_USER');
    }
  }
}

function handleLogout() {
  state.currentUser = null;
  state.adminData = null;
  state.adminAuth = null;
  sessionStorage.removeItem('TKA_SESSION_USER');
  sessionStorage.removeItem('TKA_SESSION_ADMIN_AUTH');
  elements.formLogin.reset();
  elements.formSelection.reset();
  elements.previewPilihan1.style.display = 'none';
  elements.previewPilihan2.style.display = 'none';
  elements.navUserActions.style.display = 'none';
  switchView('view-login');
  showToast('Anda telah keluar.', 'success');
}

// ==========================================
// DASHBOARD & SELECTION LOGIC
// ==========================================
function loadUserDataToUI(user) {
  // Nav bar user badge
  elements.navUserDisplay.textContent = `${user.nama_lengkap} (${user.kelas})`;
  elements.navUserActions.style.display = 'flex';

  // Dashboard Student Profile Card
  elements.studentAvatarLetter.textContent = user.nama_lengkap ? user.nama_lengkap.charAt(0).toUpperCase() : 'S';
  elements.studentDisplayName.textContent = user.nama_lengkap;
  elements.studentDisplayNis.textContent = user.username;
  elements.studentDisplayKelas.textContent = user.kelas;

  // Status Badge
  const hasSelected = user.pilihan_1 && user.pilihan_2;
  if (hasSelected) {
    elements.studentStatusBadge.className = 'badge badge-success';
    elements.studentStatusBadge.textContent = '✅ SUDAH MEMILIH';
    elements.btnViewProof.style.display = 'inline-flex';
  } else {
    elements.studentStatusBadge.className = 'badge badge-warning';
    elements.studentStatusBadge.textContent = '⏳ BELUM MEMILIH';
    elements.btnViewProof.style.display = 'none';
  }

  if (user.updated_at) {
    elements.studentLastUpdate.textContent = `Terakhir disimpan: ${user.updated_at}`;
  } else {
    elements.studentLastUpdate.textContent = '';
  }

  // Pre-fill selection dropdowns if exists
  if (user.pilihan_1) {
    elements.selectPilihan1.value = user.pilihan_1;
    updateChoicePreview(1);
  }
  if (user.pilihan_2) {
    elements.selectPilihan2.value = user.pilihan_2;
    updateChoicePreview(2);
  }
}

async function handleSelectionSubmit(e) {
  e.preventDefault();

  if (!state.currentUser) {
    showToast('Sesi telah berakhir, silakan login kembali.', 'error');
    switchView('view-login');
    return;
  }

  const p1 = elements.selectPilihan1.value;
  const p2 = elements.selectPilihan2.value;

  if (!p1 || !p2) {
    showToast('Harap pilih mata pelajaran untuk Pilihan 1 dan Pilihan 2!', 'error');
    return;
  }

  setButtonLoading(elements.btnSubmitChoice, true);

  try {
    const res = await callGasApi({
      action: 'submit_choice',
      username: state.currentUser.username,
      pilihan_1: p1,
      pilihan_2: p2
    });

    if (res.success) {
      state.currentUser = res.data;
      sessionStorage.setItem('TKA_SESSION_USER', JSON.stringify(res.data));
      loadUserDataToUI(res.data);
      showToast('Pilihan mata pelajaran berhasil disimpan!', 'success');

      // Tampilkan kartu bukti pendaftaran
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

// ==========================================
// PROOF / CERTIFICATE FORMATTING
// ==========================================
function populateProofCard() {
  const user = state.currentUser;
  if (!user) return;

  const docId = `TKA-${user.username}-${new Date().getFullYear()}`;
  elements.proofDocId.textContent = docId;
  elements.proofNis.textContent = user.username;
  elements.proofName.textContent = user.nama_lengkap;
  elements.proofKelas.textContent = user.kelas;
  elements.proofTimestamp.textContent = user.updated_at || 'Baru saja disimpan';
  elements.proofVal1.textContent = user.pilihan_1 || '-';
  elements.proofVal2.textContent = user.pilihan_2 || '-';
  elements.proofSignatureName.textContent = user.nama_lengkap;
}

// ==========================================
// ADMIN DASHBOARD LOGIC
// ==========================================
async function fetchAdminRecap(showSuccessToast = false) {
  if (!state.adminAuth || !state.adminAuth.password) return;

  try {
    if (elements.btnAdminRefresh) setButtonLoading(elements.btnAdminRefresh, true);

    const res = await callGasApi({
      action: 'admin_get_recap',
      password: state.adminAuth.password
    });

    if (res.success) {
      state.adminData = res;
      renderAdminSummary(res.summary);
      renderAdminSubjectStats(res.subjects_stats);
      populateAdminKelasFilter(res.students);
      renderAdminTable();
      if (showSuccessToast) showToast('Data rekapitulasi berhasil diperbarui.', 'success');
    } else {
      showToast(res.message || 'Gagal memuat rekapitulasi.', 'error');
    }
  } catch (err) {
    showToast('Gagal terhubung ke backend untuk rekap admin.', 'error');
  } finally {
    if (elements.btnAdminRefresh) setButtonLoading(elements.btnAdminRefresh, false);
  }
}

function renderAdminSummary(summary) {
  if (!summary) return;
  elements.statTotalStudents.textContent = summary.total;
  elements.statCompletedStudents.textContent = summary.sudah;
  elements.statPendingStudents.textContent = summary.belum;
  elements.statPercentProgress.textContent = `${summary.percent}%`;
}

function renderAdminSubjectStats(stats) {
  if (!stats || !elements.adminSubjectStatsContainer) return;

  const html = CONFIG.SUBJECTS.map(subj => {
    const stat = stats[subj.name] || { total: 0, pilihan_1: 0, pilihan_2: 0 };
    return `
      <div class="subject-stat-item">
        <div class="subject-stat-name">
          <span>${subj.icon}</span>
          <span>${subj.name}</span>
        </div>
        <div class="subject-stat-count" title="Pilihan 1: ${stat.pilihan_1}, Pilihan 2: ${stat.pilihan_2}">
          ${stat.total} Siswa
        </div>
      </div>
    `;
  }).join('');

  elements.adminSubjectStatsContainer.innerHTML = html;
}

function populateAdminKelasFilter(students) {
  if (!students || !elements.adminFilterKelas) return;
  const currentVal = elements.adminFilterKelas.value;

  const uniqueKelas = [...new Set(students.map(s => s.kelas).filter(Boolean))].sort();
  let options = '<option value="ALL">Semua Kelas</option>';
  uniqueKelas.forEach(k => {
    options += `<option value="${k}">${k}</option>`;
  });
  elements.adminFilterKelas.innerHTML = options;

  if (uniqueKelas.includes(currentVal)) {
    elements.adminFilterKelas.value = currentVal;
  }
}

function renderAdminTable() {
  if (!state.adminData || !state.adminData.students || !elements.adminStudentTbody) return;

  const searchQuery = (elements.adminSearchInput ? elements.adminSearchInput.value : '').toLowerCase().trim();
  const statusFilter = elements.adminFilterStatus ? elements.adminFilterStatus.value : 'ALL';
  const kelasFilter = elements.adminFilterKelas ? elements.adminFilterKelas.value : 'ALL';

  const filtered = state.adminData.students.filter(s => {
    const matchSearch = !searchQuery || 
      String(s.nama_lengkap || '').toLowerCase().includes(searchQuery) || 
      String(s.username || '').toLowerCase().includes(searchQuery);

    const matchStatus = statusFilter === 'ALL' || s.status_isi === statusFilter;
    const matchKelas = kelasFilter === 'ALL' || s.kelas === kelasFilter;

    return matchSearch && matchStatus && matchKelas;
  });

  if (elements.adminShowingCount) {
    elements.adminShowingCount.textContent = `Menampilkan ${filtered.length} dari ${state.adminData.students.length} siswa`;
  }

  if (filtered.length === 0) {
    elements.adminStudentTbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 2rem; color: #94a3b8;">
          Tidak ada data siswa yang cocok dengan kriteria pencarian / filter.
        </td>
      </tr>
    `;
    return;
  }

  const rows = filtered.map((s, idx) => {
    const isCompleted = s.status_isi === 'SUDAH';
    const statusBadge = isCompleted 
      ? '<span class="badge badge-success">✅ SUDAH</span>' 
      : '<span class="badge badge-warning">⏳ BELUM</span>';

    return `
      <tr>
        <td style="font-weight: 600; color: #64748b;">${idx + 1}</td>
        <td style="font-family: monospace; font-weight: 700;">${s.username}</td>
        <td style="font-weight: 600;">${s.nama_lengkap}</td>
        <td><span class="badge badge-info">${s.kelas || '-'}</span></td>
        <td>${s.pilihan_1 ? `<strong>${s.pilihan_1}</strong>` : '<span style="color: #cbd5e1;">-</span>'}</td>
        <td>${s.pilihan_2 ? `<strong>${s.pilihan_2}</strong>` : '<span style="color: #cbd5e1;">-</span>'}</td>
        <td>${statusBadge}</td>
        <td style="font-size: 0.8rem; color: #64748b;">${s.updated_at || '-'}</td>
      </tr>
    `;
  }).join('');

  elements.adminStudentTbody.innerHTML = rows;
}

function exportAdminCSV() {
  if (!state.adminData || !state.adminData.students) {
    showToast('Data belum tersedia untuk diekspor.', 'error');
    return;
  }

  const headers = ['No', 'Username/NIS', 'Nama Lengkap', 'Kelas', 'Pilihan 1', 'Pilihan 2', 'Status', 'Waktu Simpan'];
  const rows = state.adminData.students.map((s, idx) => [
    idx + 1,
    `"${s.username}"`,
    `"${s.nama_lengkap}"`,
    `"${s.kelas}"`,
    `"${s.pilihan_1 || ''}"`,
    `"${s.pilihan_2 || ''}"`,
    `"${s.status_isi}"`,
    `"${s.updated_at || ''}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Rekap_Pemilihan_TKA_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('File CSV Rekap berhasil diunduh.', 'success');
}

// ==========================================
// UI UTILITIES
// ==========================================
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
