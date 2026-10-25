/* SIRKULA — Reservations (demo localStorage) */
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('resListings');
  const statusSel = document.getElementById('resStatus');
  const subtitle = document.getElementById('resSubtitle');
  const me = window.SIRKULA.currentUser();
  if (!me) return;

  subtitle.textContent = me.role === 'SELLER'
    ? 'Approve or reject requests for your listings.'
    : 'Your reservation history and pickup instructions.';

  let reservations = [];

  function load() {
    let filter = {};
    if (statusSel.value) filter.status = statusSel.value;
    if (me.role === 'SELLER') filter.sellerId = me.id;
    if (me.role === 'RECEIVER') filter.receiverId = me.id;
    reservations = window.SIRKULA.storage.getReservations(filter);
    render();
  }

  function render() {
    container.innerHTML = '';
    if (!reservations.length) {
      container.innerHTML = '<div class="empty-state"><p>No reservations found.</p></div>';
      return;
    }
    reservations.forEach((r) => {
      const listing = window.SIRKULA.storage.getListingById(r.listingId);
      const card = document.createElement('div');
      card.className = 'card';
      const isSeller = me.role === 'SELLER';
      const isReceiver = me.role === 'RECEIVER';
      card.innerHTML = `
        <div class="card-body" style="padding:1rem">
          <div style="display:flex;justify-content:space-between;align-items:start;gap:0.5rem;margin-bottom:0.3rem">
            <h4 style="margin:0;font-size:1.05rem">${escapeHtml(listing ? listing.title : 'Item')}</h4>
            ${window.SIRKULA.setBadge(r.status)}
          </div>
          <p style="font-size:0.85rem;color:var(--color-muted);margin-bottom:0.5rem">${r.quantity} ${listing ? listing.unit : ''} &bull; ${listing ? listing.pickupLocation : ''} &bull; ${window.SIRKULA.formatDateTime(r.createdAt)}</p>
          ${r.pickupInstructions ? '<p style="font-size:0.85rem;color:var(--color-charcoal)"><strong>Pickup:</strong> ' + escapeHtml(r.pickupInstructions) + '</p>' : ''}
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
        return '<button class="btn btn-sm btn-success" onclick="window.SIRKULA.approveReservation(\'' + r.id + '\')">Approve</button><button class="btn btn-sm btn-danger" onclick="window.SIRKULA.rejectReservation(\'' + r.id + '\')">Reject</button>';
      }
      if (r.status === 'APPROVED') {
        return '<button class="btn btn-sm btn-primary" onclick="window.SIRKULA.completeReservation(\'' + r.id + '\')">Mark Complete</button>';
      }
      return '<span class="badge">' + r.status + '</span>';
    }
    if (isReceiver) {
      if (r.status === 'PENDING') {
        return '<button class="btn btn-sm btn-danger" onclick="window.SIRKULA.cancelReservation(\'' + r.id + '\')">Cancel</button>';
      }
      return '<span class="badge">' + r.status + '</span>';
  }
    }
window.SIRKULA = window.SIRKULA || {};
window.SIRKULA.approveReservation = function (id) {
  const pinstr = prompt('Pickup instructions (optional):');
  try {
    const updated = window.SIRKULA.storage.updateReservation(id, { status: 'APPROVED', pickupInstructions: pinstr || undefined });
    if (updated) {
      const res = window.SIRKULA.storage.getReservationById(id);
      const listing = window.SIRKULA.storage.getListingById(res.listingId);
      window.SIRKULA.storage.createNotification({
        userId: res.receiverId,
        title: 'Reservasi Disetujui',
        message: 'Permintaan Anda untuk "' + (listing ? listing.title : 'Item') + '" telah disetujui.',
        type: 'RESERVATION_APPROVED',
        listingId: res.listingId,
        reservationId: id,
      });
      window.SIRKULA.toast('Approved', 'success');
      location.reload();
    } else {
      window.SIRKULA.toast('Approve failed', 'error');
    }
  } catch (e) { window.SIRKULA.toast(e.message || 'Approve failed', 'error'); }
};
window.SIRKULA.rejectReservation = function (id) {
  if (!confirm('Reject this reservation?')) return;
  try {
    const updated = window.SIRKULA.storage.updateReservation(id, { status: 'REJECTED' });
    if (updated) {
      const res = window.SIRKULA.storage.getReservationById(id);
      const listing = window.SIRKULA.storage.getListingById(res.listingId);
      window.SIRKULA.storage.createNotification({
        userId: res.receiverId,
        title: 'Reservasi Ditolak',
        message: 'Permintaan Anda untuk "' + (listing ? listing.title : 'Item') + '" telah ditolak.',
        type: 'RESERVATION_REJECTED',
        listingId: res.listingId,
        reservationId: id,
      });
      window.SIRKULA.toast('Rejected', 'info');
      location.reload();
    } else {
      window.SIRKULA.toast('Reject failed', 'error');
    }
  } catch (e) { window.SIRKULA.toast(e.message || 'Reject failed', 'error'); }
};
window.SIRKULA.cancelReservation = function (id) {
  if (!confirm('Cancel this reservation?')) return;
  try {
    const ok = window.SIRKULA.storage.deleteReservation(id);
    if (ok) {
      window.SIRKULA.toast('Cancelled', 'info');
      location.reload();
    } else {
      window.SIRKULA.toast('Cancel failed', 'error');
    }
  } catch (e) { window.SIRKULA.toast(e.message || 'Cancel failed', 'error'); }
};
window.SIRKULA.completeReservation = function (id) {
  if (!confirm('Mark this pickup as completed?')) return;
  try {
    const updated = window.SIRKULA.storage.updateReservation(id, { status: 'COMPLETED' });
    if (updated) {
      const res = window.SIRKULA.storage.getReservationById(id);
      const listing = window.SIRKULA.storage.getListingById(res.listingId);
      window.SIRKULA.storage.createNotification({
        userId: res.receiverId,
        title: 'Pickup Completed',
        message: 'Your pickup of "' + (listing ? listing.title : 'Item') + '" is marked complete.',
        type: 'RESERVATION_COMPLETED',
        listingId: res.listingId,
        reservationId: id,
      });
      window.SIRKULA.toast('Completed', 'success');
      location.reload();
    } else {
      window.SIRKULA.toast('Complete failed', 'error');
    }
  } catch (e) { window.SIRKULA.toast(e.message || 'Complete failed', 'error'); }
};

function escapeHtml(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>\"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c]));
}
  statusSel.addEventListener('change', load);
  load();
});
