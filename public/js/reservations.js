/* SIRKULA — reservation workflows backed by browser localStorage. */
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('resListings');
  const statusSelect = document.getElementById('resStatus');
  const subtitle = document.getElementById('resSubtitle');
  const me = window.SIRKULA.currentUser();
  if (!container || !statusSelect || !me) return;

  if (subtitle) {
    subtitle.textContent = me.role === 'SELLER'
      ? 'Review, approve, or reject requests for your listings.'
      : me.role === 'RECEIVER'
        ? 'View reservation status and pickup instructions.'
        : 'Monitor reservation activity across the platform.';
  }

  function getRelevantReservations() {
    const filter = {};
    if (statusSelect.value) filter.status = statusSelect.value;
    if (me.role === 'SELLER') filter.sellerId = me.id;
    if (me.role === 'RECEIVER') filter.receiverId = me.id;
    return window.SIRKULA.storage.getReservations(filter);
  }

  function load() {
    render(getRelevantReservations());
  }

  function render(reservations) {
    container.replaceChildren();
    if (!reservations.length) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      const title = document.createElement('h3'); title.textContent = window.SIRKULA.t('No reservations yet');
      const detail = document.createElement('p');
      detail.textContent = me.role === 'SELLER'
        ? 'New requests from receivers will appear here.'
        : 'Browse the marketplace to find surplus food.';
      empty.append(title, detail);
      if (me.role === 'RECEIVER') {
        const link = document.createElement('a'); link.href = '/marketplace.html'; link.className = 'btn btn-primary'; link.textContent = window.SIRKULA.t('Open Marketplace'); empty.appendChild(link);
      }
      container.appendChild(empty);
      return;
    }

    reservations.forEach((reservation) => {
      const listing = window.SIRKULA.storage.getListingById(reservation.listingId);
      const card = document.createElement('article');
      card.className = 'card reservation-card';
      const body = document.createElement('div'); body.className = 'card-body reservation-card__body';
      const header = document.createElement('div'); header.className = 'reservation-card__header';
      const title = document.createElement('h3'); title.className = 'reservation-card__title'; title.textContent = listing ? listing.title : window.SIRKULA.t('Listing not found');
      const status = document.createElement('span'); status.innerHTML = window.SIRKULA.setBadge(reservation.status);
      header.append(title, status);
      const meta = document.createElement('p'); meta.className = 'reservation-card__meta';
      meta.textContent = `${reservation.quantity} ${listing ? listing.unit : ''} · ${listing ? listing.pickupLocation : window.SIRKULA.t('Location unavailable')} · ${window.SIRKULA.formatDateTime(reservation.createdAt)}`;
      body.append(header, meta);
      if (reservation.pickupInstructions) {
        const note = document.createElement('p'); note.className = 'reservation-card__instructions';
        const label = document.createElement('strong'); label.textContent = window.SIRKULA.t('Pickup instructions: ');
        note.append(label, document.createTextNode(reservation.pickupInstructions)); body.appendChild(note);
      }
      const actions = document.createElement('div'); actions.className = 'reservation-card__actions';
      addActions(actions, reservation, listing);
      body.appendChild(actions);
      card.appendChild(body); container.appendChild(card);
    });
  }

  function makeAction(label, klass, handler) {
    const button = document.createElement('button');
    button.type = 'button'; button.className = `btn btn-sm ${klass}`; button.textContent = label;
    button.addEventListener('click', handler);
    return button;
  }

  function addActions(actions, reservation, listing) {
    if (me.role === 'SELLER' && reservation.status === 'PENDING') {
      actions.append(
        makeAction('Setujui', 'btn-success', () => approveReservation(reservation.id)),
        makeAction('Tolak', 'btn-danger', () => rejectReservation(reservation.id)),
      );
    } else if (me.role === 'SELLER' && reservation.status === 'APPROVED') {
      actions.appendChild(makeAction('Tandai Selesai', 'btn-primary', () => completeReservation(reservation.id)));
    } else if (me.role === 'RECEIVER' && reservation.status === 'PENDING') {
      actions.appendChild(makeAction('Batalkan Permintaan', 'btn-danger', () => cancelReservation(reservation.id)));
    }
    if (!actions.children.length && listing) {
      const link = document.createElement('a'); link.href = `/listing-detail.html?id=${encodeURIComponent(listing.id)}`; link.className = 'btn btn-outline btn-sm'; link.textContent = 'Lihat Listing'; actions.appendChild(link);
    }
  }

  function notify(userId, title, message, reservation) {
    window.SIRKULA.storage.createNotification({
      userId, title, message, type: 'RESERVATION_UPDATE',
      listingId: reservation.listingId, reservationId: reservation.id,
    });
  }

  function approveReservation(id) {
    const reservation = window.SIRKULA.storage.getReservationById(id);
    if (!reservation || reservation.status !== 'PENDING') return window.SIRKULA.toast('Reservasi ini tidak lagi menunggu persetujuan.', 'error');
    const listing = window.SIRKULA.storage.getListingById(reservation.listingId);
    if (!listing || listing.status !== 'AVAILABLE') return window.SIRKULA.toast('Listing sudah tidak tersedia.', 'error');
    const available = Number(listing.availableQuantity != null ? listing.availableQuantity : listing.quantity) || 0;
    if (reservation.quantity > available) return window.SIRKULA.toast(`Stok tersisa ${available} ${listing.unit}. Jumlah ini tidak dapat disetujui.`, 'error');
    const instructions = window.prompt('Petunjuk pengambilan (opsional):', '') || '';
    const remaining = available - reservation.quantity;
    const stockUpdated = window.SIRKULA.storage.updateListing(listing.id, {
      availableQuantity: remaining,
      status: remaining > 0 ? 'AVAILABLE' : 'UNAVAILABLE',
    });
    const updated = stockUpdated && window.SIRKULA.storage.updateReservation(id, {
      status: 'APPROVED', pickupInstructions: instructions.trim() || null,
    });
    if (!updated) return window.SIRKULA.toast(window.SIRKULA.t('Reservation could not be updated.'), 'error');
    notify(reservation.receiverId, window.SIRKULA.t('Reservation approved'), `${window.SIRKULA.t('Request for')} “${listing.title}” ${window.SIRKULA.t('has been approved.')}`, reservation);
    window.SIRKULA.storage.addAuditLog({ action: 'RESERVATION_APPROVED', targetType: 'reservation', targetId: id, details: `Approved ${reservation.quantity} ${listing.unit}`, adminId: me.id });
    window.SIRKULA.toast(window.SIRKULA.t('Reservation approved; stock updated.'), 'success');
    load();
  }

  function rejectReservation(id) {
    const reservation = window.SIRKULA.storage.getReservationById(id);
    if (!reservation || reservation.status !== 'PENDING') return window.SIRKULA.toast(window.SIRKULA.t('Only pending reservations can be rejected.'), 'error');
    if (!window.confirm(window.SIRKULA.t('Reject this reservation request?'))) return;
    const listing = window.SIRKULA.storage.getListingById(reservation.listingId);
    const updated = window.SIRKULA.storage.updateReservation(id, { status: 'REJECTED' });
    if (!updated) return window.SIRKULA.toast(window.SIRKULA.t('Reservation could not be updated.'), 'error');
    notify(reservation.receiverId, window.SIRKULA.t('Reservation rejected'), `${window.SIRKULA.t('Request for')} “${listing ? listing.title : window.SIRKULA.t('listing')}” ${window.SIRKULA.t('was rejected.')}`, reservation);
    window.SIRKULA.storage.addAuditLog({ action: 'RESERVATION_REJECTED', targetType: 'reservation', targetId: id, adminId: me.id });
    window.SIRKULA.toast(window.SIRKULA.t('Request rejected.'), 'info'); load();
  }

  function cancelReservation(id) {
    const reservation = window.SIRKULA.storage.getReservationById(id);
    if (!reservation || reservation.status !== 'PENDING') return window.SIRKULA.toast(window.SIRKULA.t('Only pending reservations can be cancelled.'), 'error');
    if (!window.confirm(window.SIRKULA.t('Cancel this reservation request?'))) return;
    const listing = window.SIRKULA.storage.getListingById(reservation.listingId);
    const updated = window.SIRKULA.storage.updateReservation(id, { status: 'CANCELLED' });
    if (!updated) return window.SIRKULA.toast(window.SIRKULA.t('Reservation could not be updated.'), 'error');
    if (listing) notify(listing.sellerId, window.SIRKULA.t('Request cancelled'), `${window.SIRKULA.t('Request for')} “${listing.title}” ${window.SIRKULA.t('has been cancelled.')}`, reservation);
    window.SIRKULA.toast(window.SIRKULA.t('Request cancelled.'), 'info'); load();
  }

  function completeReservation(id) {
    const reservation = window.SIRKULA.storage.getReservationById(id);
    if (!reservation || reservation.status !== 'APPROVED') return window.SIRKULA.toast(window.SIRKULA.t('Only approved reservations can be completed.'), 'error');
    if (!window.confirm(window.SIRKULA.t('Mark this pickup as completed?'))) return;
    const listing = window.SIRKULA.storage.getListingById(reservation.listingId);
    const updated = window.SIRKULA.storage.updateReservation(id, { status: 'COMPLETED' });
    if (!updated) return window.SIRKULA.toast(window.SIRKULA.t('Reservation could not be updated.'), 'error');
    notify(reservation.receiverId, window.SIRKULA.t('Pickup completed'), `${window.SIRKULA.t('Pickup for')} “${listing ? listing.title : window.SIRKULA.t('listing')}” ${window.SIRKULA.t('marked as completed.')}`, reservation);
    window.SIRKULA.storage.addAuditLog({ action: 'RESERVATION_COMPLETED', targetType: 'reservation', targetId: id, adminId: me.id });
    window.SIRKULA.toast(window.SIRKULA.t('Pickup marked as completed.'), 'success'); load();
  }

  statusSelect.addEventListener('change', load);
  load();
});
