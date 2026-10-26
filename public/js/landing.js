/* SIRKULA — landing page cards and transparent sample metrics. */
document.addEventListener('DOMContentLoaded', () => {
  loadFeatured();
  loadImpact();
});

function loadFeatured() {
  const el = document.getElementById('featured-listings');
  if (!el) return;
  try {
    const listings = window.SIRKULA.storage.getListings({ status: 'AVAILABLE' })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3);
    el.replaceChildren();
    if (!listings.length) {
      const empty = document.createElement('div');
      empty.className = 'listing-empty';
      empty.textContent = window.SIRKULA.t('No featured listings available yet.');
      el.appendChild(empty);
      return;
    }
    listings.forEach((listing) => el.appendChild(window.SIRKULA.createListingCard(listing, { featured: true })));
  } catch (error) {
    el.textContent = window.SIRKULA.t('Featured listings are temporarily unavailable.');
  }
}

function loadImpact() {
  const el = document.getElementById('impact-stats');
  if (!el) return;
  try {
    const listings = window.SIRKULA.storage.getListings();
    const reservations = window.SIRKULA.storage.getReservations();
    const users = window.SIRKULA.storage.getUsers();
    const completed = reservations.filter((reservation) => reservation.status === 'COMPLETED');
    const totalUnitsDistributed = completed.reduce((sum, reservation) => sum + (Number(reservation.quantity) || 0), 0);
    const sellers = users.filter((user) => user.role === 'SELLER').length;
    const receivers = users.filter((user) => user.role === 'RECEIVER').length;
    const active = listings.filter((listing) => listing.status === 'AVAILABLE').length;
    const stats = [
      [totalUnitsDistributed, 'units in completed pickups'],
      [completed.length, 'completed pickups'],
      [active, 'available listings'],
      [sellers, 'sellers'],
      [receivers, 'receivers'],
    ];
    el.replaceChildren();
    stats.forEach(([value, label]) => {
      const item = document.createElement('div'); item.className = 'stat';
      const number = document.createElement('div'); number.className = 'stat-value'; number.textContent = String(value);
      const caption = document.createElement('div'); caption.className = 'stat-label'; caption.textContent = window.SIRKULA.t(label);
      item.append(number, caption); el.appendChild(item);
    });
  } catch (error) {
    el.textContent = window.SIRKULA.t('Impact data is unavailable.');
  }
}
