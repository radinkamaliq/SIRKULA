/* SIRKULA — Notifications */
document.addEventListener('DOMContentLoaded', async () => {
  const listEl = document.getElementById('notifList');
  const countEl = document.getElementById('notifCount');
  const markAllBtn = document.getElementById('markAllRead');

  async function load() {
    try {
      const d = await window.SIRKULA.api.get('/notifications');
      const data = d.data || {};
      countEl.textContent = `${data.unreadCount || 0} unread`;
      render(data.items || []);
    } catch (e) {
      listEl.innerHTML = '<div class="empty-state"><p>Unable to load notifications.</p></div>';
    }
  }

  function render(items) {
    listEl.innerHTML = '';
    if (!items.length) {
      listEl.innerHTML = '<div class="empty-state"><p>No notifications yet.</p></div>';
      return;
    }
    items.forEach((n) => {
      const el = document.createElement('div');
      el.className = `card ${n.read ? '' : 'unread'}`;
      el.style.borderLeft = n.read ? '' : '3px solid var(--color-fresh)';
      el.innerHTML = `
        <div class="card-body" style="padding:0.9rem 1rem;cursor:pointer">
          <div style="display:flex;justify-content:space-between;align-items:start">
            <div>
              <div style="font-weight:600">${escapeHtml(n.title)}</div>
              <div style="font-size:0.85rem;color:var(--color-muted)">${escapeHtml(n.message)}</div>
              <div style="font-size:0.78rem;color:var(--color-muted);margin-top:0.35rem">${window.SIRKULA.formatDateTime(n.createdAt)}</div>
            </div>
            <span class="badge badge-${n.type.toLowerCase().replace(/_/g,'-')}">${n.type}</span>
          </div>
        </div>
      `;
      el.onclick = () => markRead(n.id);
      listEl.appendChild(el);
    });
  }

  async function markRead(id) {
    try {
      await window.SIRKULA.api.patch('/notifications/' + id + '/read');
      load();
      updateNavCount();
    } catch (e) {}
  }

  async function markAll() {
    try {
      await window.SIRKULA.api.patch('/notifications/read-all');
      load();
      updateNavCount();
      window.SIRKULA.toast('All marked as read', 'info');
    } catch (e) { window.SIRKULA.toast(e.message || 'Failed', 'error'); }
  }

  async function updateNavCount() {
    try {
      const d = await window.SIRKULA.api.get('/notifications?limit=1&unreadOnly=true');
      const c = d.data.unreadCount || 0;
      const els = document.querySelectorAll('#nav-notif-count');
      els.forEach((el) => el.textContent = c);
    } catch (_) {}
  }

  markAllBtn.addEventListener('click', markAll);
  load();
});

function escapeHtml(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c]));
}
