/* SIRKULA — Impact dashboard (demo localStorage) */
document.addEventListener('DOMContentLoaded', () => {
  try {
    const listings = window.SIRKULA.storage.getListings();
    const reservations = window.SIRKULA.storage.getReservations();
    const users = window.SIRKULA.storage.getUsers();
    const completed = reservations.filter((r) => r.status === 'COMPLETED');
    let totalDistributed = 0;
    completed.forEach((r) => { totalDistributed += r.quantity || 0; });
    const activeListings = listings.filter((l) => l.status === 'AVAILABLE').length;
    const sellers = users.filter((u) => u.role === 'SELLER').length;
    const receivers = users.filter((u) => u.role === 'RECEIVER').length;

    const el = document.getElementById('impactStats');
    if (el) {
      el.innerHTML = `
        <div class="stat-card"><div class="stat-value">${Math.round(totalDistributed)}</div><div class="stat-label">kg distributed</div></div>
        <div class="stat-card"><div class="stat-value">${completed.length}</div><div class="stat-label">completed pickups</div></div>
        <div class="stat-card"><div class="stat-value">${activeListings}</div><div class="stat-label">active listings</div></div>
        <div class="stat-card"><div class="stat-value">${sellers}</div><div class="stat-label">sellers</div></div>
        <div class="stat-card"><div class="stat-value">${receivers}</div><div class="stat-label">receivers</div></div>
      `;
    }

    // Trend chart (mock from completed reservations grouped by date)
    const ctxTrend = document.getElementById('trendChart');
    if (ctxTrend && typeof Chart !== 'undefined') {
      const byDate = {};
      completed.forEach((r) => {
        const d = r.createdAt ? r.createdAt.slice(0, 10) : 'unknown';
        byDate[d] = (byDate[d] || 0) + (r.quantity || 0);
      });
      const labels = Object.keys(byDate).sort().slice(-7);
      const data = labels.map((d) => byDate[d]);
      new Chart(ctxTrend.getContext('2d'), {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{ label: 'kg distributed', data: data, borderColor: '#76B66B', backgroundColor: 'rgba(118,182,107,0.15)', fill: true, tension: 0.3, pointRadius: 3 }],
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } },
      });
    }

    // Category chart
    const ctxCat = document.getElementById('categoryChart');
    if (ctxCat && typeof Chart !== 'undefined') {
      const byCat = {};
      listings.forEach((l) => { byCat[l.category] = (byCat[l.category] || 0) + (l.quantity || 0); });
      const labels = Object.keys(byCat);
      const data = labels.map((c) => byCat[c]);
      new Chart(ctxCat.getContext('2d'), {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{ data: data, backgroundColor: ['#76B66B','#173F35','#C5E7A5','#102D24','#B8860B','#1F6FEB'] }],
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } },
      });
    }
  } catch (e) {
    const el = document.getElementById('impactStats');
    if (el) el.innerHTML = '<div class="empty-state"><p>Impact data unavailable.</p></div>';
  }
});