/* SIRKULA — Admin dashboard */
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const stats = await window.SIRKULA.api.get('/admin/stats');
    const s = stats.data || {};
    document.getElementById('adminStats').innerHTML = `
      <div class="stat-card"><div class="stat-value">${(s.users && s.users.find(u=>u.role==='SELLER')?._count||0)}</div><div class="stat-label">sellers</div></div>
      <div class="stat-card"><div class="stat-value">${(s.users && s.users.find(u=>u.role==='RECEIVER')?._count||0)}</div><div class="stat-label">receivers</div></div>
      <div class="stat-card"><div class="stat-value">${(s.listings && s.listings.find(l=>l.status==='AVAILABLE')?._count||0)}</div><div class="stat-label">active listings</div></div>
      <div class="stat-card"><div class="stat-value">${s.reports||0}</div><div class="stat-label">reports</div></div>
    `;
  } catch (_) {}

  loadUsers();
  loadListings();
  loadReports();
});

async function loadUsers() {
  const el = document.getElementById('adminUsers');
  try {
    const d = await window.SIRKULA.api.get('/admin/users?limit=20');
    const users = d.data.users || [];
    el.innerHTML = `<table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Action</th></tr></thead><tbody>
      ${users.map((u) => `
        <tr>
          <td>${escapeHtml(u.name)}</td><td>${escapeHtml(u.email)}</td><td>${u.role}</td>
          <td>${window.SIRKULA.setBadge(u.status)}</td>
          <td><button class="btn btn-sm btn-outline" onclick="window.SIRKULA.toggleUser('${u.id}','${u.status}','${escapeHtml(u.name)}')">${u.status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}</button></td>
        </tr>
      `).join('')}
    </tbody></table>`;
  } catch (e) { el.innerHTML = '<div class="empty-state"><p>Unable to load users.</p></div>'; }
}

async function loadListings() {
  const el = document.getElementById('adminListings');
  try {
    const d = await window.SIRKULA.api.get('/admin/listings?limit=20');
    const items = d.data.listings || [];
    el.innerHTML = `<table><thead><tr><th>Title</th><th>Seller</th><th>Status</th><th>Action</th></tr></thead><tbody>
      ${items.map((l) => `
        <tr>
          <td>${escapeHtml(l.title)}</td><td>${escapeHtml(l.seller && l.seller.name)}</td>
          <td>${window.SIRKULA.setBadge(l.status)}</td>
          <td><select onchange="window.SIRKULA.moderateListing('${l.id}', this.value)">
            <option value="">Moderate</option><option value="AVAILABLE">Available</option><option value="UNAVAILABLE">Unavailable</option><option value="EXPIRED">Expired</option>
          </select></td>
        </tr>
      `).join('')}
    </tbody></table>`;
  } catch (e) { el.innerHTML = '<div class="empty-state"><p>Unable to load listings.</p></div>'; }
}

async function loadReports() {
  const el = document.getElementById('adminReports');
  try {
    const d = await window.SIRKULA.api.get('/admin/reports?limit=20');
    const items = d.data.reports || [];
    el.innerHTML = `<table><thead><tr><th>Listing</th><th>Reporter</th><th>Reason</th><th>Status</th><th>Action</th></tr></thead><tbody>
      ${items.map((r) => `
        <tr>
          <td>${escapeHtml(r.listing && r.listing.title)}</td><td>${escapeHtml(r.reporter && r.reporter.name)}</td>
          <td>${escapeHtml(r.reason)}</td><td>${window.SIRKULA.setBadge(r.status)}</td>
          <td><select onchange="window.SIRKULA.updateReport('${r.id}', this.value)">
            <option value="">Update</option><option value="REVIEWED">Reviewed</option><option value="RESOLVED">Resolved</option><option value="DISMISSED">Dismissed</option>
          </select></td>
        </tr>
      `).join('')}
    </tbody></table>`;
  } catch (e) { el.innerHTML = '<div class="empty-state"><p>Unable to load reports.</p></div>'; }
}

window.SIRKULA = window.SIRKULA || {};
window.SIRKULA.toggleUser = async (id, current, name) => {
  const next = current === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
  if (!confirm(`${next === 'SUSPENDED' ? 'Suspend' : 'Reactivate'} "${escapeHtml(name)}"?`)) return;
  try {
    await window.SIRKULA.api.patch('/admin/users/' + id + '/status', { status: next });
    window.SIRKULA.toast(`User ${next.toLowerCase()}`, 'success');
    loadUsers();
  } catch (e) { window.SIRKULA.toast(e.message || 'Failed', 'error'); }
};
window.SIRKULA.moderateListing = async (id, status) => {
  if (!status) return;
  try {
    await window.SIRKULA.api.patch('/admin/listings/' + id + '/moderate', { status });
    window.SIRKULA.toast('Listing updated', 'success');
    loadListings();
  } catch (e) { window.SIRKULA.toast(e.message || 'Failed', 'error'); }
};
window.SIRKULA.updateReport = async (id, status) => {
  if (!status) return;
  try {
    await window.SIRKULA.api.patch('/admin/reports/' + id, { status });
    window.SIRKULA.toast('Report updated', 'success');
    loadReports();
  } catch (e) { window.SIRKULA.toast(e.message || 'Failed', 'error'); }
};

function escapeHtml(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c]));
}
