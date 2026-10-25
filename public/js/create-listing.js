/* SIRKULA — Create listing (demo localStorage) */
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('listingForm');
  const btn = document.getElementById('createBtn');
  const msg = document.getElementById('formMsg');

  // Default pickup deadline to 3 days from now
  const deadlineInput = form.pickupDeadline;
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  deadlineInput.value = now.toISOString().slice(0, 16);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    msg.innerHTML = '';
    clearErrors(form);
    window.SIRKULA.showLoading(btn, true);

    const me = window.SIRKULA.currentUser();
    if (!me) {
      window.SIRKULA.showLoading(btn, false);
      msg.innerHTML = '<div style="color:var(--color-danger)">Please log in to create a listing.</div>';
      return;
    }

    try {
      const listing = window.SIRKULA.storage.createListing({
        title: form.title.value,
        description: form.description.value,
        category: form.category.value,
        quantity: form.quantity.value,
        availableQuantity: form.quantity.value,
        unit: form.unit.value,
        condition: form.condition.value,
        price: form.price.value || null,
        pickupLocation: form.pickupLocation.value,
        pickupLat: form.pickupLat.value || null,
        pickupLng: form.pickupLng.value || null,
        pickupDeadline: form.pickupDeadline.value,
        images: [],
        sellerId: me.id,
      });
      window.SIRKULA.showLoading(btn, false);
      if (listing) {
        window.SIRKULA.toast('Listing created', 'success');
        window.location.href = '/seller-inventory.html';
      } else {
        msg.innerHTML = '<div style="color:var(--color-danger)">Failed to create listing</div>';
        window.SIRKULA.toast('Failed to create listing', 'error');
      }
    } catch (err) {
      window.SIRKULA.showLoading(btn, false);
      msg.innerHTML = '<div style="color:var(--color-danger)">' + (err.message || 'Failed to create listing') + '</div>';
      window.SIRKULA.toast(err.message || 'Failed to create listing', 'error');
    }
  });
});

function clearErrors(form) {
  form.querySelectorAll('.error').forEach((f) => f.classList.remove('error'));
  form.querySelectorAll('.error-text').forEach((t) => t.remove());
}
function setErr(field, msg) {
  field.classList.add('error');
  let el = field.parentNode.querySelector('.error-text');
  if (!el) {
    el = document.createElement('div');
    el.className = 'error-text';
    field.parentNode.appendChild(el);
  }
  el.textContent = msg;
}
function escapeHtml(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>\"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c]));
}