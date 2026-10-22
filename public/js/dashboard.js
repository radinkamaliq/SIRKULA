/* SIRKULA — Dashboard */
document.addEventListener('DOMContentLoaded', async () => {
  await loadDashboard();
});

async function loadDashboard() {
  const me = window.SIRKULA.currentUser();
  if (!me) return;
  document.getElementById('dash-name').textContent = me.name || me.email;

  const role = me.role;
  const welcome = role === 'SELLER'
    ? 'Manage your surplus food listings and reservations.'
    : role === 'ADMIN'
      ? 'Oversee platform activity, users, and moderation.'
      : 'Browse surplus food and manage your reservations.';
  document.getElementById('dash-welcome').textContent = welcome;

  // Stats
  const statsEl = document.getElementById('dash-stats');
  let listingsCount = 0, reservationsCount = 0, pendingCount = 0;

  try {
    const listingsRes = await window.SIRKULA.api.get('/listings');
    listingsCount = (listingsRes.data.listings || []).length;
  } catch (_) {}

  try {
    const resRes = await window.SIRKULA.api.get('/reservations');
    const reservations = resRes.data.reservations || [];
    reservationsCount = reservations.length;
    pendingCount = reservations.filter((r) => r.status === 'PENDING').length;
  } catch (_) {}

  const impact = await fetchImpact();

  const stats = [
    { label: 'My Listings', value: listingsCount },
    { label: 'My Reservations', value: reservationsCount },
    { label: 'Pending Requests', value: pendingCount, highlight: role === 'SELLER' },
    { label: 'Food Distributed (kg)', value: impact.totalDistributed || 0 },
  ];
  statsEl.innerHTML = stats.map((s) => `
    <div class="stat-card${s.highlight ? ' stat-highlight' : ''}">
      <div class="stat-value">${s.value}</div>
      <div class="stat-label">${s.label}</div>
    </div>
  `).join('');

  // Activity
  const activityEl = document.getElementById('dash-activity');
  const actionsEl = document.getElementById('dash-actions');
  const tableEl = document.getElementById('dash-table');

  let recentReservations = [];
  try {
    const rr = await window.SIRKULA.api.get('/reservations?limit=5');
    recentReservations = rr.data.reservations || [];
  } catch (_) {}

  if (recentReservations.length === 0) {
    activityEl.innerHTML = '<div class="empty-state"><p>No recent activity.</p></div>';
  } else {
    activityEl.innerHTML = recentReservations.map((r) => `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:0.75rem 0;border-bottom:1px solid var(--color-border)">
        <div>
          <div style="font-weight:600">${escapeHtml(r.listing.title)}</div>
          <div style="font-size:0.85rem;color:var(--color-muted)">${r.quantity} ${r.listing.unit} &bull; ${window.SIRKULA.formatDateTime(r.createdAt)}</div>
        </div>
        ${window.SIRKULA.setBadge(r.status)}
      </div>
    `).join('');
  }

  // Quick actions
  if (role === 'SELLER') {
    actionsEl.innerHTML = `
      <a href="/create-listing.html" class="btn btn-primary btn-block" style="margin-bottom:0.5rem">+ New Listing</a>
      <a href="/seller-inventory.html" class="btn btn-outline btn-block" style="margin-bottom:0.5rem">Manage Inventory</a>
      <a href="/reservations.html" class="btn btn-outline btn-block">Reservations</a>
    `;
  } else if (role === 'ADMIN') {
    actionsEl.innerHTML = `
      <a href="/admin.html" class="btn btn-primary btn-block" style="margin-bottom:0.5rem">Admin Dashboard</a>
      <a href="/marketplace.html" class="btn btn-outline btn-block" style="margin-bottom:0.5rem">Marketplace</a>
      <a href="/notifications.html" class="btn btn-outline btn-block">Notifications</a>
    `;
  } else {
    actionsEl.innerHTML = `
      <a href="/marketplace.html" class="btn btn-primary btn-block" style="margin-bottom:0.5rem">Browse Surplus Food</a>
      <a href="/reservations.html" class="btn btn-outline btn-block" style="margin-bottom:0.5rem">My Reservations</a>
      <a href="/notifications.html" class="btn btn-outline btn-block">Notifications</a>
    `;
  }

  // Table: recent listings (seller) or reservations (receiver)
  if (role === 'SELLER') {
    tableEl.innerHTML = '<div class="empty-state"><p>Manage listings in Inventory.</p></div>';
  } else {
    renderReservationsTable(tableEl, recentReservations);
  }

  // Notifications count
  try {
    const notif = await window.SIRKULA.api.get('/notifications?limit=1&unreadOnly=true');
    const count = notif.data.unreadCount || 0;
    document.getElementById('nav-notif-count').textContent = count;
    document.getElementById('dash-notif-count').textContent = count;
  } catch (_) {}
}

async function fetchImpact() {
  try {
    const d = await window.SIRKULA.api.get('/impact/stats');
    return d.data || {};
  } catch (_) { return {}; }
}

function renderReservationsTable(el, reservations) {
  el.innerHTML = `
    <table>
      <thead><tr><th>Listing</th><th>Qty</th><th>Status</th><th>Date</th></tr></thead>
      <tbody>
        ${reservations.map((r) => `
          <tr>
            <td>${escapeHtml(r.listing.title)}</td>
            <td>${r.quantity}</td>
            <td>${window.SIRKULA.setBadge(r.status)}</td>
            <td>${window.SIRKULA.formatDate(r.createdAt)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function escapeHtml(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c]));
}
