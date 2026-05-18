/* ══════════════════════════════════════════════
   app.js — TaskApp Frontend Logic
   Connects to PHP backend at /API/
══════════════════════════════════════════════ */

// ── CONFIG ──────────────────────────────────
const API_BASE = 'http://localhost/taskapp/API';

// ── STATE ───────────────────────────────────
let currentUser = null;
let authToken   = null;
let currentView = 'active'; // 'active' | 'completed'

// ── DOM REFS ────────────────────────────────
const authScreen      = document.getElementById('auth-screen');
const dashboardScreen = document.getElementById('dashboard-screen');

const loginMsg        = document.getElementById('login-msg');
const registerMsg     = document.getElementById('register-msg');
const taskMsg         = document.getElementById('task-msg');

const taskList        = document.getElementById('task-list');
const emptyState      = document.getElementById('empty-state');
const taskCount       = document.getElementById('task-count');
const pageTitle       = document.getElementById('page-title');
const sidebarUsername = document.getElementById('sidebar-username');
const userAvatar      = document.getElementById('user-avatar');

const modalOverlay    = document.getElementById('modal-overlay');
const taskInput       = document.getElementById('task-input');
const addModalBtn     = document.getElementById('open-add-modal');

// ── INIT ─────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  authToken   = localStorage.getItem('task_token');
  currentUser = localStorage.getItem('task_user');

  if (authToken && currentUser) {
    showDashboard();
    loadTasks();
  } else {
    showAuth();
  }
});

// ── SCREEN HELPERS ───────────────────────────
function showAuth() {
  authScreen.classList.add('active');
  dashboardScreen.classList.remove('active');
  authScreen.style.display      = 'flex';
  dashboardScreen.style.display = 'none';
}

function showDashboard() {
  authScreen.classList.remove('active');
  dashboardScreen.classList.add('active');
  authScreen.style.display      = 'none';
  dashboardScreen.style.display = 'flex';

  sidebarUsername.textContent = currentUser || 'User';
  userAvatar.textContent      = (currentUser || 'U')[0].toUpperCase();
}

// ── AUTH TAB SWITCHING ────────────────────────
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.form-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(`${tab.dataset.tab}-form`).classList.add('active');
    clearMessages();
  });
});

function clearMessages() {
  [loginMsg, registerMsg, taskMsg].forEach(el => {
    el.textContent = '';
    el.className = 'form-msg';
  });
}

// ── SIDEBAR NAV (view switching) ─────────────
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    const view = item.dataset.view;
    if (!view || view === currentView) return;

    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    item.classList.add('active');

    currentView = view;

    if (currentView === 'completed') {
      pageTitle.textContent = 'Completed Tasks';
      addModalBtn.style.display = 'none';
    } else {
      pageTitle.textContent = 'My Tasks';
      addModalBtn.style.display = '';
    }

    loadTasks();
  });
});

// ── UTILITY: loading state ────────────────────
function setLoading(btn, loading) {
  const text   = btn.querySelector('.btn-text');
  const loader = btn.querySelector('.btn-loader');
  if (loading) {
    btn.disabled = true;
    text.classList.add('hidden');
    loader.classList.remove('hidden');
  } else {
    btn.disabled = false;
    text.classList.remove('hidden');
    loader.classList.add('hidden');
  }
}

function showMsg(el, msg, type = 'error') {
  el.textContent = msg;
  el.className   = `form-msg ${type}`;
}

// ── API WRAPPER ───────────────────────────────
async function apiCall(endpoint, options = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

  const res = await fetch(`${API_BASE}/${endpoint}`, {
    headers,
    ...options
  });

  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (e) {}

  if (!res.ok) {
    const message = data?.message || data?.status || res.statusText || `HTTP ${res.status}`;
    throw new Error(message);
  }

  return data;
}

// ── LOGIN ─────────────────────────────────────
document.getElementById('login-btn').addEventListener('click', async () => {
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;
  const btn      = document.getElementById('login-btn');

  if (!username || !password) return showMsg(loginMsg, 'Please fill in all fields.');

  setLoading(btn, true);
  clearMessages();

  try {
    const data = await apiCall('login.php', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });

    if (data.status === 'success') {
      authToken   = data.token;
      currentUser = username;
      localStorage.setItem('task_token', authToken);
      localStorage.setItem('task_user',  currentUser);
      showDashboard();
      loadTasks();
    } else {
      showMsg(loginMsg, data.message || 'Invalid username or password.');
    }
  } catch (err) {
    showMsg(loginMsg, err.message || 'Could not reach server.');
    console.error(err);
  } finally {
    setLoading(btn, false);
  }
});

// ── REGISTER ──────────────────────────────────
document.getElementById('register-btn').addEventListener('click', async () => {
  const username = document.getElementById('reg-username').value.trim();
  const password = document.getElementById('reg-password').value;
  const btn      = document.getElementById('register-btn');

  if (!username || !password) return showMsg(registerMsg, 'Please fill in all fields.');
  if (password.length < 6) return showMsg(registerMsg, 'Password must be at least 6 characters.');

  setLoading(btn, true);
  clearMessages();

  try {
    const data = await apiCall('register.php', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });

    if (data.status === 'success') {
      showMsg(registerMsg, 'Account created! You can now sign in.', 'success');
      setTimeout(() => {
        document.querySelector('[data-tab="login"]').click();
        document.getElementById('login-username').value = username;
      }, 1000);
    } else {
      showMsg(registerMsg, data.message || 'Registration failed.');
    }
  } catch (err) {
    showMsg(registerMsg, err.message || 'Could not reach server.');
    console.error(err);
  } finally {
    setLoading(btn, false);
  }
});

['login-username','login-password'].forEach(id => {
  document.getElementById(id).addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('login-btn').click();
  });
});
['reg-username','reg-password'].forEach(id => {
  document.getElementById(id).addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('register-btn').click();
  });
});

// ── LOGOUT ────────────────────────────────────
document.getElementById('logout-btn').addEventListener('click', async () => {
  try { await apiCall('logout.php', { method: 'POST' }); } catch (_) {}
  authToken   = null;
  currentUser = null;
  localStorage.removeItem('task_token');
  localStorage.removeItem('task_user');
  showAuth();
});

// ── LOAD TASKS ────────────────────────────────
async function loadTasks() {
  taskCount.textContent = 'Loading tasks…';
  Array.from(taskList.querySelectorAll('.task-card')).forEach(c => c.remove());

  try {
    const param = currentView === 'completed' ? '?completed=1' : '?completed=0';
    const tasks = await apiCall(`get_task.php${param}`);

    if (!Array.isArray(tasks) || tasks.length === 0) {
      emptyState.style.display = 'flex';
      emptyState.querySelector('p').textContent =
        currentView === 'completed' ? 'No completed tasks yet.' : 'No tasks yet. Add your first one!';
      taskCount.textContent = '0 tasks';
      return;
    }

    emptyState.style.display = 'none';
    taskCount.textContent    = `${tasks.length} task${tasks.length !== 1 ? 's' : ''}`;
    tasks.forEach((t, i) => renderTask(t, i));
  } catch (err) {
    taskCount.textContent = 'Failed to load tasks.';
    console.error(err);
  }
}

// ── RENDER TASK CARD ──────────────────────────
function renderTask(task, index = 0) {
  const card = document.createElement('div');
  card.className = 'task-card';
  if (task.completed == 1) card.classList.add('task-card--done');
  card.style.animationDelay = `${index * 0.04}s`;

  const taskId = task.id ? `#${String(task.id).padStart(4,'0')}` : '';

  const completeBtn = task.completed == 1 ? '' : `
    <button class="btn-complete" title="Mark as complete" data-id="${task.id}">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
    </button>
  `;

  card.innerHTML = `
    <div class="task-dot ${task.completed == 1 ? 'task-dot--done' : ''}"></div>
    <div class="task-content">
      <p class="task-text ${task.completed == 1 ? 'task-text--done' : ''}">${escapeHtml(task.task)}</p>
      <p class="task-meta">${task.completed == 1 ? '✓ Completed' : 'Added to your list'}</p>
    </div>
    ${taskId ? `<span class="task-id">${taskId}</span>` : ''}
    ${completeBtn}
  `;

  const btn = card.querySelector('.btn-complete');
  if (btn) btn.addEventListener('click', () => completeTask(task.id, card, btn));

  taskList.appendChild(card);
}

// ── COMPLETE TASK ─────────────────────────────
async function completeTask(id, card, btn) {
  btn.disabled = true;
  btn.style.opacity = '0.5';

  try {
    const data = await apiCall('complete_task.php', {
      method: 'POST',
      body: JSON.stringify({ id })
    });

    if (data.status === 'success') {
      card.style.transition = 'opacity 0.3s, transform 0.3s';
      card.style.opacity = '0';
      card.style.transform = 'translateX(20px)';
      setTimeout(() => loadTasks(), 350);
    } else {
      btn.disabled = false;
      btn.style.opacity = '';
    }
  } catch (err) {
    console.error(err);
    btn.disabled = false;
    btn.style.opacity = '';
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── ADD TASK MODAL ────────────────────────────
addModalBtn.addEventListener('click', () => {
  taskInput.value = '';
  taskMsg.textContent = '';
  modalOverlay.classList.add('open');
  setTimeout(() => taskInput.focus(), 80);
});

function closeModal() { modalOverlay.classList.remove('open'); }

document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('modal-cancel').addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });

taskInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); document.getElementById('add-task-btn').click(); }
});

document.getElementById('add-task-btn').addEventListener('click', async () => {
  const task = taskInput.value.trim();
  const btn  = document.getElementById('add-task-btn');

  if (!task) return showMsg(taskMsg, 'Please enter a task description.');

  setLoading(btn, true);
  showMsg(taskMsg, '');

  try {
    const data = await apiCall('add_task.php', {
      method: 'POST',
      body: JSON.stringify({ task })
    });

    if (data.status === 'task added') {
      closeModal();
      await loadTasks();
    } else {
      showMsg(taskMsg, 'Failed to add task. Try again.');
    }
  } catch (err) {
    showMsg(taskMsg, 'Could not reach server.');
    console.error(err);
  } finally {
    setLoading(btn, false);
  }
});
