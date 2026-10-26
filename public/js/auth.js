/* SIRKULA — demo login and local-only registration. Passwords are never stored. */
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const button = document.getElementById('loginBtn');
      const message = document.getElementById('formMsg');
      window.SIRKULA.showLoading(button, true);
      const result = window.SIRKULA.auth.login(
        loginForm.elements.email.value,
        loginForm.elements.password.value,
        loginForm.elements.role.value,
      );
      window.SIRKULA.showLoading(button, false);
      if (!result.ok) {
        message.textContent = result.error;
        message.className = 'form-message form-message--error';
        window.SIRKULA.toast(result.error, 'error');
        return;
      }
      message.textContent = '';
      window.SIRKULA.toast('Signed in successfully', 'success');
      window.location.href = result.user.role === 'ADMIN' ? '/admin.html' : '/dashboard.html';
    });
  }

  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const button = document.getElementById('registerBtn');
      const message = document.getElementById('formMsg');
      const name = registerForm.elements.name.value.trim();
      const email = registerForm.elements.email.value.trim();
      const password = registerForm.elements.password.value;
      const role = registerForm.elements.role.value;
      message.textContent = '';
      if (!name || !email || !password.trim() || !['SELLER', 'RECEIVER'].includes(role)) {
        message.textContent = 'Isi nama, email, password, dan pilih peran untuk melanjutkan.';
        message.className = 'form-message form-message--error';
        return;
      }
      const duplicate = window.SIRKULA.storage.getUsers().some((user) => String(user.email).toLowerCase() === email.toLowerCase());
      if (duplicate) {
        message.textContent = 'This email is already registered. Please sign in.';
        message.className = 'form-message form-message--error';
        return;
      }
      window.SIRKULA.showLoading(button, true);
      const user = window.SIRKULA.storage.createUser({ name, email, role });
      window.SIRKULA.showLoading(button, false);
      if (!user) {
        message.textContent = 'Account could not be created. Please try again.';
        message.className = 'form-message form-message--error';
        return;
      }
      // Password is deliberately not saved; registration is a local demo flow.
      const sessionUser = { id: user.id, email: user.email, name: user.name, role: user.role, status: user.status };
      window.SIRKULA.session.set(sessionUser);
      window.SIRKULA.toast('Profile created', 'success');
      window.location.href = '/dashboard.html';
    });
  }
});
