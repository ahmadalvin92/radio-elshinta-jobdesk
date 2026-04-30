import "./styles.css";

const apiBaseUrls = [
  import.meta.env.VITE_API_BASE_URL,
  "http://127.0.0.1:8001",
  "http://127.0.0.1:8000",
].filter(Boolean);

let activeApiBaseUrl = apiBaseUrls[0];

const jobTypes = [
  "Backup data",
  "Cek jaringan",
  "Maintenance komputer",
  "Update aplikasi",
  "Install software",
  "Troubleshooting",
];

const state = {
  assets: [],
  jobs: [],
  users: [],
  currentUser: readStoredUser(),
  selectedLogin: "",
  activeView: "dashboard",
  showPasswordForm: false,
  passwordMessage: "",
  editingUserId: null,
  userMessage: "",
  editingJobId: null,
  jobMessage: "",
  dashboardFilter: {
    period: "all",
    date: new Date().toISOString().slice(0, 10),
    week: getCurrentWeekValue(),
    month: new Date().toISOString().slice(0, 7),
  },
  rekapFilter: {
    period: "all",
    date: new Date().toISOString().slice(0, 10),
    week: getCurrentWeekValue(),
    month: new Date().toISOString().slice(0, 7),
  },
};

const formatDate = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "2-digit",
  month: "long",
  year: "numeric",
});

async function fetchJson(path, options = {}) {
  let lastError;

  for (const baseUrl of apiBaseUrls) {
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.message ?? `Request gagal: ${response.status}`);
      }

      activeApiBaseUrl = baseUrl;
      return payload;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError ?? new Error("Backend Laravel belum aktif.");
}

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("elshinta_user"));
  } catch {
    return null;
  }
}

function storeUser(user) {
  localStorage.setItem("elshinta_user", JSON.stringify(user));
  state.currentUser = user;
}

function logout() {
  localStorage.removeItem("elshinta_user");
  state.currentUser = null;
  state.activeView = "dashboard";
  state.showPasswordForm = false;
  state.passwordMessage = "";
  renderLogin();
  loadUsers();
}

function isAdmin() {
  return state.currentUser?.role === "admin";
}

function h(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function loadUsers() {
  try {
    state.users = await fetchJson("/api/users");
    renderLogin();
  } catch {
    state.users = [];
    renderLogin("Jalankan backend Laravel dulu supaya daftar akun muncul.");
  }
}

async function loadData() {
  try {
    const [assets, jobs, users] = await Promise.all([
      fetchJson("/api/computer-assets"),
      fetchJson("/api/daily-jobs"),
      fetchJson("/api/users"),
    ]);

    state.assets = assets.data ?? assets;
    state.jobs = jobs.data ?? jobs;
    state.users = users.data ?? users;
    renderDashboard();
  } catch (error) {
    renderLogin(error.message);
  }
}

function getVisibleJobs() {
  if (isAdmin()) {
    return state.jobs;
  }

  return state.jobs.filter((job) => {
    const assetName = job.computer_asset?.pc_name?.toLowerCase();
    return assetName === state.currentUser?.name?.toLowerCase();
  });
}

function getStatusLabel(status) {
  return {
    pending: "Menunggu",
    approved: "Approved",
    rejected: "Rejected",
    draft: "Draft",
  }[status] ?? status;
}

function getStats(jobs) {
  return {
    total: jobs.length,
    pending: jobs.filter((job) => job.status === "pending").length,
    approved: jobs.filter((job) => job.status === "approved").length,
    assets: state.assets.length,
  };
}

function setActiveView(view) {
  state.activeView = view;
  state.showPasswordForm = false;
  state.passwordMessage = "";
  state.editingUserId = null;
  state.userMessage = "";
  state.editingJobId = null;
  state.jobMessage = "";
  renderDashboard();
}

function togglePasswordForm() {
  state.showPasswordForm = !state.showPasswordForm;
  state.passwordMessage = "";
  renderDashboard();
}

function formatJobDate(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getCurrentWeekValue() {
  const date = new Date();
  const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNumber = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - dayNumber);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  const weekNumber = Math.ceil((((target - yearStart) / 86400000) + 1) / 7);

  return `${target.getUTCFullYear()}-W${String(weekNumber).padStart(2, "0")}`;
}

function getFilteredJobs(jobs, filter) {
  const { period, date, week, month } = filter;

  if (period === "day") {
    return jobs.filter((job) => String(job.job_date ?? "").slice(0, 10) === date);
  }

  if (period === "month") {
    return jobs.filter((job) => String(job.job_date ?? "").slice(0, 7) === month);
  }

  if (period === "week") {
    return jobs.filter((job) => getWeekValue(job.job_date) === week);
  }

  return jobs;
}

function getRekapJobs(jobs) {
  return getFilteredJobs(jobs, state.rekapFilter);
}

function getWeekValue(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNumber = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - dayNumber);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  const weekNumber = Math.ceil((((target - yearStart) / 86400000) + 1) / 7);

  return `${target.getUTCFullYear()}-W${String(weekNumber).padStart(2, "0")}`;
}

function getRekapQueryString() {
  const params = new URLSearchParams();
  const { period, date, week, month } = state.rekapFilter;

  params.set("period", period);

  if (period === "day") {
    params.set("date", date);
  }

  if (period === "week") {
    params.set("week", week);
  }

  if (period === "month") {
    params.set("month", month);
  }

  return params.toString();
}

function renderLogin(errorMessage = "") {
  const adminOptions = state.users.filter((user) => user.role === "admin");
  const userOptions = state.users.filter((user) => user.role === "user");

  document.querySelector("#app").innerHTML = `
    <main class="login-page">
      <section class="login-visual">
        <div class="login-brand">
          <img src="/logo-elshinta.png" alt="Radio Elshinta" />
          <div>
            <strong>Radio Elshinta</strong>
            <span>Daily Backup & Jobdesk</span>
          </div>
        </div>
        <div class="login-copy">
          <span>Admin input. User approve. Rekap PDF siap cetak.</span>
          <h1>Monitoring pekerjaan harian dengan alur approval yang rapi.</h1>
        </div>
        <p class="developer-credit">Develop by Alvin dan IT Support Tim 2026 with love</p>
      </section>

      <section class="login-panel">
        <form id="login-form" class="auth-card">
          <div>
            <p>Selamat datang</p>
            <h2>Masuk ke dashboard</h2>
          </div>
          ${errorMessage ? `<div class="alert">${h(errorMessage)}</div>` : ""}
          <label>
            Pilih akun
            <select name="login" required>
              <option value="">Pilih admin atau user</option>
              ${adminOptions.length ? `<optgroup label="Admin">${adminOptions.map(renderUserOption).join("")}</optgroup>` : ""}
              ${userOptions.length ? `<optgroup label="User / Komputer">${userOptions.map(renderUserOption).join("")}</optgroup>` : ""}
            </select>
          </label>
          <label>
            Password
            ${renderPasswordInput("password", "current-password", "required")}
          </label>
          <button type="submit">Masuk</button>
          <small>Password default semua akun: <strong>admin123</strong></small>
        </form>
      </section>
    </main>
  `;

  document.querySelector("#login-form").addEventListener("submit", handleLogin);
  document.querySelector("#login-form [name='login']").addEventListener("change", (event) => {
    state.selectedLogin = event.target.value;
  });
  bindPasswordToggles();
}

function renderUserOption(user) {
  return `<option value="${h(user.email)}" ${state.selectedLogin === user.email ? "selected" : ""}>${h(user.name)} (${h(user.role)})</option>`;
}

function renderPasswordInput(name, autocomplete, extraAttributes = "") {
  return `
    <div class="password-field">
      <input type="password" name="${h(name)}" ${extraAttributes} autocomplete="${h(autocomplete)}" />
      <button type="button" class="password-toggle" data-toggle-password aria-label="Lihat password">Lihat</button>
    </div>
  `;
}

function bindPasswordToggles() {
  document.querySelectorAll("[data-toggle-password]").forEach((button) => {
    button.addEventListener("click", () => {
      const input = button.parentElement?.querySelector("input");

      if (!input) {
        return;
      }

      const shouldShow = input.type === "password";
      input.type = shouldShow ? "text" : "password";
      button.textContent = shouldShow ? "Sembunyi" : "Lihat";
      button.setAttribute("aria-label", shouldShow ? "Sembunyikan password" : "Lihat password");
    });
  });
}

function renderDashboard() {
  const jobs = getVisibleJobs();
  const stats = getStats(jobs);
  const today = formatDate.format(new Date());
  const viewTitle = {
    dashboard: isAdmin() ? "Monitoring jobdesk harian" : "Ringkasan approval saya",
    input: "Input jobdesk",
    rekap: "Rekap PDF",
    approval: "Approval saya",
    users: "Manage user",
  }[state.activeView];

  document.querySelector("#app").innerHTML = `
    <main class="shell">
      <aside class="sidebar">
        <div class="brand">
          <img class="brand-logo" src="/logo-elshinta.png" alt="Radio Elshinta" />
          <div>
            <strong>Radio Elshinta</strong>
            <span>Jobdesk Backup</span>
          </div>
        </div>
        <nav>
          <button class="nav-link ${state.activeView === "dashboard" ? "active" : ""}" type="button" data-view="dashboard">Dashboard</button>
          ${isAdmin()
            ? `
              <button class="nav-link ${state.activeView === "input" ? "active" : ""}" type="button" data-view="input">Input Jobdesk</button>
              <button class="nav-link ${state.activeView === "rekap" ? "active" : ""}" type="button" data-view="rekap">Rekap PDF</button>
              <button class="nav-link ${state.activeView === "users" ? "active" : ""}" type="button" data-view="users">Manage User</button>
            `
            : `<button class="nav-link ${state.activeView === "approval" ? "active" : ""}" type="button" data-view="approval">Approval Saya</button>`
          }
        </nav>
        <div class="account-box">
          <span>${h(state.currentUser.role)}</span>
          <strong>${h(state.currentUser.name)}</strong>
          <button type="button" class="secondary account-action" id="toggle-password-button">${state.showPasswordForm ? "Tutup Ubah Password" : "Ubah Password"}</button>
          ${state.showPasswordForm ? renderPasswordForm() : ""}
          <button type="button" id="logout-button">Keluar</button>
        </div>
        <p class="developer-credit sidebar-credit">Develop by Alvin dan IT Support Tim 2026 with love</p>
      </aside>

      <section class="content">
        <header class="topbar">
          <div>
            <p>${today}</p>
            <h1>${h(viewTitle)}</h1>
          </div>
          ${isAdmin() && state.activeView === "dashboard" ? '<button type="button" id="export-pdf">Export PDF</button>' : ""}
        </header>

        ${renderActiveView(jobs, stats)}
      </section>
    </main>
  `;

  document.querySelector("#logout-button").addEventListener("click", logout);
  document.querySelector("#toggle-password-button").addEventListener("click", togglePasswordForm);
  document.querySelector("#password-form")?.addEventListener("submit", handleChangePassword);
  bindPasswordToggles();
  document.querySelector("#dashboard-filter-form")?.addEventListener("change", handleDashboardFilterChange);
  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => setActiveView(button.dataset.view));
  });

  if (isAdmin()) {
    document.querySelector("#job-form")?.addEventListener("submit", handleSubmit);
    document.querySelector("#cancel-job-edit")?.addEventListener("click", () => {
      state.editingJobId = null;
      state.jobMessage = "";
      renderDashboard();
    });
    document.querySelector("#export-pdf")?.addEventListener("click", () => {
      window.open(`${activeApiBaseUrl}/api/daily-jobs/export-pdf?${getRekapQueryString()}`, "_blank");
    });
    document.querySelector("#rekap-filter-form")?.addEventListener("change", handleRekapFilterChange);
    document.querySelector("#user-form")?.addEventListener("submit", handleUserSubmit);
    document.querySelector("#cancel-user-edit")?.addEventListener("click", () => {
      state.editingUserId = null;
      state.userMessage = "";
      renderDashboard();
    });
    document.querySelectorAll("[data-edit-user]").forEach((button) => {
      button.addEventListener("click", () => {
        state.editingUserId = Number(button.dataset.editUser);
        state.userMessage = "";
        renderDashboard();
      });
    });
    document.querySelectorAll("[data-reset-user]").forEach((button) => {
      button.addEventListener("click", () => handleResetUserPassword(button.dataset.resetUser));
    });
    document.querySelectorAll("[data-delete-user]").forEach((button) => {
      button.addEventListener("click", () => handleDeleteUser(button.dataset.deleteUser));
    });
    document.querySelectorAll("[data-edit-job]").forEach((button) => {
      button.addEventListener("click", () => {
        state.editingJobId = Number(button.dataset.editJob);
        state.jobMessage = "";
        state.activeView = "input";
        renderDashboard();
      });
    });
    document.querySelectorAll("[data-delete-job]").forEach((button) => {
      button.addEventListener("click", () => handleDeleteJob(button.dataset.deleteJob));
    });
  }

  document.querySelectorAll("[data-action='approve']").forEach((button) => {
    button.addEventListener("click", () => handleApproval(button.dataset.id, "approve"));
  });
  document.querySelectorAll("[data-action='reject']").forEach((button) => {
    button.addEventListener("click", () => handleApproval(button.dataset.id, "reject"));
  });
}

function renderPasswordForm() {
  return `
    <form id="password-form" class="password-form">
      ${state.passwordMessage ? `<div class="mini-alert">${h(state.passwordMessage)}</div>` : ""}
      <label>
        Password lama
        ${renderPasswordInput("current_password", "current-password", "required")}
      </label>
      <label>
        Password baru
        ${renderPasswordInput("new_password", "new-password", "required minlength=\"6\"")}
      </label>
      <label>
        Ulangi password baru
        ${renderPasswordInput("new_password_confirmation", "new-password", "required minlength=\"6\"")}
      </label>
      <button type="submit">Simpan Password</button>
    </form>
  `;
}

function renderActiveView(jobs, stats) {
  if (state.activeView === "input" && isAdmin()) {
    return renderInputView(jobs);
  }

  if (state.activeView === "rekap" && isAdmin()) {
    return renderRekapView(jobs, stats);
  }

  if (state.activeView === "users" && isAdmin()) {
    return renderUsersView();
  }

  if (state.activeView === "approval") {
    return renderApprovalView(jobs, stats);
  }

  return renderDashboardView(jobs, stats);
}

function renderUsersView() {
  const editingUser = state.users.find((user) => Number(user.id) === Number(state.editingUserId));
  const sortedUsers = [...state.users].sort((a, b) => a.name.localeCompare(b.name));
  const adminCount = sortedUsers.filter((user) => user.role === "admin").length;
  const userCount = sortedUsers.filter((user) => user.role === "user").length;

  return `
    <section class="stats">
      <article><span>Total Akun</span><strong>${sortedUsers.length}</strong></article>
      <article><span>Admin</span><strong>${adminCount}</strong></article>
      <article><span>User</span><strong>${userCount}</strong></article>
      <article><span>Password Reset</span><strong>admin123</strong></article>
    </section>
    <section class="workspace">
      <form id="user-form" class="panel">
        <div class="panel-heading">
          <h3>${editingUser ? "Update user" : "Tambah user"}</h3>
          <span>${editingUser ? "Edit akun terpilih" : "Password default admin123"}</span>
        </div>
        ${state.userMessage ? `<div class="notice">${h(state.userMessage)}</div>` : ""}
        <label>
          Nama
          <input name="name" required value="${h(editingUser?.name ?? "")}" placeholder="Nama user / admin" />
        </label>
        <label>
          Email
          <input type="email" name="email" required value="${h(editingUser?.email ?? "")}" placeholder="nama@elshinta.local" />
        </label>
        <label>
          Role
          <select name="role" required>
            <option value="user" ${editingUser?.role === "user" ? "selected" : ""}>User</option>
            <option value="admin" ${editingUser?.role === "admin" ? "selected" : ""}>Admin</option>
          </select>
        </label>
        ${editingUser ? "" : `
          <label>
            Password awal
            ${renderPasswordInput("password", "new-password", "placeholder=\"Kosongkan untuk admin123\"")}
          </label>
        `}
        <div class="form-actions">
          <button type="submit">${editingUser ? "Simpan Update" : "Tambah User"}</button>
          ${editingUser ? '<button type="button" class="secondary" id="cancel-user-edit">Batal Edit</button>' : ""}
        </div>
      </form>

      <section class="panel">
        <div class="panel-heading">
          <h3>Daftar user</h3>
          <span>${sortedUsers.length} akun</span>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nama</th>
                <th>Email</th>
                <th>Role</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              ${sortedUsers.map(renderUserRow).join("")}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  `;
}

function renderUserRow(user) {
  const isSelf = Number(user.id) === Number(state.currentUser.id);

  return `
    <tr>
      <td>${h(user.name)}</td>
      <td>${h(user.email)}</td>
      <td><span class="role-pill ${h(user.role)}">${h(user.role)}</span></td>
      <td>
        <div class="row-actions">
          <button type="button" class="small-button" data-edit-user="${user.id}">Edit</button>
          <button type="button" class="small-button secondary" data-reset-user="${user.id}">Reset</button>
          <button type="button" class="small-button danger" data-delete-user="${user.id}" ${isSelf ? "disabled" : ""}>Delete</button>
        </div>
      </td>
    </tr>
  `;
}

function renderDashboardView(jobs, stats) {
  const dashboardJobs = getFilteredJobs(jobs, state.dashboardFilter);
  const dashboardStats = getStats(dashboardJobs);
  const latestJobs = dashboardJobs.slice(0, 6);

  return `
    <section class="hero">
      <div>
        <span>Backup, maintenance, approval</span>
        <h2>${isAdmin() ? "Catat pekerjaan admin, kirim ke user untuk approval." : "Cek ringkasan pekerjaan yang perlu kamu approve."}</h2>
      </div>
    </section>

    ${renderStats(dashboardStats)}

    <section class="panel">
      <div class="panel-heading">
        <h3>${isAdmin() ? "Aktivitas terbaru" : "Pekerjaan terbaru saya"}</h3>
        <span>${dashboardJobs.length} data sesuai filter</span>
      </div>
      ${renderDashboardFilters()}
      <div class="jobs">
        ${latestJobs.length ? latestJobs.map(renderJobCard).join("") : '<div class="empty">Belum ada pekerjaan.</div>'}
      </div>
    </section>
  `;
}

function renderInputView(jobs) {
  return `
    <section class="workspace">
      ${renderJobForm()}
      <section class="panel">
        <div class="panel-heading">
          <h3>Jobdesk terakhir</h3>
          <span>Setelah simpan, data muncul di sini</span>
        </div>
        <div class="jobs">
          ${jobs.slice(0, 5).length ? jobs.slice(0, 5).map(renderJobCard).join("") : '<div class="empty">Belum ada pekerjaan.</div>'}
        </div>
      </section>
    </section>
  `;
}

function renderRekapView(jobs, stats) {
  const rekapJobs = getRekapJobs(jobs);
  const rekapStats = getStats(rekapJobs);
  const approved = rekapJobs.filter((job) => job.status === "approved").length;
  const rejected = rekapJobs.filter((job) => job.status === "rejected").length;

  return `
    ${renderStats(rekapStats)}
    <section class="workspace single">
      <section class="panel">
        <div class="panel-heading">
          <h3>Rekap pekerjaan</h3>
          <span>${rekapJobs.length} data sesuai filter</span>
        </div>
        ${renderRekapFilters()}
        <div class="rekap-actions">
          <article><span>Approved</span><strong>${approved}</strong></article>
          <article><span>Rejected</span><strong>${rejected}</strong></article>
          <article><span>Pending</span><strong>${rekapStats.pending}</strong></article>
          <button type="button" id="export-pdf">Download Rekap PDF</button>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>User / PC</th>
                <th>Jenis</th>
                <th>Jam</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${rekapJobs.length ? rekapJobs.map(renderRekapRow).join("") : '<tr><td colspan="5">Belum ada data sesuai filter.</td></tr>'}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  `;
}

function renderDashboardFilters() {
  return renderPeriodFilters("dashboard-filter-form", state.dashboardFilter);
}

function renderRekapFilters() {
  return renderPeriodFilters("rekap-filter-form", state.rekapFilter);
}

function renderPeriodFilters(formId, filter) {
  const { period, date, week, month } = filter;

  return `
    <form id="${h(formId)}" class="filter-bar">
      <label>
        Periode
        <select name="period">
          <option value="all" ${period === "all" ? "selected" : ""}>Semua</option>
          <option value="day" ${period === "day" ? "selected" : ""}>Harian</option>
          <option value="week" ${period === "week" ? "selected" : ""}>Mingguan</option>
          <option value="month" ${period === "month" ? "selected" : ""}>Bulanan</option>
        </select>
      </label>
      <label class="${period === "day" ? "" : "is-hidden"}">
        Tanggal
        <input type="date" name="date" value="${h(date)}" />
      </label>
      <label class="${period === "week" ? "" : "is-hidden"}">
        Minggu
        <input type="week" name="week" value="${h(week)}" />
      </label>
      <label class="${period === "month" ? "" : "is-hidden"}">
        Bulan
        <input type="month" name="month" value="${h(month)}" />
      </label>
    </form>
  `;
}

function renderApprovalView(jobs, stats) {
  const pendingJobs = jobs.filter((job) => job.status === "pending");

  return `
    ${renderStats(stats)}
    <section class="workspace single">
      <section class="panel">
        <div class="panel-heading">
          <h3>Butuh approval</h3>
          <span>${pendingJobs.length} menunggu</span>
        </div>
        <div class="jobs">
          ${jobs.length ? jobs.map(renderJobCard).join("") : '<div class="empty">Belum ada pekerjaan untuk akun ini.</div>'}
        </div>
      </section>
    </section>
  `;
}

function renderStats(stats) {
  return `
    <section class="stats">
      <article><span>Total Job</span><strong>${stats.total}</strong></article>
      <article><span>Pending</span><strong>${stats.pending}</strong></article>
      <article><span>Approved</span><strong>${stats.approved}</strong></article>
      <article><span>User / PC</span><strong>${stats.assets}</strong></article>
    </section>
  `;
}

function renderRekapRow(job) {
  return `
    <tr>
      <td>${h(formatJobDate(job.job_date))}</td>
      <td>${h(job.computer_asset?.pc_name ?? "-")}</td>
      <td>${h(job.work_type)}</td>
      <td>${h(job.start_time ?? "-")} - ${h(job.end_time ?? "-")}</td>
      <td><span class="status ${h(job.status)}">${h(getStatusLabel(job.status))}</span></td>
    </tr>
  `;
}

function renderJobForm() {
  const editingJob = state.jobs.find((job) => Number(job.id) === Number(state.editingJobId));
  const selectedAssetId = editingJob?.computer_asset_id ?? editingJob?.computer_asset?.id ?? state.assets[0]?.id;
  const jobDate = String(editingJob?.job_date ?? new Date().toISOString()).slice(0, 10);
  const startTime = String(editingJob?.start_time ?? "09:00").slice(0, 5);
  const endTime = String(editingJob?.end_time ?? "10:00").slice(0, 5);

  return `
    <form id="job-form" class="panel">
      <div class="panel-heading">
        <h3>${editingJob ? "Edit pekerjaan" : "Input pekerjaan"}</h3>
        <span>${editingJob ? "Update jobdesk admin" : "Role admin"}</span>
      </div>
      ${state.jobMessage ? `<div class="notice">${h(state.jobMessage)}</div>` : ""}
      <label>
        User / Komputer
        <select name="computer_asset_id" required>
          ${state.assets.map((asset) => `<option value="${asset.id}" ${Number(selectedAssetId) === Number(asset.id) ? "selected" : ""}>${h(asset.pc_name)}</option>`).join("")}
        </select>
      </label>
      <div class="grid-two">
        <label>
          Tanggal
          <input type="date" name="job_date" required value="${h(jobDate)}" />
        </label>
        <label>
          Jenis
          <select name="work_type" required>
            ${jobTypes.map((type) => `<option ${editingJob?.work_type === type ? "selected" : ""}>${h(type)}</option>`).join("")}
          </select>
        </label>
      </div>
      <div class="grid-two">
        <label>
          Jam mulai
          <input type="time" name="start_time" required value="${h(startTime)}" />
        </label>
        <label>
          Jam selesai
          <input type="time" name="end_time" required value="${h(endTime)}" />
        </label>
      </div>
      <label>
        Keterangan
        <textarea name="description" rows="4" required placeholder="Contoh: Backup data user dan cek hasil sinkronisasi.">${h(editingJob?.description ?? "")}</textarea>
      </label>
      <div class="form-actions">
        <button type="submit">${editingJob ? "Simpan Perubahan" : "Simpan jobdesk"}</button>
        ${editingJob ? '<button type="button" class="secondary" id="cancel-job-edit">Batal Edit</button>' : ""}
      </div>
    </form>
  `;
}

function renderJobCard(job) {
  const canApprove = !isAdmin() && job.status === "pending";
  const canManage = isAdmin();

  return `
    <article class="job">
      <div>
        <strong>${h(job.computer_asset?.pc_name ?? "User belum dipilih")}</strong>
        <span>${h(job.work_type)} - ${h(job.start_time ?? "-")} sampai ${h(job.end_time ?? "-")}</span>
      </div>
      <p>${h(job.description)}</p>
      <div class="job-footer">
        <small>${h(job.day_name)} ${h(job.job_date)}</small>
        <span class="status ${h(job.status)}">${h(getStatusLabel(job.status))}</span>
      </div>
      ${canApprove ? `
        <div class="approval-actions">
          <button type="button" data-action="approve" data-id="${job.id}">Approve</button>
          <button type="button" class="secondary" data-action="reject" data-id="${job.id}">Reject</button>
        </div>
      ` : ""}
      ${canManage ? `
        <div class="approval-actions">
          <button type="button" class="small-button" data-edit-job="${job.id}">Edit</button>
          <button type="button" class="small-button danger" data-delete-job="${job.id}">Delete</button>
        </div>
      ` : ""}
    </article>
  `;
}

async function handleLogin(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const payload = Object.fromEntries(formData.entries());
  state.selectedLogin = payload.login;

  try {
    const user = await fetchJson("/api/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    storeUser(user);
    state.selectedLogin = "";
    await loadData();
  } catch (error) {
    renderLogin(error.message);
  }
}

async function handleSubmit(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const editingJobId = state.editingJobId;
  const payload = {
    ...Object.fromEntries(formData.entries()),
    admin_id: state.currentUser.id,
    actor_id: state.currentUser.id,
    status: editingJobId ? state.jobs.find((job) => Number(job.id) === Number(editingJobId))?.status ?? "pending" : "pending",
  };

  try {
    const saved = await fetchJson(editingJobId ? `/api/daily-jobs/${editingJobId}` : "/api/daily-jobs", {
      method: editingJobId ? "PUT" : "POST",
      body: JSON.stringify(payload),
    });

    const savedJob = saved.data ?? saved;

    if (editingJobId) {
      state.jobs = state.jobs.map((job) => Number(job.id) === Number(editingJobId) ? savedJob : job);
      state.jobMessage = "Jobdesk berhasil diupdate.";
    } else {
      state.jobs = [savedJob, ...state.jobs];
      state.jobMessage = "Jobdesk berhasil disimpan.";
    }

    state.editingJobId = null;
    renderDashboard();
  } catch (error) {
    state.jobMessage = error.message;
    renderDashboard();
  }
}

async function handleDeleteJob(jobId) {
  const job = state.jobs.find((item) => Number(item.id) === Number(jobId));

  if (!confirm(`Hapus jobdesk ${job?.computer_asset?.pc_name ?? "ini"}?`)) {
    return;
  }

  try {
    const response = await fetchJson(`/api/daily-jobs/${jobId}`, {
      method: "DELETE",
      body: JSON.stringify({
        actor_id: state.currentUser.id,
      }),
    });

    state.jobs = state.jobs.filter((item) => Number(item.id) !== Number(jobId));
    state.jobMessage = response.message;
    if (state.editingJobId === Number(jobId)) {
      state.editingJobId = null;
    }
    renderDashboard();
  } catch (error) {
    state.jobMessage = error.message;
    renderDashboard();
  }
}

async function handleChangePassword(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const payload = {
    ...Object.fromEntries(formData.entries()),
    user_id: state.currentUser.id,
  };

  try {
    const response = await fetchJson("/api/change-password", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    state.passwordMessage = response.message ?? "Password berhasil diubah.";
    event.target.reset();
    renderDashboard();
  } catch (error) {
    state.passwordMessage = error.message;
    renderDashboard();
  }
}

async function handleUserSubmit(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const payload = {
    ...Object.fromEntries(formData.entries()),
    actor_id: state.currentUser.id,
  };

  if (!payload.password) {
    delete payload.password;
  }

  const editingUserId = state.editingUserId;
  const path = editingUserId ? `/api/users/${editingUserId}` : "/api/users";
  const method = editingUserId ? "PUT" : "POST";

  try {
    const saved = await fetchJson(path, {
      method,
      body: JSON.stringify(payload),
    });

    const users = await fetchJson("/api/users");
    state.users = users.data ?? users;
    state.editingUserId = null;
    state.userMessage = saved.message ?? "Data user berhasil disimpan.";
    renderDashboard();
  } catch (error) {
    state.userMessage = error.message;
    renderDashboard();
  }
}

async function handleResetUserPassword(userId) {
  const user = state.users.find((item) => Number(item.id) === Number(userId));

  if (!confirm(`Reset password ${user?.name ?? "user ini"} ke admin123?`)) {
    return;
  }

  try {
    const response = await fetchJson(`/api/users/${userId}/reset-password`, {
      method: "POST",
      body: JSON.stringify({
        actor_id: state.currentUser.id,
      }),
    });

    state.userMessage = response.message;
    renderDashboard();
  } catch (error) {
    state.userMessage = error.message;
    renderDashboard();
  }
}

async function handleDeleteUser(userId) {
  const user = state.users.find((item) => Number(item.id) === Number(userId));

  if (!confirm(`Hapus user ${user?.name ?? "ini"}?`)) {
    return;
  }

  try {
    const response = await fetchJson(`/api/users/${userId}`, {
      method: "DELETE",
      body: JSON.stringify({
        actor_id: state.currentUser.id,
      }),
    });

    state.users = state.users.filter((item) => Number(item.id) !== Number(userId));
    state.userMessage = response.message;
    renderDashboard();
  } catch (error) {
    state.userMessage = error.message;
    renderDashboard();
  }
}

function handleRekapFilterChange(event) {
  const formData = new FormData(event.currentTarget);

  state.rekapFilter = {
    period: formData.get("period") || "all",
    date: formData.get("date") || state.rekapFilter.date,
    week: formData.get("week") || state.rekapFilter.week,
    month: formData.get("month") || state.rekapFilter.month,
  };

  renderDashboard();
}

function handleDashboardFilterChange(event) {
  const formData = new FormData(event.currentTarget);

  state.dashboardFilter = {
    period: formData.get("period") || "all",
    date: formData.get("date") || state.dashboardFilter.date,
    week: formData.get("week") || state.dashboardFilter.week,
    month: formData.get("month") || state.dashboardFilter.month,
  };

  renderDashboard();
}

async function handleApproval(jobId, action) {
  const rejectedReason = action === "reject" ? prompt("Alasan reject:") : null;

  try {
    const saved = await fetchJson(`/api/daily-jobs/${jobId}/${action}`, {
      method: "POST",
      body: JSON.stringify({
        approved_by: state.currentUser.id,
        rejected_reason: rejectedReason,
      }),
    });

    state.jobs = state.jobs.map((job) => Number(job.id) === Number(jobId) ? saved : job);
    renderDashboard();
  } catch (error) {
    alert(error.message);
  }
}

if (state.currentUser) {
  loadData();
} else {
  renderLogin();
  loadUsers();
}
