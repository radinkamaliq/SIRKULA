/* SIRKULA — Dashboard (demo localStorage) */
document.addEventListener('DOMContentLoaded', () => {
  loadDashboard();
});

function loadDashboard() {
  const me = window.SIRKULA.currentUser();
  if (!me) return;

  const nameEl = document.getElementById('dash-name');
  const welcomeEl = document.getElementById('dash-welcome');
  if (nameEl) nameEl.textContent = me.name || me.email;

  const role = me.role;
  const welcome = role === 'SELLER'
    ? 'Manage your surplus listings, stock, and reservation requests.'
    : role === 'ADMIN'
      ? 'Monitor platform activity, users, and listings.'
      : 'Find surplus food and track your reservations.';
  if (welcomeEl) welcomeEl.textContent = welcome;

  const allListings = window.SIRKULA.storage.getListings();
  const allReservations = window.SIRKULA.storage.getReservations();
  const allUsers = window.SIRKULA.storage.getUsers();
  const myListings = allListings.filter((listing) => listing.sellerId === me.id);
  const myReservations = role === 'SELLER'
    ? allReservations.filter((reservation) => myListings.some((listing) => listing.id === reservation.listingId))
    : role === 'ADMIN'
      ? allReservations
      : allReservations.filter((reservation) => reservation.receiverId === me.id);
  const pendingCount = myReservations.filter((reservation) => reservation.status === 'PENDING').length;
  const completedCount = myReservations.filter((reservation) => reservation.status === 'COMPLETED').length;
  const completedUnits = allReservations
    .filter((reservation) => reservation.status === 'COMPLETED')
    .filter((reservation) => role !== 'SELLER' || myListings.some((listing) => listing.id === reservation.listingId))
    .filter((reservation) => role !== 'RECEIVER' || reservation.receiverId === me.id)
    .reduce((sum, reservation) => sum + (Number(reservation.quantity) || 0), 0);

  let stats;
  if (role === 'SELLER') {
    stats = [
      { label: 'My Listings', value: myListings.length },
      { label: 'Incoming Reservations', value: myReservations.length },
      { label: 'Pending Requests', value: pendingCount, highlight: true },
      { label: 'Units in Completed Pickups', value: completedUnits },
    ];
  } else if (role === 'ADMIN') {
    stats = [
      { label: 'Total Listings', value: allListings.length },
      { label: 'Users', value: allUsers.length },
      { label: 'Pending Requests', value: allReservations.filter((reservation) => reservation.status === 'PENDING').length, highlight: true },
      { label: 'Completed Pickups', value: allReservations.filter((reservation) => reservation.status === 'COMPLETED').length },
    ];
  } else {
    stats = [
      { label: 'Available Listings', value: allListings.filter((listing) => listing.status === 'AVAILABLE').length },
      { label: 'My Reservations', value: myReservations.length },
      { label: 'Pending Requests', value: pendingCount, highlight: true },
      { label: 'Completed Pickups', value: completedCount },
    ];
  }

  const statsEl = document.getElementById('dash-stats');
  if (statsEl) {
    statsEl.replaceChildren();
    stats.forEach((stat) => {
      const card = document.createElement('div');
      card.className = `stat-card${stat.highlight ? ' stat-highlight' : ''}`;
      const value = document.createElement('div'); value.className = 'stat-value'; value.textContent = String(stat.value);
      const label = document.createElement('div'); label.className = 'stat-label'; label.textContent = window.SIRKULA.t(stat.label);
      card.append(value, label); statsEl.appendChild(card);
    });
  }

  const activityEl = document.getElementById('dash-activity');
  const actionsEl = document.getElementById('dash-actions');
  const tableEl = document.getElementById('dash-table');
  const relevantReservations = myReservations.slice(0, 5);

  if (activityEl) {
    activityEl.replaceChildren();
    if (!relevantReservations.length) {
      const empty = document.createElement('div'); empty.className = 'empty-state';
      const paragraph = document.createElement('p'); paragraph.textContent = 'Belum ada aktivitas terbaru.'; empty.appendChild(paragraph);
      activityEl.appendChild(empty);
    } else {
      relevantReservations.forEach((reservation) => {
        const listing = window.SIRKULA.storage.getListingById(reservation.listingId);
        const item = document.createElement('div'); item.className = 'activity-item';
        const info = document.createElement('div'); info.className = 'activity-info';
        const title = document.createElement('p'); title.className = 'activity-title'; title.textContent = listing ? listing.title : window.SIRKULA.t('Item');
        const meta = document.createElement('p'); meta.className = 'activity-meta';
        meta.textContent = `${reservation.quantity} ${listing ? listing.unit : ''} · ${window.SIRKULA.formatDateTime(reservation.createdAt)}`;
        info.append(title, meta);
        const badgeWrap = document.createElement('span'); badgeWrap.innerHTML = window.SIRKULA.setBadge(reservation.status);
        item.append(info, badgeWrap); activityEl.appendChild(item);
      });
    }
  }

  if (actionsEl) {
    const actions = role === 'SELLER'
      ? [['/create-listing.html', '+ New Listing', true], ['/seller-inventory.html', 'Manage Inventory', false], ['/reservations.html', 'Reservation Requests', false]]
      : role === 'ADMIN'
        ? [['/admin.html', 'Admin Dashboard', true], ['/marketplace.html', 'View Marketplace', false], ['/impact.html', 'View Impact', false]]
        : [['/marketplace.html', 'Browse Surplus Food', true], ['/reservations.html', 'My Reservations', false], ['/notifications.html', 'Notifications', false]];
    actionsEl.replaceChildren();
    actions.forEach(([href, label, primary]) => {
      const link = document.createElement('a');
      link.href = href; link.className = `btn ${primary ? 'btn-primary' : 'btn-outline'} btn-block`;
      link.textContent = label; actionsEl.appendChild(link);
    });
  }

  if (tableEl) renderReservationsTable(tableEl, relevantReservations);

  const notifs = window.SIRKULA.storage.getNotifications({ userId: me.id, unreadOnly: true });
  const count = notifs.length;
  const navCount = document.getElementById('nav-notif-count');
  if (navCount) navCount.textContent = String(count);
}

function renderReservationsTable(el, reservations) {
  if (!reservations.length) {
    el.replaceChildren();
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    const message = document.createElement('p'); message.textContent = 'No reservations to display.';
    empty.appendChild(message); el.appendChild(empty);
    return;
  }
  const table = document.createElement('table');
  table.innerHTML = '<thead><tr><th>Listing</th><th>Qty</th><th>Status</th><th>Date</th></tr></thead>';
  const tbody = document.createElement('tbody');
  reservations.forEach((reservation) => {
    const listing = window.SIRKULA.storage.getListingById(reservation.listingId);
    const row = document.createElement('tr');
    const title = document.createElement('td'); title.textContent = listing ? listing.title : window.SIRKULA.t('Item');
    const quantity = document.createElement('td'); quantity.textContent = String(reservation.quantity);
    const status = document.createElement('td'); status.innerHTML = window.SIRKULA.setBadge(reservation.status);
    const date = document.createElement('td'); date.textContent = window.SIRKULA.formatDate(reservation.createdAt);
    row.append(title, quantity, status, date); tbody.appendChild(row);
  });
  table.appendChild(tbody);
  el.replaceChildren(table);
}

function escapeHtml(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>\"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c]));
}