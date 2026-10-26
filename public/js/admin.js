/* SIRKULA — Admin dashboard (demo localStorage simulation) */
document.addEventListener('DOMContentLoaded', () => {
  const me = window.SIRKULA.currentUser();
  if (!me || me.role !== 'ADMIN') {
    window.location.href = '/login.html';
    return;
  }

  loadStats();
  loadUsers();
  loadListings();
  loadReports();
});

function loadStats() {
  const users = window.SIRKULA.storage.getUsers();
  const listings = window.SIRKULA.storage.getListings();
  const reports = window.SIRKULA.storage.getReports();
  const sellers = users.filter((u) => u.role === 'SELLER').length;
  const receivers = users.filter((u) => u.role === 'RECEIVER').length;
  const activeListings = listings.filter((l) => l.status === 'AVAILABLE').length;
  document.getElementById('adminStats').innerHTML = `
    <div class="stat-card"><div class="stat-value">${sellers}</div><div class="stat-label">sellers</div></div>
    <div class="stat-card"><div class="stat-value">${receivers}</div><div class="stat-label">receivers</div></div>
    <div class="stat-card"><div class="stat-value">${activeListings}</div><div class="stat-label">active listings</div></div>
    <div class="stat-card"><div class="stat-value">${reports.length}</div><div class="stat-label">reports</div></div>
  `;
}

function loadUsers() {
  const el = document.getElementById('adminUsers');
  const users = window.SIRKULA.storage.getUsers();
  el.innerHTML = '<table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Action</th></tr></thead><tbody>' +
    users.map((u) => `
      <tr>
        <td>${escapeHtml(u.name)}</td><td>${escapeHtml(u.email)}</td><td>${u.role}</td>
        <td>${window.SIRKULA.setBadge(u.status)}</td>
        <td><button class="btn btn-sm btn-outline" onclick="window.SIRKULA.toggleUser('${u.id}','${u.status}','${escapeHtml(u.name)}')">${u.status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}</button></td>
      </tr>
    `).join('') + '</tbody></table>';
}

function loadListings() {
  const el = document.getElementById('adminListings');
  const items = window.SIRKULA.storage.getListings();
  el.innerHTML = '<table><thead><tr><th>Title</th><th>Seller</th><th>Status</th><th>Action</th></tr></thead><tbody>' +
    items.map((l) => {
      const seller = window.SIRKULA.storage.getUserById(l.sellerId);
      return `
        <tr>
          <td>${escapeHtml(l.title)}</td><td>${escapeHtml(seller ? seller.name : '—')}</td>
          <td>${window.SIRKULA.setBadge(l.status)}</td>
          <td><select onchange="window.SIRKULA.moderateListing('${l.id}', this.value)">
            <option value="">Moderate</option><option value="AVAILABLE">Available</option><option value="UNAVAILABLE">Unavailable</option><option value="EXPIRED">Expired</option>
          </select></td>
        </tr>
      `;
    }).join('') + '</tbody></table>';
}

function loadReports() {
  const el = document.getElementById('adminReports');
  const items = window.SIRKULA.storage.getReports();
  el.innerHTML = '<table><thead><tr><th>Listing</th><th>Reporter</th><th>Reason</th><th>Status</th><th>Action</th></tr></thead><tbody>' +
    items.map((r) => {
      const listing = window.SIRKULA.storage.getListingById(r.listingId);
      const reporter = window.SIRKULA.storage.getUserById(r.reporterId);
      return `
        <tr>
          <td>${escapeHtml(listing ? listing.title : '—')}</td><td>${escapeHtml(reporter ? reporter.name : '—')}</td>
          <td>${escapeHtml(r.reason)}</td><td>${window.SIRKULA.setBadge(r.status)}</td>
          <td><select onchange="window.SIRKULA.updateReport('${r.id}', this.value)">
            <option value="">Update</option><option value="REVIEWED">Reviewed</option><option value="RESOLVED">Resolved</option><option value="DISMISSED">Dismissed</option>
          </select></td>
        </tr>
      `;
    }).join('') + '</tbody></table>';
}

window.SIRKULA = window.SIRKULA || {};
window.SIRKULA.toggleUser = function (id, current, name) {
  const next = current === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
  if (!confirm((next === 'SUSPENDED' ? window.SIRKULA.t('Suspend') : window.SIRKULA.t('Reactivate')) + ' "' + escapeHtml(name) + '"?')) return;
  try {
    const updated = window.SIRKULA.storage.updateUser(id, { status: next });
    if (updated) {
      window.SIRKULA.toast(window.SIRKULA.t('User') + ' ' + window.SIRKULA.t(next), 'success');
      loadUsers();
    } else {
      window.SIRKULA.toast(window.SIRKULA.t('Failed'), 'error');
    }
  } catch (e) { window.SIRKULA.toast(e.message || 'Failed', 'error'); }
};
window.SIRKULA.moderateListing = function (id, status) {
  if (!status) return;
  try {
    const updated = window.SIRKULA.storage.updateListing(id, { status: status });
    if (updated) {
      window.SIRKULA.toast(window.SIRKULA.t('Listing updated'), 'success');
      loadListings();
    } else {
      window.SIRKULA.toast('Failed', 'error');
    }
  } catch (e) { window.SIRKULA.toast(e.message || 'Failed', 'error'); }
};
window.SIRKULA.updateReport = function (id, status) {
  if (!status) return;
  try {
    const updated = window.SIRKULA.storage.updateReport(id, { status: status });
    if (updated) {
      window.SIRKULA.toast(window.SIRKULA.t('Report updated'), 'success');
      loadReports();
    } else {
      window.SIRKULA.toast('Failed', 'error');
    }
  } catch (e) { window.SIRKULA.toast(e.message || 'Failed', 'error'); }
};

function escapeHtml(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>\"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c]));
}