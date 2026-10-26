/* SIRKULA — Profile & settings, local demo only. */
document.addEventListener('DOMContentLoaded', () => {
  const me = window.SIRKULA.currentUser();
  if (!me) return;

  const byId = (id) => document.getElementById(id);
  let user = window.SIRKULA.storage.getUserById(me.id);
  if (!user) {
    user = { ...me, phone: '', address: '' };
  }

  function paintProfile(profile) {
    byId('profName').textContent = profile.name || profile.email || window.SIRKULA.t('User');
    byId('profEmail').textContent = profile.email || '';
    byId('profRole').textContent = window.SIRKULA.t(profile.role || me.role);
    byId('acctRole').textContent = window.SIRKULA.t(profile.role || me.role);
    byId('acctStatus').textContent = window.SIRKULA.t(profile.status || 'ACTIVE');
    byId('profStatus').textContent = window.SIRKULA.t(profile.status || 'ACTIVE');
    byId('profPhone').textContent = profile.phone || '—';
    byId('profAddress').textContent = profile.address || '—';
    byId('profAvatar').textContent = initials(profile.name || profile.email);
    byId('profAvatar').setAttribute('aria-label', window.SIRKULA.t('Avatar') + ' ' + (profile.name || profile.email || 'user'));
  }

  paintProfile(user);
  const profileForm = byId('profileForm');
  profileForm.elements.namedItem('name').value = user.name || '';
  profileForm.elements.namedItem('phone').value = user.phone || '';
  profileForm.elements.namedItem('address').value = user.address || '';

  profileForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = profileForm.elements.namedItem('name').value.trim();
    const phone = profileForm.elements.namedItem('phone').value.trim();
    const address = profileForm.elements.namedItem('address').value.trim();
    const message = byId('profileMsg');
    message.textContent = '';
    message.className = 'form-message';

    if (!name) {
      message.textContent = window.SIRKULA.t('Full name is required.');
      message.className = 'form-message form-message--error';
      profileForm.elements.namedItem('name').focus();
      return;
    }

    const button = profileForm.querySelector('button[type="submit"]');
    window.SIRKULA.showLoading(button, true);
    try {
      const updated = window.SIRKULA.storage.updateUser(me.id, { name, phone, address });
      if (!updated) throw new Error(window.SIRKULA.t('Profile could not be found.'));
      user = updated;
      window.SIRKULA.session.set({ id: updated.id, email: updated.email, name: updated.name, role: updated.role, status: updated.status });
      paintProfile(user);
      message.textContent = window.SIRKULA.t('Profile saved successfully.');
      message.className = 'form-message form-message--success';
      window.SIRKULA.toast(window.SIRKULA.t('Profile updated'), 'success');
    } catch (error) {
      message.textContent = error.message || window.SIRKULA.t('Profile could not be saved.');
      message.className = 'form-message form-message--error';
      window.SIRKULA.toast(message.textContent, 'error');
    } finally {
      window.SIRKULA.showLoading(button, false);
    }
  });
});

function initials(value) {
  const words = String(value || 'User').trim().split(/[\s._-]+/).filter(Boolean);
  return words.slice(0, 2).map((word) => word.charAt(0)).join('').toUpperCase() || 'U';
}
