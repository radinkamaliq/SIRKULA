/* SIRKULA — Profile & settings */
document.addEventListener('DOMContentLoaded', async () => {
  const me = window.SIRKULA.currentUser();
  if (!me) return;
  document.getElementById('profName').textContent = me.name;
  document.getElementById('profEmail').textContent = me.email;
  document.getElementById('profRole').textContent = me.role;
  document.getElementById('acctRole').textContent = me.role;
  document.getElementById('acctStatus').textContent = me.status;

  try {
    const d = await window.SIRKULA.api.get('/users/me');
    const u = d.data.user;
    document.getElementById('profStatus').textContent = u.status;
    document.getElementById('profPhone').textContent = u.phone || '—';
    document.getElementById('profAddress').textContent = u.address || '—';
    document.getElementById('profileForm').name.value = u.name || '';
    document.getElementById('profileForm').phone.value = u.phone || '';
    document.getElementById('profileForm').address.value = u.address || '';
  } catch (_) {}

  // Edit profile
  document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    const msg = document.getElementById('profileMsg');
    window.SIRKULA.showLoading(btn, true);
    try {
      await window.SIRKULA.api.patch('/users/me', {
        name: e.target.name.value,
        phone: e.target.phone.value,
        address: e.target.address.value,
      });
      window.SIRKULA.toast('Profile updated', 'success');
      msg.textContent = '';
    } catch (err) {
      window.SIRKULA.showLoading(btn, false);
      msg.innerHTML = `<div style="color:var(--color-danger)">${err.message || 'Failed'}</div>`;
    }
  });

  // Change password
  document.getElementById('passwordForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    const msg = document.getElementById('passwordMsg');
    window.SIRKULA.showLoading(btn, true);
    try {
      await window.SIRKULA.api.patch('/users/change-password', {
        currentPassword: e.target.currentPassword.value,
        newPassword: e.target.newPassword.value,
      });
      window.SIRKULA.toast('Password changed', 'success');
      e.target.reset();
      msg.textContent = '';
    } catch (err) {
      window.SIRKULA.showLoading(btn, false);
      msg.innerHTML = `<div style="color:var(--color-danger)">${err.message || 'Failed'}</div>`;
    }
  });
});

function initials(name) {
  return (name || 'U').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}
