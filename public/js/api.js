/* SIRKULA — API client + UI helpers (vanilla JS) */
const API_BASE = '/api/v1';

let csrfToken = () => {
  const m = document.cookie.match(/(?:^|; )XSRF_TOKEN=([^;]*)/);
  return m ? decodeURIComponent(m[1]) : '';
};

async function request(path, { method = 'GET', body, headers = {}, auth = true } = {}) {
  const opts = { method, headers: { ...headers } };
  // Guard: never redirect to login when the user is already on an auth page
  // (login.html / register.html) — that would create a toast-redirect loop.
  const isAuthPage =
    typeof window !== 'undefined' &&
    (window.location.pathname.endsWith('/login.html') ||
     window.location.pathname.endsWith('/register.html'));
  const isForm = body instanceof FormData;
  if (!isForm && body) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  } else if (isForm) {
    opts.body = body;
  }
  // CSRF for state-changing requests
  const methodUpper = method.toUpperCase();
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(methodUpper)) {
    const token = csrfToken();
    if (token) opts.headers['X-XSRF-TOKEN'] = token;
  }
  const res = await fetch(API_BASE + path, opts);
  let data;
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) data = await res.json();
  else data = { success: res.ok, error: await res.text() };

  if (res.status === 401) {
    // Only show the session-expired toast + redirect for requests that
    // require authentication (auth !== false).  Internal calls such as the
    // initial /auth/me session check on login/register pages pass
    // { auth: false } so they can silently detect the unauthenticated state
    // without spamming the user with toasts or causing a redirect loop.
    const shouldRedirect = auth !== false && !isAuthPage;
    if (shouldRedirect) {
      window.SIRKULA && window.SIRKULA.toast && window.SIRKULA.toast('Session expired. Please log in again.', 'error');
      setTimeout(() => { window.location.href = '/login.html'; }, 600);
    }
    throw new Error('SESSION_EXPIRED');
  }
  if (!res.ok) {
    const err = new Error(data.error || 'Request failed');
    err.status = res.status;
    err.code = data.code;
    err.details = data.details;
    throw err;
  }
  return data;
}

const api = {
  get: (p, o) => request(p, { ...o, method: 'GET' }),
  post: (p, b, o) => request(p, { ...o, method: 'POST', body: b }),
  put: (p, b, o) => request(p, { ...o, method: 'PUT', body: b }),
  patch: (p, b, o) => request(p, { ...o, method: 'PATCH', body: b }),
  del: (p, o) => request(p, { ...o, method: 'DELETE' }),
};

function formatCurrency(n) {
  if (n == null) return 'Free';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(n));
}
function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}
function formatDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

window.SIRKULA = window.SIRKULA || {};
window.SIRKULA.api = api;
window.SIRKULA.formatCurrency = formatCurrency;
window.SIRKULA.formatDate = formatDate;
window.SIRKULA.formatDateTime = formatDateTime;
