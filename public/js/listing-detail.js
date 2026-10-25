/* SIRKULA — Listing detail + reservation request (demo localStorage) */
document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  if (!id) {
    document.getElementById('detailError').textContent = 'Missing listing ID.';
    return;
  }

  try {
    const l = window.SIRKULA.storage.getListingById(id);
    if (!l) {
      document.getElementById('detailLoading').style.display = 'none';
      document.getElementById('detailError').textContent = 'Listing not found.';
      return;
    }
    renderListing(l);
    setupReservation(l);
  } catch (e) {
    document.getElementById('detailLoading').style.display = 'none';
    document.getElementById('detailError').textContent = e.message || 'Failed to load listing.';
  }
});

function renderListing(l) {
  document.getElementById('detailLoading').style.display = 'none';
  document.getElementById('detailContent').style.display = '';
  document.getElementById('detailTitle').textContent = l.title;
  document.getElementById('detailDesc').textContent = l.description || 'No description provided.';
  document.getElementById('detailCategory').textContent = l.category;
  document.getElementById('detailCondition').textContent = l.condition;
  document.getElementById('detailStatus').textContent = l.status;
  document.getElementById('detailStatus').className = 'badge badge-' + l.status.toLowerCase();
  document.getElementById('detailLocation').textContent = l.pickupLocation;
  document.getElementById('detailDeadline').textContent = window.SIRKULA.formatDate(l.pickupDeadline);
  document.getElementById('detailQty').textContent = l.quantity;
  document.getElementById('detailUnit').textContent = l.unit;
  document.getElementById('detailPriceRow').style.display = l.price ? '' : 'none';
  document.getElementById('detailPrice').textContent = window.SIRKULA.formatCurrency(l.price);
  const seller = window.SIRKULA.storage.getUserById(l.sellerId);
  document.getElementById('detailSeller').textContent = seller ? seller.name : '—';
  const detailImg = document.getElementById('detailImg');
  const imgUrl = window.SIRKULA.listingImage(l);
  detailImg.src = imgUrl;
  detailImg.alt = l.title;
  detailImg.onerror = () => { detailImg.onerror = null; detailImg.src = '/images/food/snacks.jpg'; };
  document.getElementById('detailAvail').textContent = 'Available: ' + (l.availableQuantity != null ? l.availableQuantity : l.quantity) + ' ' + l.unit;
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
    t.onerror = () => { t.onerror = null; t.src = '/images/food/snacks.jpg'; };
    t.onclick = () => { detailImg.src = thumbUrl; };
    imagesEl.appendChild(t);
  });

  const actions = document.getElementById('detailActions');
  const me = window.SIRKULA.currentUser();
  actions.innerHTML = '';
  if (l.status !== 'AVAILABLE') {
    actions.innerHTML = `<span class="badge badge-expired">Not available for reservation</span>`;
  } else if (!me) {
    actions.innerHTML = `<a href="/login.html" class="btn btn-outline btn-block">Log in to request</a>`;
  } else if (me.role === 'SELLER' && l.sellerId === me.id) {
    actions.innerHTML = `<a href="/listing-detail.html?id=${l.id}" class="btn btn-outline btn-block">Your listing</a>`;
  }
}

function setupReservation(l) {
  const form = document.getElementById('reserveForm');
  const btn = document.getElementById('reserveBtn');
  const msg = document.getElementById('reserveMsg');
  const me = window.SIRKULA.currentUser();
  const qtyInput = form.quantity;

  const max = Number(l.availableQuantity || l.quantity || 0);
  qtyInput.max = max;
  qtyInput.placeholder = 'Max ' + max;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    msg.textContent = '';
    const qty = Number(qtyInput.value);
    if (qty <= 0 || qty > max) {
      msg.textContent = 'Invalid quantity.';
      return;
    }
    if (!me) {
      msg.textContent = 'Please log in to make a reservation.';
      return;
    }
    window.SIRKULA.showLoading(btn, true);
    try {
      window.SIRKULA.storage.createReservation({
        listingId: l.id,
        receiverId: me.id,
        quantity: qty,
        notes: form.notes.value,
      });
      // Create notification for seller
      window.SIRKULA.storage.createNotification({
        userId: l.sellerId,
        title: 'Permintaan Reservasi Baru',
        message: (me.name || me.email) + ' meminta ' + qty + ' ' + l.unit + ' "' + l.title + '".',
        type: 'RESERVATION_REQUEST',
        listingId: l.id,
      });
      window.SIRKULA.toast('Reservation request sent', 'success');
      setTimeout(() => { window.location.href = '/reservations.html'; }, 700);
    } catch (err) {
      window.SIRKULA.showLoading(btn, false);
      msg.textContent = err.message || 'Request failed.';
      window.SIRKULA.toast(err.message || 'Request failed', 'error');
    }
  });
}