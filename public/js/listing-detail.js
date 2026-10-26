/* SIRKULA — Listing detail + reservation request (demo localStorage) */
document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  if (!id) {
    document.getElementById('detailError').textContent = window.SIRKULA.t('Missing listing ID.');
    return;
  }

  try {
    const l = window.SIRKULA.storage.getListingById(id);
    if (!l) {
      document.getElementById('detailLoading').style.display = 'none';
      document.getElementById('detailError').textContent = window.SIRKULA.t('Listing not found.');
      return;
    }
    renderListing(l);
    setupReservation(l);
  } catch (e) {
    document.getElementById('detailLoading').style.display = 'none';
    document.getElementById('detailError').textContent = e.message || window.SIRKULA.t('Failed to load listing.');
  }
});

function renderListing(l) {
  document.getElementById('detailLoading').style.display = 'none';
  document.getElementById('detailContent').style.display = '';
  document.getElementById('detailTitle').textContent = l.title;
  document.getElementById('detailDesc').textContent = l.description || window.SIRKULA.t('No description provided.');
  document.getElementById('detailCategory').textContent = window.SIRKULA.t(l.category);
  document.getElementById('detailCondition').textContent = window.SIRKULA.t(l.condition);
  document.getElementById('detailStatus').textContent = window.SIRKULA.t(l.status);
  document.getElementById('detailStatus').className = 'badge badge-' + l.status.toLowerCase();
  document.getElementById('detailLocation').textContent = l.pickupLocation;
  document.getElementById('detailDeadline').textContent = window.SIRKULA.formatDate(l.pickupDeadline);
  document.getElementById('detailQty').textContent = l.availableQuantity != null ? l.availableQuantity : l.quantity;
  document.getElementById('detailUnit').textContent = l.unit;
  document.getElementById('detailPriceRow').style.display = '';
  document.getElementById('detailPrice').textContent = window.SIRKULA.formatCurrency(l.price);
  const seller = window.SIRKULA.storage.getUserById(l.sellerId);
  document.getElementById('detailSeller').textContent = seller ? seller.name : '—';
  const detailImg = document.getElementById('detailImg');
  const imgUrl = window.SIRKULA.listingImage(l);
  detailImg.src = imgUrl;
  detailImg.alt = l.title;
  detailImg.onerror = () => { detailImg.onerror = null; detailImg.src = window.SIRKULA.categoryImage(l.category); };
  const reservable = getReservableQuantity(l);
  document.getElementById('detailAvail').textContent = reservable > 0
    ? window.SIRKULA.t('Available for new requests: {qty} {unit}').replace('{qty}', reservable).replace('{unit}', l.unit)
    : window.SIRKULA.t('All remaining stock is currently held by pending requests.');
  const imagesEl = document.getElementById('detailImages');
  imagesEl.innerHTML = '';
  (l.images || []).slice(1).forEach((img) => {
    const t = document.createElement('img');
    const thumbUrl = window.SIRKULA.resolveImageUrl(img);
    t.src = thumbUrl;
    t.alt = l.title;
    t.style.width = '70px';
    t.style.height = '70px';
    t.style.objectFit = 'cover';
    t.style.borderRadius = 'var(--radius-sm)';
    t.style.border = '1px solid var(--color-border)';
    t.onerror = () => { t.onerror = null; t.src = window.SIRKULA.categoryImage(l.category); };
    t.onclick = () => { detailImg.src = thumbUrl; };
    imagesEl.appendChild(t);
  });

  const actions = document.getElementById('detailActions');
  const me = window.SIRKULA.currentUser();
  actions.innerHTML = '';
  if (l.status !== 'AVAILABLE') {
    actions.innerHTML = `<span class="badge badge-expired">${window.SIRKULA.t('Not available for reservation')}</span>`;
  } else if (!me) {
    actions.innerHTML = `<a href="/login.html" class="btn btn-outline btn-block">${window.SIRKULA.t('Log in to request')}</a>`;
  } else if (me.role === 'SELLER' && l.sellerId === me.id) {
    actions.innerHTML = `<a href="/create-listing.html?id=${encodeURIComponent(l.id)}" class="btn btn-outline btn-block">${window.SIRKULA.t('Edit your listing')}</a>`;
  }
}

function setupReservation(l) {
  const form = document.getElementById('reserveForm');
  const btn = document.getElementById('reserveBtn');
  const msg = document.getElementById('reserveMsg');
  const me = window.SIRKULA.currentUser();
  const qtyInput = form.quantity;

  const max = getReservableQuantity(l);
  qtyInput.max = String(max);
  qtyInput.placeholder = window.SIRKULA.t('Maximum ') + max;
  if (l.status !== 'AVAILABLE' || max <= 0) {
    form.hidden = true;
    msg.textContent = l.status !== 'AVAILABLE'
      ? 'This listing is no longer available for reservation.'
      : 'All available stock is currently held by pending requests.';
    return;
  }
  if (!me || me.role !== 'RECEIVER') {
    form.hidden = true;
    msg.textContent = !me ? 'Sign in as a Receiver to create a reservation.' : 'Select the Receiver role to request this item.';
    return;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    msg.textContent = '';
    const qty = Number(qtyInput.value);
    if (qty <= 0 || qty > max) {
      msg.textContent = window.SIRKULA.t('Enter a quantity between 1 and {max}.').replace('{max}', max);
      return;
    }
    if (!me) {
      msg.textContent = 'Sign in as a Receiver to create a reservation.';
      return;
    }
    window.SIRKULA.showLoading(btn, true);
    try {
      const created = window.SIRKULA.storage.createReservation({
        listingId: l.id,
        receiverId: me.id,
        quantity: qty,
        notes: form.elements.namedItem('notes').value,
      });
      if (!created) throw new Error(window.SIRKULA.t('Reservation could not be saved.'));
      // Create notification for seller
      window.SIRKULA.storage.createNotification({
        userId: l.sellerId,
        title: 'New Reservation Request',
        message: (me.name || me.email) + ' requested ' + qty + ' ' + l.unit + ' of "' + l.title + '".',
        type: 'RESERVATION_REQUEST',
        listingId: l.id,
      });
      window.SIRKULA.toast(window.SIRKULA.t('Reservation request sent'), 'success');
      setTimeout(() => { window.location.href = '/reservations.html'; }, 700);
    } catch (err) {
      window.SIRKULA.showLoading(btn, false);
      msg.textContent = err.message || window.SIRKULA.t('Request failed.');
      window.SIRKULA.toast(err.message || window.SIRKULA.t('Request failed'), 'error');
    }
  });
}
function getReservableQuantity(listing) {
  const stock = Math.max(0, Number(listing.availableQuantity != null ? listing.availableQuantity : listing.quantity) || 0);
  const pending = window.SIRKULA.storage.getReservations({ listingId: listing.id, status: 'PENDING' })
    .reduce((sum, reservation) => sum + (Number(reservation.quantity) || 0), 0);
  return Math.max(0, stock - pending);
}
