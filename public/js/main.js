/* SIRKULA — Shared app logic: session, navigation, auth UI */
window.SIRKULA = window.SIRKULA || {};

let currentUser = null;

async function initApp() {
  await loadSession();
  setupAuthUI();
  setupMobileDrawer();
  setupLogout();
  setupSearchNav();
  guardProtectedPages();
}

/**
 * Pages that require an authenticated session.
 * If the user is not logged in, redirect to the login page.
 * Uses auth:false so the probe itself never triggers a toast/redirect.
 */
const PROTECTED_PAGES = [
  'dashboard.html',
  'profile.html',
  'reservations.html',
  'notifications.html',
  'seller-inventory.html',
  'create-listing.html',
  'admin.html',
];

function guardProtectedPages() {
  const page = window.location.pathname.split('/').pop();
  if (!PROTECTED_PAGES.includes(page)) return;
  if (!currentUser) {
    window.location.href = '/login.html';
  }
}

async function loadSession() {
  try {
    // Use auth:false so the initial session probe does NOT trigger the
    // 401 toast/redirect — it is expected to return 401 for anonymous users.
    const data = await window.SIRKULA.api.get('/auth/me', { auth: false });
    // The API wraps payloads as { success, data: { user } }.
    currentUser = data.data.user;
  } catch (e) {
    currentUser = null;
  }
  renderAuthUI();
}

function renderAuthUI() {
  const authed = document.querySelectorAll('[data-auth="true"]');
  const guest = document.querySelectorAll('[data-auth="false"]');
  const roleEls = document.querySelectorAll('[data-role]');
  const nameEls = document.querySelectorAll('[data-user-name]');

  if (currentUser) {
    authed.forEach((el) => (el.style.display = ''));
    guest.forEach((el) => (el.style.display = 'none'));
    nameEls.forEach((el) => (el.textContent = currentUser.name || currentUser.email));
    roleEls.forEach((el) => {
      const roles = el.dataset.role.split(',');
      el.style.display = roles.includes(currentUser.role) ? '' : 'none';
    });
  } else {
    authed.forEach((el) => (el.style.display = 'none'));
    guest.forEach((el) => (el.style.display = ''));
    roleEls.forEach((el) => (el.style.display = 'none'));
  }
}

function setupAuthUI() {
  renderAuthUI();
}

function setupLogout() {
  document.querySelectorAll('[data-action="logout"]').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        await window.SIRKULA.api.post('/auth/logout');
      } catch (_) {}
      currentUser = null;
      window.SIRKULA.toast('Logged out.', 'info');
      window.location.href = '/index.html';
    });
  });
}

function setupMobileDrawer() {
  const btn = document.getElementById('mobile-menu-btn');
  const drawer = document.getElementById('mobile-drawer');
  const closeBtn = document.getElementById('mobile-drawer-close');
  if (btn) btn.addEventListener('click', () => drawer.classList.add('open'));
  if (closeBtn) closeBtn.addEventListener('click', () => drawer.classList.remove('open'));
  drawer.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => drawer.classList.remove('open')));
}

function setupSearchNav() {
  // Global search on marketplace link: if a q param exists, carry it to marketplace
  const searchInput = document.getElementById('global-search');
  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const q = searchInput.value.trim();
        window.location.href = `/marketplace.html?q=${encodeURIComponent(q)}`;
      }
    });
  }
}

window.SIRKULA.initApp = initApp;
window.SIRKULA.currentUser = () => currentUser;

// Auto-init when DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
