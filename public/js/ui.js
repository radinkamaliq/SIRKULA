/* SIRKULA — UI helpers: toast, modal, confirm, loading */
window.SIRKULA = window.SIRKULA || {};

function toast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span class="spin-text" style="animation:none">${message}</span>`;
  container.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 300);
  }, type === 'error' ? 5000 : 3000);
}
window.SIRKULA.toast = toast;

function openModal(overlayId, modalId) {
  const ov = document.getElementById(overlayId);
  const md = document.getElementById(modalId);
  if (ov) ov.classList.add('open');
  if (md) md.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal(overlayId) {
  const ov = document.getElementById(overlayId);
  if (ov) ov.classList.remove('open');
  document.body.style.overflow = '';
}
window.SIRKULA.openModal = openModal;
window.SIRKULA.closeModal = closeModal;

function confirmAction(message, onConfirm) {
  if (!confirm(message)) return;
  onConfirm();
}
window.SIRKULA.confirm = confirmAction;

function showLoading(el, show) {
  if (!el) return;
  if (show) {
    el.dataset.html = el.innerHTML;
    el.innerHTML = `<span class="spinner"></span> Loading...`;
    el.disabled = true;
  } else {
    el.innerHTML = el.dataset.html || '';
    el.disabled = false;
  }
}
window.SIRKULA.showLoading = showLoading;

function renderList(container, items, renderer, emptyMessage = 'No data available.') {
  container.innerHTML = '';
  if (!items || items.length === 0) {
    container.innerHTML = `<div class="empty-state"><div style="font-size:2rem;margin-bottom:0.75rem">🍃</div><h3>Nothing here</h3><p>${emptyMessage}</p></div>`;
    return;
  }
  items.forEach((item) => container.appendChild(renderer(item)));
}
window.SIRKULA.renderList = renderList;

function setBadge(status) {
  const map = {
    AVAILABLE: 'badge-available', RESERVED: 'badge-reserved', UNAVAILABLE: 'badge-unavailable', EXPIRED: 'badge-expired',
    PENDING: 'badge-pending', APPROVED: 'badge-approved', REJECTED: 'badge-rejected', CANCELLED: 'badge-cancelled', COMPLETED: 'badge-completed',
  };
  return `<span class="badge ${map[status] || ''}">${(status || '').toLowerCase()}</span>`;
}
window.SIRKULA.setBadge = setBadge;
