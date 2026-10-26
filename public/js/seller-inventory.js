/* SIRKULA — Seller inventory (demo localStorage) */
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('invListings');
  const statusSel = document.getElementById('invStatus');
  const me = window.SIRKULA.currentUser();
  if (!me) return;

  let listings = [];

  function load() {
    let filter = { sellerId: me.id };
    if (statusSel.value) filter.status = statusSel.value;
    listings = window.SIRKULA.storage.getListings(filter);
    render();
  }

  function render() {
    container.innerHTML = '';
    if (!listings.length) {
      container.innerHTML = '<div class="empty-state"><p>' + window.SIRKULA.t('No listings yet. Create your first listing.') + '</p><a href="/create-listing.html" class="btn btn-primary">' + window.SIRKULA.t('+ New Listing') + '</a></div>';
      return;
    }
    listings.forEach((l) => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <div class="card-body" style="display:flex;flex-wrap:wrap;gap:1rem;align-items:center">
          <div style="flex:1;min-width:220px">
            <div style="display:flex;justify-content:space-between;align-items:start;gap:0.5rem;margin-bottom:0.3rem">
              <h4 style="margin:0;font-size:1.05rem">${escapeHtml(l.title)}</h4>
              ${window.SIRKULA.setBadge(l.status)}
            </div>
            <p style="font-size:0.85rem;color:var(--color-muted);margin-bottom:0.4rem">${escapeHtml(l.description || '')}</p>
            <div style="font-size:0.85rem;color:var(--color-charcoal)">
              ${l.quantity} ${l.unit} &bull; ${window.SIRKULA.formatCurrency(l.price)} &bull; deadline ${window.SIRKULA.formatDate(l.pickupDeadline)}
            </div>
          </div>
          <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
            <button class="btn btn-sm btn-outline" onclick="window.SIRKULA.editListing('${l.id}')">Edit</button>
            <button class="btn btn-sm btn-outline" onclick="window.SIRKULA.archiveListing('${l.id}')">Archive</button>
            <button class="btn btn-sm btn-danger" onclick="window.SIRKULA.deleteListing('${l.id}')">Delete</button>
          </div>
        </div>
      `;
      container.appendChild(card);
    });
  }

  statusSel.addEventListener('change', load);
  load();
});

window.SIRKULA = window.SIRKULA || {};
window.SIRKULA.editListing = function (id) {
  window.location.href = '/create-listing.html?id=' + encodeURIComponent(id);
};
window.SIRKULA.archiveListing = async function (id) {
  if (!confirm(window.SIRKULA.t('Archive this listing?'))) return;
  try {
    const updated = window.SIRKULA.storage.updateListing(id, { status: 'UNAVAILABLE' });
    if (updated) {
      window.SIRKULA.toast(window.SIRKULA.t('Listing archived'), 'success');
      location.reload();
    } else {
      window.SIRKULA.toast(window.SIRKULA.t('Archive failed'), 'error');
    }
  } catch (e) { window.SIRKULA.toast(e.message || 'Archive failed', 'error'); }
};
window.SIRKULA.deleteListing = function (id) {
  if (!confirm(window.SIRKULA.t('Delete this listing? (only allowed if no active reservations)'))) return;
  try {
    // Check for active reservations
    const reservations = window.SIRKULA.storage.getReservations({ listingId: id });
    const active = reservations.filter((r) => r.status === 'PENDING' || r.status === 'APPROVED');
    if (active.length > 0) {
      window.SIRKULA.toast(window.SIRKULA.t('Cannot delete listing with active reservations'), 'error');
      return;
    }
    const ok = window.SIRKULA.storage.deleteListing(id);
    if (ok) {
      window.SIRKULA.toast(window.SIRKULA.t('Listing deleted'), 'success');
      location.reload();
    } else {
      window.SIRKULA.toast(window.SIRKULA.t('Delete failed'), 'error');
    }
  } catch (e) { window.SIRKULA.toast(e.message || 'Delete failed', 'error'); }
};

function escapeHtml(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>\"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c]));
}