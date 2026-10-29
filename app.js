/* ============================================================
   LibraryOS — Frontend JS  |  app.js
   All API calls hit http://localhost:3000/api/...
   ============================================================ */

const API = 'http://localhost:3000/api';

/* ────────────────────────────────────────────────
   UTILITY
──────────────────────────────────────────────── */
function toast(msg, type = 'default') {
  const box = document.getElementById('toast-container');
  const el  = document.createElement('div');
  el.className = 'toast ' + (type === 'success' ? 'ok' : type === 'warn' ? 'warn' : '');
  el.innerHTML = `<span>${type === 'success' ? '✅' : type === 'warn' ? '⚠️' : 'ℹ️'}</span> ${msg}`;
  box.appendChild(el);
  setTimeout(() => {
    el.style.cssText = 'opacity:0;transform:translateX(14px);transition:.28s';
    setTimeout(() => el.remove(), 300);
  }, 3200);
}

function today() {
  return new Date().toISOString().split('T')[0];
}

function addDays(base, n) {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}

function badge(status) {
  const map = {
    available: 'b-ok',
    issued:    'b-issued',
    overdue:   'b-overdue',
    active:    'b-issued',
    returned:  'b-closed',
    closed:    'b-closed',
    ISSUE:     'b-issued',
    RETURN:    'b-ok',
    CLEAR:     'b-clear',
    ALERT:     'b-alert',
  };
  const cls = map[status] || 'b-closed';
  return `<span class="badge ${cls}">${status}</span>`;
}

async function api(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(API + path, opts);
  return res.json();
}

/* ────────────────────────────────────────────────
   PANEL NAVIGATION
──────────────────────────────────────────────── */
document.querySelectorAll('.sbar-item').forEach(btn => {
  btn.addEventListener('click', () => {
    const panel = btn.dataset.panel;
    document.querySelectorAll('.sbar-item').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('panel-' + panel).classList.add('active');
    loadPanel(panel);
  });
});

function gotoPanel(name) {
  smoothScroll('#app-section');
  setTimeout(() => {
    document.querySelectorAll('.sbar-item').forEach(b => {
      b.classList.toggle('active', b.dataset.panel === name);
    });
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.getElementById('panel-' + name).classList.add('active');
    loadPanel(name);
  }, 420);
}

function loadPanel(name) {
  switch (name) {
    case 'dashboard':    loadDashboard();    break;
    case 'register':     loadBooks();        break;
    case 'search':       searchBooks();      break;
    case 'issue':        loadLoans();        break;
    case 'students':     loadStudents();     break;
    case 'transactions': loadTransactions(); break;
    case 'security':     loadExitLog();      break;
  }
}

/* ────────────────────────────────────────────────
   STATS BAR
──────────────────────────────────────────────── */
async function refreshStats() {
  try {
    const s = await api('GET', '/stats');
    document.getElementById('s-books').textContent    = s.totalBooks;
    document.getElementById('s-students').textContent = s.totalStudents;
    document.getElementById('s-loans').textContent    = s.activeLoans;
    document.getElementById('s-overdue').textContent  = s.overdueLoans;
    document.getElementById('s-fines').textContent    = '₹' + s.finesTotal;
    document.getElementById('s-exits').textContent    = s.exitChecks;
    // dashboard cards
    document.getElementById('d-books').textContent    = s.totalBooks;
    document.getElementById('d-loans').textContent    = s.activeLoans;
    document.getElementById('d-overdue').textContent  = s.overdueLoans;
    document.getElementById('d-students').textContent = s.totalStudents;
  } catch (e) {
    console.warn('Stats fetch failed — is the server running?', e);
  }
}

/* ────────────────────────────────────────────────
   DASHBOARD
──────────────────────────────────────────────── */
async function loadDashboard() {
  await refreshStats();
  try {
    const txs = await api('GET', '/transactions');
    const tbody = document.getElementById('dash-tbody');
    tbody.innerHTML = txs.slice(0, 8).map(t => `
      <tr>
        <td style="font-family:monospace;font-size:.72rem">${t.id}</td>
        <td>${badge(t.type)}</td>
        <td>${t.studentId}</td>
        <td>${t.book}</td>
        <td>${t.date}</td>
        <td>${badge(t.status)}</td>
      </tr>`).join('');
  } catch (e) { /* pass */ }
}

/* ────────────────────────────────────────────────
   BOOK REGISTRATION
──────────────────────────────────────────────── */
async function registerBook() {
  const rfid     = document.getElementById('reg-rfid').value.trim();
  const title    = document.getElementById('reg-title').value.trim();
  const author   = document.getElementById('reg-author').value.trim();
  const isbn     = document.getElementById('reg-isbn').value.trim();
  const shelf    = document.getElementById('reg-shelf').value.trim();
  const category = document.getElementById('reg-cat').value;

  if (!rfid || !title || !author || !shelf) {
    toast('RFID, title, author, and shelf are required.', 'warn');
    return;
  }
  try {
    const res = await api('POST', '/books', { rfid, title, author, isbn, shelf, category });
    if (res.error) { toast(res.error, 'warn'); return; }
    toast(res.message, 'success');
    ['reg-rfid','reg-title','reg-author','reg-isbn','reg-shelf'].forEach(id => document.getElementById(id).value = '');
    loadBooks();
    refreshStats();
  } catch (e) { toast('Cannot reach the server. Is it running?', 'warn'); }
}

async function loadBooks() {
  try {
    const books = await api('GET', '/books');
    document.getElementById('books-tbody').innerHTML = books.map(b => `
      <tr>
        <td style="font-family:monospace;font-size:.72rem">${b.rfid}</td>
        <td>${b.title}</td>
        <td style="color:var(--muted)">${b.author}</td>
        <td style="font-family:monospace;font-size:.72rem">${b.shelf}</td>
        <td style="color:var(--muted)">${b.category}</td>
        <td>${badge(b.status)}</td>
      </tr>`).join('');
  } catch (e) { /* pass */ }
}

/* ────────────────────────────────────────────────
   SEARCH
──────────────────────────────────────────────── */
async function searchBooks() {
  const q = document.getElementById('search-q').value.trim();
  const container = document.getElementById('search-results');
  try {
    const books = await api('GET', `/books/search?q=${encodeURIComponent(q)}`);
    if (!books.length) {
      container.innerHTML = '<p style="color:var(--muted);font-size:.84rem;padding:.5rem 0">No books found.</p>';
      return;
    }
    container.innerHTML = books.map(b => `
      <div class="result-card">
        <div>
          <h4>${b.title}</h4>
          <div class="result-meta">${b.author} · ISBN: ${b.isbn || '—'} · Shelf: <strong style="color:var(--text)">${b.shelf}</strong></div>
          <div class="result-meta" style="font-family:monospace;margin-top:.12rem">RFID: ${b.rfid} · ${b.category}</div>
        </div>
        ${badge(b.status)}
      </div>`).join('');
  } catch (e) { container.innerHTML = '<p style="color:var(--muted);font-size:.84rem">Server not reachable.</p>'; }
}

/* ────────────────────────────────────────────────
   ISSUE BOOK
──────────────────────────────────────────────── */
async function issueBook() {
  const studentId = document.getElementById('iss-student').value.trim();
  const bookRfid  = document.getElementById('iss-rfid').value.trim();
  const issueDate = document.getElementById('iss-date').value;
  const dueDate   = document.getElementById('iss-due').value;
  const resultEl  = document.getElementById('issue-result');

  if (!studentId || !bookRfid) { toast('Student ID and Book RFID are required.', 'warn'); return; }

  try {
    const res = await api('POST', '/loans/issue', { studentId, bookRfid, issueDate, dueDate });
    resultEl.style.display = 'block';
    if (res.error) {
      resultEl.className = 'result-box err';
      resultEl.textContent = '❌ ' + res.error;
      toast(res.error, 'warn');
    } else {
      resultEl.className = 'result-box ok';
      resultEl.innerHTML = `✅ ${res.message}`;
      toast(res.message, 'success');
      ['iss-student','iss-rfid'].forEach(id => document.getElementById(id).value = '');
      loadLoans();
      refreshStats();
    }
  } catch (e) { toast('Server not reachable.', 'warn'); }
}

async function loadLoans() {
  try {
    const loans = await api('GET', '/loans/active');
    document.getElementById('loans-tbody').innerHTML = loans.map(l => `
      <tr>
        <td style="font-family:monospace;font-size:.72rem">${l.id}</td>
        <td>${l.studentName}</td>
        <td>${l.title}</td>
        <td>${l.dueDate}</td>
        <td>${badge(l.status)}</td>
      </tr>`).join('');
  } catch (e) { /* pass */ }
}

/* ────────────────────────────────────────────────
   RETURN BOOK
──────────────────────────────────────────────── */
async function returnBook() {
  const bookRfid   = document.getElementById('ret-rfid').value.trim();
  const studentId  = document.getElementById('ret-student').value.trim();
  const returnDate = document.getElementById('ret-date').value;
  const resultEl   = document.getElementById('return-result');

  if (!bookRfid || !studentId) { toast('Book RFID and Student ID are required.', 'warn'); return; }

  try {
    const res = await api('POST', '/loans/return', { bookRfid, studentId, returnDate });
    resultEl.style.display = 'block';
    if (res.error) {
      resultEl.className = 'result-box err';
      resultEl.textContent = '❌ ' + res.error;
      toast(res.error, 'warn');
    } else {
      const fineMsg = res.fine > 0
        ? `<br><span style="color:var(--gold)">⚠️ Overdue: ${res.overdueDays} day(s) — Fine: ₹${res.fine}</span>`
        : '<br><span style="color:#4ade80">✅ Returned on time — no fine.</span>';
      resultEl.className = 'result-box ok';
      resultEl.innerHTML = `✅ ${res.message}${fineMsg}`;
      toast(res.message, 'success');
      refreshStats();
    }
  } catch (e) { toast('Server not reachable.', 'warn'); }
}

/* ────────────────────────────────────────────────
   FINE CALCULATOR
──────────────────────────────────────────────── */
async function calcFine() {
  const dueDate    = document.getElementById('fine-due').value;
  const returnDate = document.getElementById('fine-ret').value;
  if (!dueDate || !returnDate) { toast('Both dates are required.', 'warn'); return; }

  try {
    const res = await api('POST', '/fine/calculate', { dueDate, returnDate });
    const box = document.getElementById('fine-result');
    box.style.display = 'block';
    document.getElementById('fine-amount').textContent = '₹' + res.fine;
    document.getElementById('fine-detail').textContent = res.overdueDays > 0
      ? `${res.overdueDays} day(s) overdue × ₹${res.ratePerDay} per day`
      : `Returned ${Math.abs(res.overdueDays)} day(s) early — no fine.`;
    if (res.fine > 0) toast(`Fine: ₹${res.fine} for ${res.overdueDays} overdue day(s).`, 'warn');
    else toast('No fine — returned on time.', 'success');
  } catch (e) { toast('Server not reachable.', 'warn'); }
}

/* ────────────────────────────────────────────────
   EXIT SECURITY
──────────────────────────────────────────────── */
async function verifyExit() {
  const bookRfid  = document.getElementById('sec-rfid').value.trim();
  const studentId = document.getElementById('sec-student').value.trim();
  const resultEl  = document.getElementById('security-result');
  if (!bookRfid) { toast('Book RFID is required.', 'warn'); return; }

  try {
    const res = await api('POST', '/security/verify-exit', { bookRfid, studentId });
    resultEl.style.display = 'block';
    if (res.status === 'CLEAR') {
      resultEl.className = 'result-box ok';
      resultEl.innerHTML = '✅ ' + res.message;
      toast('Exit verified — valid loan.', 'success');
    } else {
      resultEl.className = 'result-box err';
      resultEl.innerHTML = '🚨 ' + res.message;
      toast('🚨 ALERT: ' + res.message, 'warn');
    }
    loadExitLog();
    refreshStats();
  } catch (e) { toast('Server not reachable.', 'warn'); }
}

async function loadExitLog() {
  try {
    const log = await api('GET', '/security/exit-log');
    document.getElementById('exit-tbody').innerHTML = log.map(e => `
      <tr>
        <td style="font-size:.72rem">${e.timestamp}</td>
        <td style="font-family:monospace;font-size:.72rem">${e.bookRfid}</td>
        <td>${e.studentId}</td>
        <td>${badge(e.result)}</td>
      </tr>`).join('');
  } catch (e) { /* pass */ }
}

/* ────────────────────────────────────────────────
   STUDENTS
──────────────────────────────────────────────── */
async function addStudent() {
  const name       = document.getElementById('stu-name').value.trim();
  const id         = document.getElementById('stu-id').value.trim();
  const rfid       = document.getElementById('stu-rfid').value.trim();
  const department = document.getElementById('stu-dept').value;

  if (!name || !id || !rfid) { toast('Name, Student ID, and RFID card are required.', 'warn'); return; }

  try {
    const res = await api('POST', '/students', { id, name, rfid, department });
    if (res.error) { toast(res.error, 'warn'); return; }
    toast(res.message, 'success');
    ['stu-name','stu-id','stu-rfid'].forEach(eid => document.getElementById(eid).value = '');
    loadStudents();
    refreshStats();
  } catch (e) { toast('Server not reachable.', 'warn'); }
}

async function loadStudents() {
  try {
    const students = await api('GET', '/students');
    document.getElementById('students-tbody').innerHTML = students.map(s => `
      <tr>
        <td style="font-family:monospace;font-size:.72rem">${s.id}</td>
        <td>${s.name}</td>
        <td style="font-family:monospace;font-size:.72rem">${s.rfid}</td>
        <td style="color:var(--muted)">${s.department}</td>
        <td>${badge(s.activeLoans > 0 ? 'issued' : 'available')}&nbsp;${s.activeLoans}</td>
      </tr>`).join('');
  } catch (e) { /* pass */ }
}

/* ────────────────────────────────────────────────
   TRANSACTIONS
──────────────────────────────────────────────── */
async function loadTransactions() {
  try {
    const txs = await api('GET', '/transactions');
    document.getElementById('tx-tbody').innerHTML = txs.map(t => `
      <tr>
        <td style="font-family:monospace;font-size:.72rem">${t.id}</td>
        <td>${badge(t.type)}</td>
        <td>${t.studentId}</td>
        <td>${t.book}</td>
        <td>${t.date}</td>
        <td>${badge(t.status)}</td>
      </tr>`).join('');
  } catch (e) { /* pass */ }
}

/* ────────────────────────────────────────────────
   NAV / MISC
──────────────────────────────────────────────── */
function smoothScroll(sel) {
  document.querySelector(sel).scrollIntoView({ behavior: 'smooth' });
}

document.getElementById('hamburger').addEventListener('click', () => {
  document.getElementById('navLinks').classList.toggle('open');
});

// Spotlight effect
const spotlight = document.getElementById('spotlight');
document.addEventListener('mousemove', e => {
  spotlight.style.left = e.clientX + 'px';
  spotlight.style.top  = e.clientY + 'px';
});

// Set date defaults
document.getElementById('iss-date').value = today();
document.getElementById('iss-due').value  = addDays(today(), 14);
document.getElementById('ret-date').value = today();
document.getElementById('fine-due').value = addDays(today(), 14);
document.getElementById('fine-ret').value = today();

// Initial load
(async () => {
  await refreshStats();
  await loadDashboard();
  searchBooks();
})();
