/* SIRKULA — Marketplace filters and local demo listings. */
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('marketSearch');
  const grid = document.getElementById('marketListings');
  const pagination = document.getElementById('marketPagination');
  const categorySelect = document.getElementById('fCategory');
  const conditionSelect = document.getElementById('fCondition');
  const statusSelect = document.getElementById('fStatus');
  const sortSelect = document.getElementById('fSort');
  if (!form || !grid || !pagination || !categorySelect || !conditionSelect || !statusSelect || !sortSelect) return;

  const params = new URLSearchParams(window.location.search);
  const searchInput = form.querySelector('[name="q"]');
  if (searchInput && params.get('q')) searchInput.value = params.get('q');

  const state = {
    q: params.get('q') || '', category: '', condition: '', status: 'AVAILABLE', sort: 'newest', page: 1, limit: 12,
  };

  categorySelect.innerHTML = '<option value="">All categories</option>';
  conditionSelect.innerHTML = '<option value="">All conditions</option><option value="Fresh">Fresh</option><option value="Near-expiry">Near-expiry</option><option value="Packaged">Packaged</option><option value="Frozen">Frozen</option>';
  sortSelect.innerHTML = '<option value="newest">Newest</option><option value="deadline">Earliest deadline</option><option value="nearest">Nearest (Jakarta demo)</option>';
  statusSelect.innerHTML = '<option value="AVAILABLE">Available</option><option value="">All statuses</option><option value="UNAVAILABLE">Unavailable</option>';

  const allListings = window.SIRKULA.storage.getListings();
  [...new Set(allListings.map((listing) => listing.category).filter(Boolean))].sort().forEach((category) => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  });
  categorySelect.value = state.category;
  conditionSelect.value = state.condition;
  statusSelect.value = state.status;
  sortSelect.value = state.sort;

  function distanceFromJakarta(listing) {
    if (typeof listing.pickupLat !== 'number' || typeof listing.pickupLng !== 'number') return Number.POSITIVE_INFINITY;
    const lat = -6.2088;
    const lng = 106.8456;
    const toRad = (value) => value * Math.PI / 180;
    const dLat = toRad(listing.pickupLat - lat);
    const dLng = toRad(listing.pickupLng - lng);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat)) * Math.cos(toRad(listing.pickupLat)) * Math.sin(dLng / 2) ** 2;
    return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function load() {
    let items = window.SIRKULA.storage.getListings({
      q: state.q,
      category: state.category,
      status: state.status || undefined,
    });
    if (state.condition) items = items.filter((listing) => listing.condition === state.condition);

    if (state.sort === 'newest') items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    else if (state.sort === 'deadline') items.sort((a, b) => new Date(a.pickupDeadline) - new Date(b.pickupDeadline));
    else if (state.sort === 'nearest') items.sort((a, b) => distanceFromJakarta(a) - distanceFromJakarta(b));

    const total = items.length;
    const totalPages = Math.max(1, Math.ceil(total / state.limit));
    state.page = Math.max(1, Math.min(state.page, totalPages));
    const start = (state.page - 1) * state.limit;
    render(items.slice(start, start + state.limit), total);
    renderPagination(totalPages);
  }

  function render(listings, total) {
    grid.replaceChildren();
    if (!listings.length) {
      const empty = document.createElement('div');
      empty.className = 'listing-empty';
      const title = document.createElement('strong');
      title.textContent = window.SIRKULA.t('No listings match your filters.');
      const hint = document.createElement('p');
      hint.textContent = window.SIRKULA.t('Try another category or clear your search to see more surplus food.');
      empty.append(title, hint);
      grid.appendChild(empty);
      return;
    }
    listings.forEach((listing) => grid.appendChild(window.SIRKULA.createListingCard(listing)));
    grid.setAttribute('aria-label', `${total} ${window.SIRKULA.t('surplus food listings')}`);
  }

  function renderPagination(totalPages) {
    pagination.replaceChildren();
    if (totalPages <= 1) return;
    const addPage = (page, label, current = false) => {
      if (current) {
        const span = document.createElement('span');
        span.className = 'current'; span.textContent = label; span.setAttribute('aria-current', 'page');
        pagination.appendChild(span);
      } else {
        const link = document.createElement('a');
        link.href = '#'; link.dataset.page = String(page); link.textContent = label;
        link.addEventListener('click', (event) => { event.preventDefault(); state.page = page; load(); });
        pagination.appendChild(link);
      }
    };
    if (state.page > 1) addPage(state.page - 1, window.SIRKULA.t('Prev'));
    for (let page = Math.max(1, state.page - 2); page <= Math.min(totalPages, state.page + 2); page += 1) addPage(page, String(page), page === state.page);
    if (state.page < totalPages) addPage(state.page + 1, window.SIRKULA.t('Next'));
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault(); state.q = searchInput ? searchInput.value.trim() : ''; state.page = 1; load();
  });
  categorySelect.addEventListener('change', () => { state.category = categorySelect.value; state.page = 1; load(); });
  conditionSelect.addEventListener('change', () => { state.condition = conditionSelect.value; state.page = 1; load(); });
  statusSelect.addEventListener('change', () => { state.status = statusSelect.value; state.page = 1; load(); });
  sortSelect.addEventListener('change', () => { state.sort = sortSelect.value; state.page = 1; load(); });
  load();
});
