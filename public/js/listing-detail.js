/* SIRKULA — Listing detail + reservation request */
document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  if (!id) { document.getElementById('detailError').textContent = 'Missing listing ID.'; return; }

  try {
    const data = await window.SIRKULA.api.get('/listings/' + id);
    const l = data.data;
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
  document.getElementById('detailSeller').textContent = l.seller ? l.seller.name : '—';
  document.getElementById('detailImg').src = (l.images && l.images[0]) ? '/uploads/' + l.images[0] : '';
  document.getElementById('detailImg').alt = l.title;
  document.getElementById('detailAvail').textContent = 'Available: ' + (l.availableQuantity != null ? l.availableQuantity : l.quantity) + ' ' + l.unit;
  const imagesEl = document.getElementById('detailImages');
  imagesEl.innerHTML = '';
  (l.images || []).slice(1).forEach((img) => {
    const t = document.createElement('img');
    t.src = '/uploads/' + img; t.alt = l.title; t.style.width='70px'; t.style.height='70px'; t.style.objectFit='cover'; t.style.borderRadius='var(--radius-sm)'; t.style.border='1px solid var(--color-border)';
    t.onclick = () => { document.getElementById('detailImg').src = '/uploads/' + img; };
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
  qtyInput.placeholder = `Max ${max}`;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.textContent = '';
    const qty = Number(qtyInput.value);
    if (qty <= 0 || qty > max) { msg.textContent = 'Invalid quantity.'; return; }
    window.SIRKULA.showLoading(btn, true);
    try {
      await window.SIRKULA.api.post('/reservations', { listingId: l.id, quantity: qty, notes: form.notes.value });
      window.SIRKULA.toast('Reservation request sent', 'success');
      setTimeout(() => { window.location.href = '/reservations.html'; }, 700);
    } catch (err) {
      window.SIRKULA.showLoading(btn, false);
      msg.textContent = err.message || 'Request failed.';
      window.SIRKULA.toast(err.message || 'Request failed', 'error');
    }
  });
}
