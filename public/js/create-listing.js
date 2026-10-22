/* SIRKULA — Create listing */
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('listingForm');
  const btn = document.getElementById('createBtn');
  const msg = document.getElementById('formMsg');

  // Default pickup deadline to 3 days from now
  const deadlineInput = form.pickupDeadline;
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  deadlineInput.value = now.toISOString().slice(0, 16);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.innerHTML = '';
    clearErrors(form);
    window.SIRKULA.showLoading(btn, true);

    const fd = new FormData();
    fd.append('title', form.title.value);
    fd.append('description', form.description.value);
    fd.append('category', form.category.value);
    fd.append('quantity', form.quantity.value);
    fd.append('unit', form.unit.value);
    fd.append('condition', form.condition.value);
    if (form.price.value) fd.append('price', form.price.value);
    fd.append('pickupLocation', form.pickupLocation.value);
    if (form.pickupLat.value) fd.append('pickupLat', form.pickupLat.value);
    if (form.pickupLng.value) fd.append('pickupLng', form.pickupLng.value);
    fd.append('pickupDeadline', form.pickupDeadline.value);
    if (form.image.files[0]) fd.append('image', form.image.files[0]);

    try {
      const res = await fetch('/api/v1/listings', {
        method: 'POST',
        body: fd,
        headers: {
          'X-XSRF-TOKEN': getCsrfToken(),
        },
      });
      let data;
      const ct = res.headers.get('content-type') || '';
      data = ct.includes('application/json') ? await res.json() : { success: res.ok, error: await res.text() };
      if (!res.ok) throw Object.assign(new Error(data.error || 'Failed'), { errors: data.errors, code: data.code });
      window.SIRKULA.toast('Listing created', 'success');
      window.location.href = '/seller-inventory.html';
    } catch (err) {
      window.SIRKULA.showLoading(btn, false);
      showFieldErrors(form, err);
      msg.innerHTML = `<div style="color:var(--color-danger)">${escapeHtml(err.message || 'Failed to create listing')}</div>`;
      window.SIRKULA.toast(err.message || 'Failed to create listing', 'error');
    }
  });
});

function getCsrfToken() {
  const m = document.cookie.match(/(?:^|; )XSRF_TOKEN=([^;]*)/);
  return m ? decodeURIComponent(m[1]) : '';
}

function clearErrors(form) {
  form.querySelectorAll('.error').forEach((f) => f.classList.remove('error'));
  form.querySelectorAll('.error-text').forEach((t) => t.remove());
}
function showFieldErrors(form, err) {
  clearErrors(form);
  if (err.errors && Array.isArray(err.errors)) {
    err.errors.forEach((e) => {
      const field = form.elements[e.path?.[0] || e.param || ''];
      if (field) setErr(field, e.msg);
    });
  } else if (err.code === 'DUPLICATE_EMAIL') {
    setErr(form.email, 'Email already registered');
  }
}
function setErr(field, msg) {
  field.classList.add('error');
  let el = field.parentNode.querySelector('.error-text');
  if (!el) { el = document.createElement('div'); el.className = 'error-text'; field.parentNode.appendChild(el); }
  el.textContent = msg;
}
function escapeHtml(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c]));
}
