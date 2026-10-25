/* SIRKULA — Landing page: featured listings + impact stats (demo localStorage) */
document.addEventListener('DOMContentLoaded', () => {
  loadFeatured();
  loadImpact();
});

async function loadFeatured() {
  const el = document.getElementById('featured-listings');
  if (!el) return;
  try {
    const listings = window.SIRKULA.storage.getListings({ status: 'AVAILABLE' }).slice(0, 6);
    el.innerHTML = '';
    if (listings.length === 0) {
      el.innerHTML = '<div class="empty-state"><p>No featured listings available yet.</p></div>';
      return;
    }
    listings.forEach((l) => {
      const card = document.createElement('div');
      card.className = 'card listing-card';
      card.innerHTML = `
        <div style="height:180px;overflow:hidden;border-bottom:1px solid var(--color-border);background:rgba(255,255,255,0.08)">
          <img src="${window.SIRKULA.listingImage(l)}" alt="${escapeHtml(l.title)}" loading="lazy" style="width:100%;height:100%;object-fit:cover" onerror="this.onerror=null;this.src='/images/food/snacks.jpg'">
        </div>
        <div class="card-body" style="padding:0.85rem">
          <div style="display:flex;justify-content:space-between;align-items:start;gap:0.5rem;margin-bottom:0.4rem">
            <span class="badge badge-available">${l.category}</span>
            <span class="badge badge-available">${l.status}</span>
          </div>
          <h4 style="margin:0 0 0.4rem;font-size:1.05rem">${escapeHtml(l.title)}</h4>
          <p style="font-size:0.85rem;color:var(--color-muted);margin-bottom:0.6rem">${escapeHtml(l.description || '')}</p>
          <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.85rem">
            <span>${l.quantity} ${l.unit}</span>
            <span>${window.SIRKULA.formatCurrency(l.price)}</span>
            <span>${window.SIRKULA.formatDate(l.pickupDeadline)}</span>
          </div>
        </div>
        <a href="/listing-detail.html?id=${l.id}" class="btn btn-sm btn-primary btn-block" style="margin-top:0.5rem">View details</a>
      `;
      el.appendChild(card);
    });
  } catch (e) {
    el.innerHTML = '<div class="empty-state"><p>Unable to load listings.</p></div>';
  }
}

async function loadImpact() {
  const el = document.getElementById('impact-stats');
  if (!el) return;
  try {
    const listings = window.SIRKULA.storage.getListings();
    const reservations = window.SIRKULA.storage.getReservations();
    const users = window.SIRKULA.storage.getUsers();
    const completed = reservations.filter((r) => r.status === 'COMPLETED');
    let totalDistributed = 0;
    completed.forEach((r) => { totalDistributed += r.quantity || 0; });
    const sellers = users.filter((u) => u.role === 'SELLER').length;
    const receivers = users.filter((u) => u.role === 'RECEIVER').length;
    const active = listings.filter((l) => l.status === 'AVAILABLE').length;
    el.innerHTML = `
      <div class="stat"><div class="stat-value">${Math.round(totalDistributed)}</div><div class="stat-label">kg distributed</div></div>
      <div class="stat"><div class="stat-value">${completed.length}</div><div class="stat-label">completed pickups</div></div>
      <div class="stat"><div class="stat-value">${active}</div><div class="stat-label">active listings</div></div>
      <div class="stat"><div class="stat-value">${sellers}</div><div class="stat-label">sellers</div></div>
      <div class="stat"><div class="stat-value">${receivers}</div><div class="stat-label">receivers</div></div>
    `;
  } catch (e) {
    el.innerHTML = '<div class="empty-state"><p>Impact data unavailable.</p></div>';
  }
}

function escapeHtml(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>\"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c]));
}