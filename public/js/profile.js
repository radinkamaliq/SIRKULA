/* SIRKULA — Profile & settings (demo localStorage) */
document.addEventListener('DOMContentLoaded', () => {
  const me = window.SIRKULA.currentUser();
  if (!me) return;
  document.getElementById('profName').textContent = me.name;
  document.getElementById('profEmail').textContent = me.email;
  document.getElementById('profRole').textContent = me.role;
  document.getElementById('acctRole').textContent = me.role;
  document.getElementById('acctStatus').textContent = me.status;
  document.getElementById('profAvatar').textContent = initials(me.name || me.email);

  // Load profile details from storage
  const user = window.SIRKULA.storage.getUserById(me.id);
  if (user) {
    document.getElementById('profStatus').textContent = user.status;
    document.getElementById('profPhone').textContent = user.phone || '—';
    document.getElementById('profAddress').textContent = user.address || '—';
    document.getElementById('profileForm').name.value = user.name || '';
    document.getElementById('profileForm').phone.value = user.phone || '';
    document.getElementById('profileForm').address.value = user.address || '';
  }

  // Edit profile
  document.getElementById('profileForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    const msg = document.getElementById('profileMsg');
    window.SIRKULA.showLoading(btn, true);
    try {
      const updated = window.SIRKULA.storage.updateUser(me.id, {
        name: e.target.name.value,
        phone: e.target.phone.value,
        address: e.target.address.value,
      });
      window.SIRKULA.showLoading(btn, false);
      if (updated) {
        window.SIRKULA.toast('Profile updated', 'success');
        msg.textContent = '';
        // Update session
        const sessionUser = { id: updated.id, email: updated.email, name: updated.name, role: updated.role, status: updated.status };
        window.SIRKULA.session.set(sessionUser);
         document.getElementById('profAvatar').textContent = initials(updated.name || updated.email);
         document.getElementById('profName').textContent = updated.name;
      } else {
        msg.innerHTML = '<div style="color:var(--color-danger)">Failed to update profile</div>';
      }
    } catch (err) {
      window.SIRKULA.showLoading(btn, false);
      msg.innerHTML = '<div style="color:var(--color-danger)">' + (err.message || 'Failed') + '</div>';
    }
  });

  // Change password (demo simulation)
  document.getElementById('passwordForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    const msg = document.getElementById('passwordMsg');
    window.SIRKULA.showLoading(btn, true);
    try {
      // Demo: accept any new password, just simulate success
      window.SIRKULA.showLoading(btn, false);
      window.SIRKULA.toast('Password changed (demo simulation)', 'success');
      e.target.reset();
      msg.textContent = '';
    } catch (err) {
      window.SIRKULA.showLoading(btn, false);
      msg.innerHTML = '<div style="color:var(--color-danger)">' + (err.message || 'Failed') + '</div>';
    }
  });
});

function initials(name) {
  return (name || 'U').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}