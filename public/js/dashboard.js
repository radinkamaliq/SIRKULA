/* SIRKULA — Dashboard (demo localStorage) */
document.addEventListener('DOMContentLoaded', () => {
  loadDashboard();
});

function loadDashboard() {
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

  // Stats from local storage
  const statsEl = document.getElementById('dash-stats');
  const listings = window.SIRKULA.storage.getListings({ sellerId: me.id });
  const reservations = window.SIRKULA.storage.getReservations({ receiverId: me.id });
  const pendingCount = reservations.filter((r) => r.status === 'PENDING').length;

  // Compute distributed kg from completed reservations
  let totalDistributed = 0;
  const allRes = window.SIRKULA.storage.getReservations();
  allRes.forEach((r) => {
    if (r.status === 'COMPLETED') {
      const listing = window.SIRKULA.storage.getListingById(r.listingId);
      if (listing && listing.sellerId === me.id) {
        totalDistributed += r.quantity || 0;
      }
    }
  });

  const stats = [
    { label: 'My Listings', value: listings.length },
    { label: 'My Reservations', value: reservations.length },
    { label: 'Pending Requests', value: pendingCount, highlight: role === 'SELLER' },
    { label: 'Food Distributed (kg)', value: Math.round(totalDistributed) },
  ];
  statsEl.innerHTML = stats.map((s) => `
    <div class="stat-card${s.highlight ? ' stat-highlight' : ''}">
      <div class="stat-value">${s.value}</div>
      <div class="stat-label">${s.label}</div>
    </div>
  `).join('');

  // Activity (recent reservations relevant to user)
  const activityEl = document.getElementById('dash-activity');
  const actionsEl = document.getElementById('dash-actions');
  const tableEl = document.getElementById('dash-table');

  let relevantReservations = [];
  if (role === 'SELLER') {
    relevantReservations = window.SIRKULA.storage.getReservations({ sellerId: me.id });
  } else {
    relevantReservations = reservations;
  }
  relevantReservations = relevantReservations.slice(0, 5);

  if (relevantReservations.length === 0) {
    activityEl.innerHTML = '<div class="empty-state"><p>No recent activity.</p></div>';
  } else {
    activityEl.innerHTML = relevantReservations.map((r) => {
      const listing = window.SIRKULA.storage.getListingById(r.listingId);
      return `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:0.75rem 0;border-bottom:1px solid var(--color-border)">
          <div>
            <div style="font-weight:600">${escapeHtml(listing ? listing.title : 'Item')}</div>
            <div style="font-size:0.85rem;color:var(--color-muted)">${r.quantity} ${listing ? listing.unit : ''} &bull; ${window.SIRKULA.formatDateTime(r.createdAt)}</div>
          </div>
          ${window.SIRKULA.setBadge(r.status)}
        </div>
      `;
    }).join('');
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
      <a href="/reservations.html" class="btn btn-outline btn-block">My Reservations</a>
      <a href="/notifications.html" class="btn btn-outline btn-block">Notifications</a>
    `;
  }

  // Table: recent reservations (receiver) or empty (seller)
  if (role === 'SELLER') {
    tableEl.innerHTML = '<div class="empty-state"><p>Manage listings in Inventory.</p></div>';
  } else {
    renderReservationsTable(tableEl, relevantReservations);
  }

  // Notifications count from storage
  const notifs = window.SIRKULA.storage.getNotifications({ userId: me.id, unreadOnly: true });
  const count = notifs.length;
  document.getElementById('nav-notif-count').textContent = count;
  document.getElementById('dash-notif-count').textContent = count;
}

function renderReservationsTable(el, reservations) {
  el.innerHTML = `
    <table>
      <thead><tr><th>Listing</th><th>Qty</th><th>Status</th><th>Date</th></tr></thead>
      <tbody>
        ${reservations.map((r) => {
          const listing = window.SIRKULA.storage.getListingById(r.listingId);
          return `
            <tr>
              <td>${escapeHtml(listing ? listing.title : 'Item')}</td>
              <td>${r.quantity}</td>
              <td>${window.SIRKULA.setBadge(r.status)}</td>
              <td>${window.SIRKULA.formatDate(r.createdAt)}</td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;
}

function escapeHtml(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>\"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c]));
}