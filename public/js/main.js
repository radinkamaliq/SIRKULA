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
    window.location.replace('/login.html');
    return;
  }
  const sellerPages = ['seller-inventory.html', 'create-listing.html'];
  if (page === 'admin.html' && currentUser.role !== 'ADMIN') {
    window.location.replace('/dashboard.html');
    return;
  }
  if (sellerPages.includes(page) && !['SELLER', 'ADMIN'].includes(currentUser.role)) {
    window.location.replace('/dashboard.html');
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
      window.SIRKULA.toast(window.SIRKULA.t('Logged out.'), 'info');
      window.location.href = '/login.html';
    });
  });
}

function setupMobileDrawer() {
  const btn = document.getElementById('mobile-menu-btn');
  const drawer = document.getElementById('mobile-drawer');
  const closeBtn = document.getElementById('mobile-drawer-close');
  if (!drawer) return;
  if (btn) btn.addEventListener('click', () => drawer.classList.add('open'));
  if (closeBtn) closeBtn.addEventListener('click', () => drawer.classList.remove('open'));
  drawer.querySelectorAll('a, button').forEach((item) => item.addEventListener('click', () => drawer.classList.remove('open')));
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
  if (/^https?:\/\//i.test(value) || String(value).startsWith('/') || /^data:image\//i.test(String(value))) return value;
  return '/uploads/' + value;
};

window.SIRKULA.categoryImage = function (category) {
  const key = String(category || '').trim().toLowerCase();
  const map = {
    bakery: '/images/food/bakery.jpg',
    produce: '/images/food/produce.jpg',
    'prepared food': '/images/food/prepared.jpg',
    dairy: '/images/food/dairy.jpg',
    snacks: '/images/food/snacks.jpg',
    beverages: '/images/food/juice.jpg',
    pantry: '/images/food/grocery.jpg',
    meat: '/images/food/chicken.jpg',
    other: '/images/food/grocery.jpg',
  };
  return map[key] || '/images/food/grocery.jpg';
};

window.SIRKULA.PRODUCT_IMAGE_MAP = {
  listing_demo_001: '/images/food/bakery.jpg',
  listing_demo_002: '/images/food/mixed-fruit.jpg',
  listing_demo_003: '/images/food/prepared.jpg',
  listing_demo_004: '/images/food/milk.jpg',
  listing_demo_005: '/images/food/croissants.jpg',
  listing_demo_006: '/images/food/bread.jpg',
  listing_demo_007: '/images/food/greens.jpg',
  listing_demo_008: '/images/food/mixed-fruit.jpg',
  listing_demo_009: '/images/food/tomatoes-carrots.jpg',
  listing_demo_010: '/images/food/nasi-box.jpg',
  listing_demo_011: '/images/food/pasta.jpg',
  listing_demo_012: '/images/food/chips.jpg',
  listing_demo_013: '/images/food/yogurt.jpg',
  listing_demo_014: '/images/food/cheese.jpg',
  listing_demo_015: '/images/food/soy-milk.jpg',
  listing_demo_016: '/images/food/cookies.jpg',
  listing_demo_017: '/images/food/chips.jpg',
  listing_demo_018: '/images/food/rice.jpg',
  listing_demo_019: '/images/food/cooking-oil.jpg',
  listing_demo_020: '/images/food/juice.jpg',
  listing_demo_021: '/images/food/chicken.jpg',
  listing_demo_022: '/images/food/grocery.jpg',
  listing_demo_023: '/images/food/donuts.jpg',
  listing_demo_024: '/images/food/apples.jpg',
};

window.SIRKULA.productImage = function (listing) {
  if (!listing) return window.SIRKULA.categoryImage('');
  if (listing.id && window.SIRKULA.PRODUCT_IMAGE_MAP[listing.id]) {
    return window.SIRKULA.resolveImageUrl(window.SIRKULA.PRODUCT_IMAGE_MAP[listing.id]);
  }
  const title = String(listing.title || '').toLowerCase();
  const keywordMap = [
    ['croissant', '/images/food/croissants.jpg'],
    ['danish', '/images/food/croissants.jpg'],
    ['donat', '/images/food/donuts.jpg'],
    ['roti tawar', '/images/food/bread.jpg'],
    ['roti', '/images/food/bakery.jpg'],
    ['pastri', '/images/food/bakery.jpg'],
    ['apel', '/images/food/apples.jpg'],
    ['tomat', '/images/food/tomatoes-carrots.jpg'],
    ['wortel', '/images/food/tomatoes-carrots.jpg'],
    ['sayur', '/images/food/greens.jpg'],
    ['buah', '/images/food/mixed-fruit.jpg'],
    ['nasi box', '/images/food/nasi-box.jpg'],
    ['pasta', '/images/food/pasta.jpg'],
    ['yogurt', '/images/food/yogurt.jpg'],
    ['keju', '/images/food/cheese.jpg'],
    ['susu kedelai', '/images/food/soy-milk.jpg'],
    ['susu', '/images/food/milk.jpg'],
    ['kue kering', '/images/food/cookies.jpg'],
    ['keripik', '/images/food/chips.jpg'],
    ['beras', '/images/food/rice.jpg'],
    ['minyak', '/images/food/cooking-oil.jpg'],
    ['jus', '/images/food/juice.jpg'],
    ['ayam', '/images/food/chicken.jpg'],
    ['sembako', '/images/food/grocery.jpg'],
  ];
  for (const [keyword, image] of keywordMap) {
    if (title.includes(keyword)) return window.SIRKULA.resolveImageUrl(image);
  }
  return window.SIRKULA.categoryImage(listing.category);
};

window.SIRKULA.listingImage = function (listing) {
  const first = listing && Array.isArray(listing.images) ? listing.images[0] : (listing ? listing.image : '');
  if (first) return window.SIRKULA.resolveImageUrl(first);
  return window.SIRKULA.productImage(listing);
};

function appendListingText(parent, tagName, className, value) {
  const el = document.createElement(tagName);
  if (className) el.className = className;
  el.textContent = value == null ? '' : String(value);
  parent.appendChild(el);
  return el;
}

function listingLabel(value) {
  return String(value || '').replace(/[_-]+/g, ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

window.SIRKULA.createListingCard = function (listing, options = {}) {
  const featured = Boolean(options.featured);
  const card = document.createElement('article');
  card.className = `card listing-card${featured ? ' listing-card--featured' : ''}`;

  const media = document.createElement('div');
  media.className = 'listing-card__media';
  const img = document.createElement('img');
  img.className = 'listing-card__image';
  img.alt = listing.title ? `Foto ${listing.title}` : window.SIRKULA.t('Foto surplus makanan');
  img.loading = 'lazy';
  img.decoding = 'async';
  img.addEventListener('error', () => {
    const fallback = window.SIRKULA.categoryImage(listing.category);
    const normalizedFallback = new URL(fallback, window.location.href).href;
    if (!img.dataset.fallbackTried && img.src !== normalizedFallback) {
      img.dataset.fallbackTried = 'true';
      img.src = fallback;
      return;
    }
    img.remove();
    media.classList.add('is-placeholder');
    const placeholder = document.createElement('div');
    placeholder.className = 'listing-card__placeholder';
    const glyph = document.createElement('span');
    glyph.setAttribute('aria-hidden', 'true');
    glyph.innerHTML = window.SIRKULA.icon ? window.SIRKULA.icon('leaf') : '🌿';
    placeholder.appendChild(glyph);
    appendListingText(placeholder, 'span', '', window.SIRKULA.t(listingLabel(listing.category || 'Other')) || listingLabel(listing.category || 'Other'));
    media.appendChild(placeholder);
  }, { once: false });
  img.src = window.SIRKULA.listingImage(listing);
  media.appendChild(img);
  card.appendChild(media);

  const body = document.createElement('div');
  body.className = 'card-body listing-card__body';
  const badgeRow = document.createElement('div');
  badgeRow.className = 'listing-card__badges';
  appendListingText(badgeRow, 'span', 'badge badge-category', window.SIRKULA.t(listing.category || 'Other') || listingLabel(listing.category || 'Other'));
  const status = String(listing.status || 'AVAILABLE').toLowerCase().replace(/[^a-z0-9-]/g, '');
  appendListingText(badgeRow, 'span', `badge badge-${status}`, window.SIRKULA.t(listing.status || 'AVAILABLE') || listingLabel(listing.status || 'Available'));
  body.appendChild(badgeRow);

  appendListingText(body, 'h3', 'listing-card__title', listing.title || window.SIRKULA.t('Untitled listing'));
  appendListingText(body, 'p', 'listing-card__description', listing.description || window.SIRKULA.t('Surplus food available for pickup.'));

  const meta = document.createElement('div');
  meta.className = 'listing-card__meta';
  const quantity = listing.availableQuantity != null ? listing.availableQuantity : listing.quantity;
  appendListingText(meta, 'span', 'meta-quantity', `${Number(quantity) || 0} ${window.SIRKULA.t(listing.unit || 'items')}`);
  appendListingText(meta, 'span', 'meta-price', window.SIRKULA.formatCurrency(listing.price));
  appendListingText(meta, 'span', 'meta-date', window.SIRKULA.formatDate(listing.pickupDeadline));
  body.appendChild(meta);

  const actions = document.createElement('div');
  actions.className = 'listing-card__actions';
  const view = document.createElement('a');
  view.className = 'btn btn-primary';
  view.href = `/listing-detail.html?id=${encodeURIComponent(listing.id || '')}`;
  view.textContent = featured ? window.SIRKULA.t('View details') : window.SIRKULA.t('View');
  actions.appendChild(view);
  if (!featured) {
    const similar = document.createElement('a');
    similar.className = 'btn btn-outline';
    similar.href = `/marketplace.html?q=${encodeURIComponent(listing.title || '')}`;
    similar.textContent = window.SIRKULA.t('Similar');
    actions.appendChild(similar);
  }
  body.appendChild(actions);
  card.appendChild(body);
  return card;
};

// Auto-init when DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
