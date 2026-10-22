/* SIRKULA — Reservations */
document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('resListings');
  const statusSel = document.getElementById('resStatus');
  const subtitle = document.getElementById('resSubtitle');
  const me = window.SIRKULA.currentUser();
  if (!me) return;

  subtitle.textContent = me.role === 'SELLER'
    ? 'Approve or reject requests for your listings.'
    : 'Your reservation history and pickup instructions.';

  let reservations = [];

  async function load() {
    let path = '/reservations';
    if (statusSel.value) path += '?status=' + statusSel.value;
    try {
      const d = await window.SIRKULA.api.get(path);
      reservations = d.data.reservations || [];
      render();
    } catch (e) {
      container.innerHTML = '<div class="empty-state"><p>Unable to load reservations.</p></div>';
    }
  }

  function render() {
    container.innerHTML = '';
    if (!reservations.length) {
      container.innerHTML = '<div class="empty-state"><p>No reservations found.</p></div>';
      return;
    }
    reservations.forEach((r) => {
      const card = document.createElement('div');
      card.className = 'card';
      const isSeller = me.role === 'SELLER';
      const isReceiver = me.role === 'RECEIVER';
      card.innerHTML = `
        <div class="card-body" style="padding:1rem">
          <div style="display:flex;justify-content:space-between;align-items:start;gap:0.5rem;margin-bottom:0.3rem">
            <h4 style="margin:0;font-size:1.05rem">${escapeHtml(r.listing.title)}</h4>
            ${window.SIRKULA.setBadge(r.status)}
          </div>
          <p style="font-size:0.85rem;color:var(--color-muted);margin-bottom:0.5rem">${r.quantity} ${r.listing.unit} &bull; ${r.listing.pickupLocation} &bull; ${window.SIRKULA.formatDateTime(r.createdAt)}</p>
          ${r.pickupInstructions ? `<p style="font-size:0.85rem;color:var(--color-charcoal)"><strong>Pickup:</strong> ${escapeHtml(r.pickupInstructions)}</p>` : ''}
          <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
            ${actionButtons(r, isSeller, isReceiver)}
          </div>
        </div>
      `;
      container.appendChild(card);
    });
  }

  function actionButtons(r, isSeller, isReceiver) {
    if (isSeller) {
      if (r.status === 'PENDING') {
        return `
          <button class="btn btn-sm btn-success" onclick="window.SIRKULA.approveReservation('${r.id}')">Approve</button>
          <button class="btn btn-sm btn-danger" onclick="window.SIRKULA.rejectReservation('${r.id}')">Reject</button>
        `;
      }
      if (r.status === 'APPROVED') {
        return `<button class="btn btn-sm btn-primary" onclick="window.SIRKULA.completeReservation('${r.id}')">Mark Complete</button>`;
      }
      return `<span class="badge">${r.status}</span>`;
    }
    if (isReceiver) {
      if (r.status === 'PENDING') {
        return `<button class="btn btn-sm btn-danger" onclick="window.SIRKULA.cancelReservation('${r.id}')">Cancel</button>`;
      }
      return `<span class="badge">${r.status}</span>`;
    }
    return `<span class="badge">${r.status}</span>`;
  }

  statusSel.addEventListener('change', load);
  load();
});

window.SIRKULA = window.SIRKULA || {};
window.SIRKULA.approveReservation = async (id) => {
  const pinstr = prompt('Pickup instructions (optional):');
  try {
    await window.SIRKULA.api.patch('/reservations/' + id, { status: 'APPROVED', pickupInstructions: pinstr || undefined });
    window.SIRKULA.toast('Approved', 'success');
    location.reload();
  } catch (e) { window.SIRKULA.toast(e.message || 'Approve failed', 'error'); }
};
window.SIRKULA.rejectReservation = async (id) => {
  if (!confirm('Reject this reservation?')) return;
  try {
    await window.SIRKULA.api.patch('/reservations/' + id, { status: 'REJECTED' });
    window.SIRKULA.toast('Rejected', 'info');
    location.reload();
  } catch (e) { window.SIRKULA.toast(e.message || 'Reject failed', 'error'); }
};
window.SIRKULA.cancelReservation = async (id) => {
  if (!confirm('Cancel this reservation?')) return;
  try {
    await window.SIRKULA.api.del('/reservations/' + id);
    window.SIRKULA.toast('Cancelled', 'info');
    location.reload();
  } catch (e) { window.SIRKULA.toast(e.message || 'Cancel failed', 'error'); }
};
window.SIRKULA.completeReservation = async (id) => {
  if (!confirm('Mark this pickup as completed?')) return;
  try {
    await window.SIRKULA.api.post('/reservations/' + id + '/complete');
    window.SIRKULA.toast('Completed', 'success');
    location.reload();
  } catch (e) { window.SIRKULA.toast(e.message || 'Complete failed', 'error'); }
};

function escapeHtml(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c]));
}
