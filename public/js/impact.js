/* SIRKULA — Impact dashboard charts */
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const d = await window.SIRKULA.api.get('/impact/stats');
    const data = d.data || {};
    renderStats(data);
    renderTrendChart(data.trends || []);
    renderCategoryChart(data.categoryStats || []);
  } catch (e) {
    document.getElementById('impactStats').innerHTML = '<div class="empty-state"><p>Impact data unavailable.</p></div>';
  }
});

function renderStats(data) {
  const el = document.getElementById('impactStats');
  el.innerHTML = `
    <div class="stat-card"><div class="stat-value">${data.totalDistributed || 0}</div><div class="stat-label">kg distributed</div></div>
    <div class="stat-card"><div class="stat-value">${data.completedReservations || 0}</div><div class="stat-label">completed pickups</div></div>
    <div class="stat-card"><div class="stat-value">${data.activeListings || 0}</div><div class="stat-label">active listings</div></div>
    <div class="stat-card"><div class="stat-value">${data.sellersCount || 0}</div><div class="stat-label">sellers</div></div>
    <div class="stat-card"><div class="stat-value">${data.receiversCount || 0}</div><div class="stat-label">receivers</div></div>
  `;
}

function renderTrendChart(trends) {
  const ctx = document.getElementById('trendChart');
  if (!ctx) return;
  new Chart(ctx.getContext('2d'), {
    type: 'line',
    data: {
      labels: trends.map((t) => t.date),
      datasets: [{ label: 'kg distributed', data: trends.map((t) => t.quantity), borderColor: '#76B66B', backgroundColor: 'rgba(118,182,107,0.15)', fill: true, tension: 0.3, pointRadius: 3 }],
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } },
  });
}

function renderCategoryChart(cats) {
  const ctx = document.getElementById('categoryChart');
  if (!ctx) return;
  new Chart(ctx.getContext('2d'), {
    type: 'doughnut',
    data: {
      labels: cats.map((c) => c.category),
      datasets: [{
        data: cats.map((c) => c.quantity),
        backgroundColor: ['#76B66B','#173F35','#C5E7A5','#102D24','#B8860B','#1F6FEB'],
      }],
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } },
  });
}
