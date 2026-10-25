/* SIRKULA — Auth form handling (demo login) */
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = document.getElementById('loginBtn');
      window.SIRKULA.showLoading(btn, true);
      const formMsg = document.getElementById('formMsg');
      try {
        const email = loginForm.email.value;
        const password = loginForm.password.value;
        const role = loginForm.role.value;
        const result = window.SIRKULA.auth.login(email, password, role);
        window.SIRKULA.showLoading(btn, false);
        if (result.ok) {
          window.SIRKULA.toast('Login successful', 'success');
          const r = result.user.role;
          if (r === 'ADMIN') window.location.href = '/admin.html';
          else if (r === 'SELLER') window.location.href = '/dashboard.html';
          else window.location.href = '/dashboard.html';
        } else {
          formMsg.innerHTML = '<div style="color:var(--color-danger)">' + result.error + '</div>';
          window.SIRKULA.toast(result.error, 'error');
        }
      } catch (err) {
        window.SIRKULA.showLoading(btn, false);
        formMsg.innerHTML = '<div style="color:var(--color-danger)">' + (err.message || 'Login failed') + '</div>';
        window.SIRKULA.toast(err.message || 'Login failed', 'error');
      }
    });
  }
});

function escapeHtml(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>\\\"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
}

function escapeHtml(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>\"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c]));
}