/* SIRKULA — Marketplace search/filter/sort/pagination */
document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('marketSearch');
  const grid = document.getElementById('marketListings');
  const pag = document.getElementById('marketPagination');
  const fCategory = document.getElementById('fCategory');
  const fCondition = document.getElementById('fCondition');
  const fStatus = document.getElementById('fStatus');
  const fSort = document.getElementById('fSort');

  // URL params -> form
  const params = new URLSearchParams(location.search);
  if (params.get('q')) form.q.value = params.get('q');

  let state = {
    q: params.get('q') || '',
    category: '',
    condition: '',
    status: 'AVAILABLE',
    sort: 'newest',
    page: 1,
    limit: 12,
    lat: null, lng: null,
  };

  // Options for filters
  fCategory.innerHTML = '<option value="">All categories</option>';
  fCondition.innerHTML = '<option value="">All conditions</option><option>Fresh</option><option>Near-expiry</option><option>Packaged</option><option>Frozen</option>';
  fCondition.value = state.condition;
  fStatus.value = state.status;
  fSort.value = state.sort;

  // Load categories
  try {
    const c = await window.SIRKULA.api.get('/marketplace/categories');
    (c.data || []).forEach((cat) => {
      const o = document.createElement('option'); o.value = cat; o.textContent = cat;
      fCategory.appendChild(o);
    });
  } catch (_) {}

  // Geolocation for nearest sort
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => { state.lat = pos.coords.latitude; state.lng = pos.coords.longitude; load(); },
      () => {}
    );
  }

  async function load() {
    const qs = new URLSearchParams();
    if (state.q) qs.set('q', state.q);
    if (state.category) qs.set('category', state.category);
    if (state.condition) qs.set('condition', state.condition);
    qs.set('status', state.status);
    qs.set('sort', state.sort);
    qs.set('page', state.page);
    qs.set('limit', state.limit);
    if (state.lat != null) { qs.set('lat', state.lat); qs.set('lng', state.lng); }

    try {
      const data = await window.SIRKULA.api.get('/marketplace?' + qs.toString());
      const d = data.data || {};
      render(d.listings || []);
      renderPagination(d.total, d.page, d.limit);
    } catch (e) {
      grid.innerHTML = '<div class="empty-state"><p>Unable to load listings.</p></div>';
      pag.innerHTML = '';
    }
  }

  function render(listings) {
    grid.innerHTML = '';
    if (!listings || listings.length === 0) {
      grid.innerHTML = '<div class="empty-state"><p>No listings match your filters.</p></div>';
      return;
    }
    listings.forEach((l) => {
      const card = document.createElement('div');
      card.className = 'card listing-card';
      const dist = l._distance != null ? ` &bull; ${l._distance.toFixed(1)} km` : '';
      card.innerHTML = `
        <div style="height:150px;overflow:hidden;border-bottom:1px solid var(--color-border)">
          ${l.images && l.images[0] ? `<img src="/uploads/${l.images[0]}" alt="" style="width:100%;height:100%;object-fit:cover">` : `<div style="width:100%;height:100%;background:var(--color-ivory);display:flex;align-items:center;justify-content:center;color:var(--color-muted)">${icon('leaf')}</div>`}
        </div>
        <div class="card-body" style="padding:0.85rem">
          <div style="display:flex;justify-content:space-between;gap:0.5rem;margin-bottom:0.35rem">
            <span class="badge badge-available">${l.category}</span>
            <span class="badge badge-${l.status.toLowerCase()}">${l.status}</span>
          </div>
          <h4 style="margin:0 0 0.4rem;font-size:1rem">${escapeHtml(l.title)}</h4>
          <p style="font-size:0.85rem;color:var(--color-muted);margin-bottom:0.5rem">${escapeHtml(l.description||'')}</p>
          <div style="font-size:0.85rem;color:var(--color-muted);margin-bottom:0.4rem">${l.quantity} ${l.unit} &bull; ${window.SIRKULA.formatDate(l.pickupDeadline)}${dist}</div>
          <div style="display:flex;gap:0.5rem">
            <a href="/listing-detail.html?id=${l.id}" class="btn btn-sm btn-primary flex-1">View</a>
            <a href="/marketplace.html?q=${encodeURIComponent(l.title)}" class="btn btn-sm btn-outline">Similar</a>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  function renderPagination(total, page, limit) {
    const totalPages = Math.ceil(total / limit) || 1;
    pag.innerHTML = '';
    if (totalPages <= 1) return;
    const pageLink = (p, label) => `<a href="#" data-page="${p}">${label}</a>`;
    let html = '';
    if (page > 1) html += pageLink(page - 1, 'Prev');
    for (let p = Math.max(1, page - 2); p <= Math.min(totalPages, page + 2); p++) {
      html += p === page ? `<span class="current">${p}</span>` : pageLink(p, p);
    }
    if (page < totalPages) html += pageLink(page + 1, 'Next');
    pag.innerHTML = html;
    pag.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        state.page = Number(a.dataset.page);
        load();
      });
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    state.q = form.q.value.trim();
    state.page = 1;
    load();
  });
  fCategory.addEventListener('change', (e) => { state.category = e.target.value; state.page = 1; load(); });
  fCondition.addEventListener('change', (e) => { state.condition = e.target.value; state.page = 1; load(); });
  fStatus.addEventListener('change', (e) => { state.status = e.target.value; state.page = 1; load(); });
  fSort.addEventListener('change', (e) => { state.sort = e.target.value; state.page = 1; load(); });

  load();
});

function escapeHtml(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c]));
}
