/* SIRKULA — Shared app logic: session, navigation, auth UI (demo localStorage) */
window.SIRKULA = window.SIRKULA || {};

let currentUser = null;

function initApp() {
  loadSession();
  setupAuthUI();
  setupMobileDrawer();
  setupLogout();
  setupSearchNav();
  guardProtectedPages();
}

/**
 * Pages that require an authenticated session.
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

function loadSession() {
  currentUser = window.SIRKULA.auth.currentUser();
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
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.SIRKULA.auth.logout();
      currentUser = null;
      window.SIRKULA.toast('Logged out.', 'info');
      window.location.href = '/login.html';
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

window.SIRKULA.resolveImageUrl = function (value) {
  if (!value) return '';
  if (/^https?:\/\//i.test(value) || String(value).startsWith('/')) return value;
  return '/uploads/' + value;
};

window.SIRKULA.categoryImage = function (category) {
  const map = {
    Bakery: '/images/food/bakery.jpg',
    Produce: '/images/food/produce.jpg',
    'Prepared Food': '/images/food/prepared.jpg',
    Dairy: '/images/food/dairy.jpg',
  };
  return map[category] || '/images/food/snacks.jpg';
};

window.SIRKULA.listingImage = function (listing) {
  const first = listing && Array.isArray(listing.images) ? listing.images[0] : (listing ? listing.image : '');
  if (first) return window.SIRKULA.resolveImageUrl(first);
  if (listing && listing.category) return window.SIRKULA.categoryImage(listing.category);
  return '/images/food/snacks.jpg';
};

// Auto-init when DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
