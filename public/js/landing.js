/* SIRKULA — Landing page: featured listings + impact stats */
document.addEventListener('DOMContentLoaded', async () => {
  await loadFeatured();
  await loadImpact();
});

async function loadFeatured() {
  const el = document.getElementById('featured-listings');
  if (!el) return;
  try {
    const data = await window.SIRKULA.api.get('/marketplace?limit=6&status=AVAILABLE');
    const listings = data.data.listings || [];
    el.innerHTML = '';
    if (listings.length === 0) {
      el.innerHTML = '<div class="empty-state"><p>No featured listings available yet.</p></div>';
      return;
    }
    listings.forEach((l) => {
      const card = document.createElement('div');
      card.className = 'card listing-card';
      card.innerHTML = `
        <div style="height:140px;overflow:hidden;border-bottom:1px solid var(--color-border)">
          ${l.images && l.images[0] ? `<img src="/uploads/${l.images[0]}" alt="${escapeHtml(l.title)}" style="width:100%;height:100%;object-fit:cover">` : `<div style="width:100%;height:100%;background:var(--color-ivory);display:flex;align-items:center;justify-content:center;color:var(--color-muted)">${icon('leaf')}</div>`}
        </div>
        <div class="card-body" style="padding:0.85rem">
          <div style="display:flex;justify-content:space-between;align-items:start;gap:0.5rem;margin-bottom:0.4rem">
            <span class="badge badge-available">${l.category}</span>
            <span class="badge badge-available">${l.status}</span>
          </div>
          <h4 style="margin:0 0 0.4rem;font-size:1.05rem">${escapeHtml(l.title)}</h4>
          <p style="font-size:0.85rem;color:var(--color-muted);margin-bottom:0.6rem">${escapeHtml(l.description||'')}</p>
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
    const data = await window.SIRKULA.api.get('/impact/stats');
    const d = data.data || {};
    el.innerHTML = `
      <div class="stat"><div class="stat-value">${d.totalDistributed || 0}</div><div class="stat-label">kg distributed</div></div>
      <div class="stat"><div class="stat-value">${d.completedReservations || 0}</div><div class="stat-label">completed pickups</div></div>
      <div class="stat"><div class="stat-value">${d.activeListings || 0}</div><div class="stat-label">active listings</div></div>
      <div class="stat"><div class="stat-value">${d.sellersCount || 0}</div><div class="stat-label">sellers</div></div>
      <div class="stat"><div class="stat-value">${d.receiversCount || 0}</div><div class="stat-label">receivers</div></div>
    `;
  } catch (e) {
    el.innerHTML = '<div class="empty-state"><p>Impact data unavailable.</p></div>';
  }
}

function escapeHtml(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c]));
}
