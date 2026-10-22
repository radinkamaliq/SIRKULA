/* SIRKULA — Auth form handling */
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('loginBtn');
      window.SIRKULA.showLoading(btn, true);
      const formMsg = document.getElementById('formMsg');
      try {
        const data = await window.SIRKULA.api.post('/auth/login', {
          email: loginForm.email.value,
          password: loginForm.password.value,
        });
        window.SIRKULA.toast('Login successful', 'success');
        const role = data.data.role;
        if (role === 'ADMIN') window.location.href = '/admin.html';
        else window.location.href = '/dashboard.html';
      } catch (err) {
        window.SIRKULA.showLoading(btn, false);
        formMsg.innerHTML = `<div style="color:var(--color-danger)">${escapeHtml(err.message || 'Login failed')}</div>`;
        window.SIRKULA.toast(err.message || 'Login failed', 'error');
      }
    });
  }

  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('registerBtn');
      window.SIRKULA.showLoading(btn, true);
      const formMsg = document.getElementById('formMsg');
      try {
        const data = await window.SIRKULA.api.post('/auth/register', {
          name: registerForm.name.value,
          email: registerForm.email.value,
          password: registerForm.password.value,
          role: registerForm.role.value,
        });
        window.SIRKULA.toast('Account created', 'success');
        const role = data.data.role;
        window.location.href = (role === 'ADMIN') ? '/admin.html' : '/dashboard.html';
      } catch (err) {
        window.SIRKULA.showLoading(btn, false);
        showFieldErrors(registerForm, err);
        formMsg.innerHTML = `<div style="color:var(--color-danger)">${escapeHtml(err.message || 'Registration failed')}</div>`;
        window.SIRKULA.toast(err.message || 'Registration failed', 'error');
      }
    });
  }
});

function showFieldErrors(form, err) {
  clearErrors(form);
  if (err.code === 'DUPLICATE_EMAIL') {
    setErr(form.email, 'Email already registered');
  } else if (err.errors && Array.isArray(err.errors)) {
    err.errors.forEach((e) => {
      const field = form.elements[e.path?.[0] || e.param || ''];
      if (field) setErr(field, e.msg);
    });
  }
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
function clearErrors(form) {
  form.querySelectorAll('.error').forEach((f) => f.classList.remove('error'));
  form.querySelectorAll('.error-text').forEach((t) => t.remove());
}
function escapeHtml(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c]));
}
