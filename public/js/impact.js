/* SIRKULA — impact visuals using native canvas; no CDN or external chart dependency. */
document.addEventListener('DOMContentLoaded', () => {
  const statsEl = document.getElementById('impactStats');
  if (!statsEl || !window.SIRKULA || !window.SIRKULA.storage) return;

  try {
    const listings = window.SIRKULA.storage.getListings();
    const reservations = window.SIRKULA.storage.getReservations();
    const users = window.SIRKULA.storage.getUsers();
    const completed = reservations.filter((reservation) => reservation.status === 'COMPLETED');
    const activeListings = listings.filter((listing) => listing.status === 'AVAILABLE').length;
    const sellers = users.filter((user) => user.role === 'SELLER').length;
    const receivers = users.filter((user) => user.role === 'RECEIVER').length;
    const stats = [
      [completed.length, 'completed pickups'],
      [activeListings, 'available listings'],
      [reservations.filter((reservation) => reservation.status === 'PENDING').length, 'pending requests'],
      [sellers, 'demo sellers'],
      [receivers, 'receivers'],
    ];
    statsEl.replaceChildren();
    stats.forEach(([value, label]) => {
      const card = document.createElement('article'); card.className = 'stat-card';
      const number = document.createElement('div'); number.className = 'stat-value'; number.textContent = String(value);
      const caption = document.createElement('div'); caption.className = 'stat-label'; caption.textContent = window.SIRKULA.t(label);
      card.append(number, caption); statsEl.appendChild(card);
    });

    const trendData = makeTrend(completed);
    drawLineChart(document.getElementById('trendChart'), trendData.labels, trendData.values);
    const categoryCounts = {};
    listings.forEach((listing) => { const category = listing.category || 'Other'; categoryCounts[category] = (categoryCounts[category] || 0) + 1; });
    const categoryRows = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);
    drawDonutChart(document.getElementById('categoryChart'), categoryRows);
    renderLegend(document.getElementById('categoryLegend'), categoryRows);

    let resizeTimer;
    window.addEventListener('resize', () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        drawLineChart(document.getElementById('trendChart'), trendData.labels, trendData.values);
        drawDonutChart(document.getElementById('categoryChart'), categoryRows);
      }, 100);
    });
  } catch (error) {
    statsEl.replaceChildren();
    const message = document.createElement('div'); message.className = 'empty-state';
    message.textContent = window.SIRKULA.t('Impact data is unavailable. Please reload the page.'); statsEl.appendChild(message);
  }
});

const CHART_COLORS = ['#246447', '#77A95C', '#C7DFAB', '#D9A441', '#476E94', '#B7D9CA', '#8F6AA8'];

function makeTrend(completed) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const labels = []; const values = [];
  for (let offset = 13; offset >= 0; offset -= 1) {
    const day = new Date(today); day.setDate(today.getDate() - offset);
    const key = localDateKey(day);
    labels.push(day.toLocaleDateString(window.SIRKULA && window.SIRKULA.i18n && window.SIRKULA.i18n.getLanguage && window.SIRKULA.i18n.getLanguage() === 'en' ? 'en-US' : 'id-ID', { day: 'numeric', month: 'short' }));
    values.push(completed.filter((reservation) => {
      const timestamp = reservation.updatedAt || reservation.createdAt;
      return timestamp && localDateKey(new Date(timestamp)) === key;
    }).length);
  }
  return { labels, values };
}


function localDateKey(value) {
  const date = value instanceof Date ? value : new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function prepareCanvas(canvas) {
  if (!canvas) return null;
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(260, Math.round(rect.width || 300));
  const height = Math.max(190, Math.round(rect.height || 230));
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.clearRect(0, 0, width, height);
  return { ctx, width, height };
}

function drawLineChart(canvas, labels, values) {
  const prepared = prepareCanvas(canvas); if (!prepared) return;
  const { ctx, width, height } = prepared;
  const padding = { top: 16, right: 14, bottom: 36, left: 28 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const maxValue = Math.max(1, ...values);
  ctx.font = '11px system-ui, sans-serif';
  ctx.textBaseline = 'middle';
  // Keep labels readable for small counts (e.g. 0–1); avoid duplicate rounded ticks.
  const tickValues = maxValue <= 4
    ? Array.from({ length: maxValue + 1 }, (_, index) => index)
    : [0, Math.round(maxValue / 3), Math.round((maxValue * 2) / 3), maxValue].filter((value, index, all) => all.indexOf(value) === index);
  tickValues.forEach((value) => {
    const y = padding.top + chartH - (chartH * value / maxValue);
    ctx.strokeStyle = '#e7ece7'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(padding.left, y); ctx.lineTo(width - padding.right, y); ctx.stroke();
    ctx.fillStyle = '#718078'; ctx.textAlign = 'right'; ctx.fillText(String(value), padding.left - 8, y);
  });
  const points = values.map((value, index) => ({
    x: padding.left + (values.length <= 1 ? 0 : chartW * index / (values.length - 1)),
    y: padding.top + chartH - (chartH * value / maxValue),
  }));
  if (points.length) {
    const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
    gradient.addColorStop(0, 'rgba(119, 169, 92, .28)'); gradient.addColorStop(1, 'rgba(119, 169, 92, 0)');
    ctx.beginPath(); ctx.moveTo(points[0].x, height - padding.bottom);
    points.forEach((point) => ctx.lineTo(point.x, point.y));
    ctx.lineTo(points[points.length - 1].x, height - padding.bottom); ctx.closePath();
    ctx.fillStyle = gradient; ctx.fill();
    ctx.beginPath(); points.forEach((point, index) => index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y));
    ctx.strokeStyle = '#246447'; ctx.lineWidth = 2.5; ctx.lineJoin = 'round'; ctx.stroke();
    points.forEach((point) => { ctx.beginPath(); ctx.arc(point.x, point.y, 3, 0, Math.PI * 2); ctx.fillStyle = '#246447'; ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke(); });
  }
  const step = width < 420 ? 4 : 2;
  labels.forEach((label, index) => {
    const isLast = index === labels.length - 1;
    const previousIsScheduled = index > 0 && (index - 1) % step === 0;
    if (index % step !== 0 && (!isLast || previousIsScheduled)) return;
    const x = padding.left + (labels.length <= 1 ? 0 : chartW * index / (labels.length - 1));
    ctx.fillStyle = '#718078';
    ctx.textAlign = index === 0 ? 'left' : index === labels.length - 1 ? 'right' : 'center';
    ctx.fillText(label, x, height - 15);
  });
}

function drawDonutChart(canvas, rows) {
  const prepared = prepareCanvas(canvas); if (!prepared) return;
  const { ctx, width, height } = prepared;
  const total = rows.reduce((sum, row) => sum + row[1], 0);
  if (!total) {
    ctx.font = '13px system-ui, sans-serif'; ctx.fillStyle = '#718078'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(window.SIRKULA.t('No listings yet'), width / 2, height / 2); return;
  }
  const radius = Math.min(width * .27, height * .36, 98);
  const cx = width / 2; const cy = height / 2; const thickness = Math.max(18, radius * .32);
  let start = -Math.PI / 2;
  rows.forEach((row, index) => {
    const end = start + Math.PI * 2 * row[1] / total;
    ctx.beginPath(); ctx.arc(cx, cy, radius, start, end); ctx.strokeStyle = CHART_COLORS[index % CHART_COLORS.length]; ctx.lineWidth = thickness; ctx.lineCap = 'butt'; ctx.stroke();
    start = end;
  });
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#173f35';
  ctx.font = '800 28px system-ui, sans-serif'; ctx.fillText(String(total), cx, cy - 3);
  ctx.font = '12px system-ui, sans-serif'; ctx.fillStyle = '#718078'; ctx.fillText('listings', cx, cy + 19);
}

function renderLegend(container, rows) {
  if (!container) return;
  container.replaceChildren();
  if (!rows.length) { const p = document.createElement('p'); p.className = 'helper'; p.textContent = window.SIRKULA.t('No categories to display.'); container.appendChild(p); return; }
  rows.forEach(([label, count], index) => {
    const item = document.createElement('div'); item.className = 'chart-legend__item';
    const swatch = document.createElement('span'); swatch.className = 'chart-legend__swatch'; swatch.style.backgroundColor = CHART_COLORS[index % CHART_COLORS.length]; swatch.setAttribute('aria-hidden', 'true');
    const text = document.createElement('span'); text.className = 'chart-legend__label'; text.textContent = label;
    const value = document.createElement('strong'); value.className = 'chart-legend__value'; value.textContent = String(count);
    item.append(swatch, text, value); container.appendChild(item);
  });
}
