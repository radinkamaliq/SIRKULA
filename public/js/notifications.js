/* SIRKULA — Notifications (demo localStorage) */
document.addEventListener('DOMContentLoaded', () => {
  const listEl = document.getElementById('notifList');
  const countEl = document.getElementById('notifCount');
  const markAllBtn = document.getElementById('markAllRead');
  const me = window.SIRKULA.currentUser();
  if (!me) return;

  function load() {
    const data = window.SIRKULA.storage.getNotifications({ userId: me.id });
    const unread = data.filter((n) => !n.read).length;
    countEl.textContent = unread + ' unread';
    render(data);
  }

  function render(items) {
    listEl.innerHTML = '';
    if (!items.length) {
      listEl.innerHTML = '<div class="empty-state"><p>No notifications yet.</p></div>';
      return;
    }
    items.forEach((n) => {
      const el = document.createElement('div');
      el.className = 'card ' + (n.read ? '' : 'unread');
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

  function markRead(id) {
    window.SIRKULA.storage.markNotificationRead(id);
    load();
    updateNavCount();
  }

  function markAll() {
    const count = window.SIRKULA.storage.markAllNotificationsRead(me.id);
    load();
    updateNavCount();
    window.SIRKULA.toast(count + ' marked as read', 'info');
  }

  function updateNavCount() {
    const notifs = window.SIRKULA.storage.getNotifications({ userId: me.id, unreadOnly: true });
    const c = notifs.length;
    const els = document.querySelectorAll('#nav-notif-count');
    els.forEach((el) => el.textContent = c);
  }

  markAllBtn.addEventListener('click', markAll);
  load();
});

function escapeHtml(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>\"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c]));
}