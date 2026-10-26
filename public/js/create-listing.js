/* SIRKULA — create/edit listings using browser localStorage only. */
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('listingForm');
  const button = document.getElementById('createBtn');
  const message = document.getElementById('formMsg');
  if (!form || !button || !message) return;

  const field = (name) => form.elements.namedItem(name);
  const currentUser = window.SIRKULA.currentUser();
  const params = new URLSearchParams(window.location.search);
  const editId = params.get('id');
  let existingListing = editId ? window.SIRKULA.storage.getListingById(editId) : null;

  if (!currentUser) {
    window.location.replace('/login.html');
    return;
  }
  if (editId && (!existingListing || existingListing.sellerId !== currentUser.id)) {
    window.SIRKULA.toast('Listing not found or does not belong to your account.', 'error');
    window.location.replace('/seller-inventory.html');
    return;
  }

  const deadlineInput = field('pickupDeadline');
  if (existingListing) {
    document.getElementById('createListingTitle').textContent = window.SIRKULA.t('Edit Listing');
    button.textContent = window.SIRKULA.t('Save changes');
    ['title', 'description', 'category', 'quantity', 'unit', 'condition', 'price', 'pickupLocation', 'pickupLat', 'pickupLng'].forEach((name) => {
      if (existingListing[name] != null && field(name)) field(name).value = existingListing[name];
    });
    if (existingListing.pickupDeadline) {
      const deadline = new Date(existingListing.pickupDeadline);
      deadline.setMinutes(deadline.getMinutes() - deadline.getTimezoneOffset());
      deadlineInput.value = deadline.toISOString().slice(0, 16);
    }
  } else {
    const deadline = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    deadline.setMinutes(deadline.getMinutes() - deadline.getTimezoneOffset());
    deadlineInput.value = deadline.toISOString().slice(0, 16);
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    message.textContent = '';
    message.className = 'form-message';
    clearFieldErrors(form);

    const values = {
      title: field('title').value.trim(),
      description: field('description').value.trim(),
      category: field('category').value,
      quantity: Number(field('quantity').value),
      unit: field('unit').value,
      condition: field('condition').value,
      price: field('price').value.trim() === '' ? null : Number(field('price').value),
      pickupLocation: field('pickupLocation').value.trim(),
      pickupLat: field('pickupLat').value.trim() === '' ? null : Number(field('pickupLat').value),
      pickupLng: field('pickupLng').value.trim() === '' ? null : Number(field('pickupLng').value),
      pickupDeadline: field('pickupDeadline').value && !Number.isNaN(Date.parse(field('pickupDeadline').value)) ? new Date(field('pickupDeadline').value).toISOString() : '',
    };

    let valid = true;
    const required = [
      ['title', 'Food name is required.'],
      ['category', 'Please select a category.'],
      ['unit', 'Please select a unit.'],
      ['condition', 'Please select a condition.'],
      ['pickupLocation', 'Pickup location is required.'],
    ];
    required.forEach(([name, error]) => {
      if (!field(name).value.trim()) { showFieldError(field(name), error); valid = false; }
    });
    if (!field('quantity').value || !Number.isFinite(values.quantity) || values.quantity <= 0) {
      showFieldError(field('quantity'), 'Quantity must be greater than 0.'); valid = false;
    }
    if (values.price != null && (!Number.isFinite(values.price) || values.price < 0)) {
      showFieldError(field('price'), 'Price cannot be negative.'); valid = false;
    }
    if (!field('pickupDeadline').value || Number.isNaN(Date.parse(field('pickupDeadline').value))) {
      showFieldError(field('pickupDeadline'), 'Please choose a valid pickup deadline.'); valid = false;
    } else if (new Date(field('pickupDeadline').value).getTime() < Date.now()) {
      showFieldError(field('pickupDeadline'), 'The deadline must be in the future.'); valid = false;
    }
    if (!valid) {
      message.textContent = 'Please review the highlighted fields before saving.';
      message.className = 'form-message form-message--error';
      return;
    }

    const photo = field('image').files && field('image').files[0];
    if (photo && (!photo.type.startsWith('image/') || photo.size > 5 * 1024 * 1024)) {
      showFieldError(field('image'), 'Please choose a valid image file up to 5 MB.');
      message.textContent = 'Photo exceeds the allowed size.';
      message.className = 'form-message form-message--error';
      return;
    }

    window.SIRKULA.showLoading(button, true);
    try {
      let images = existingListing && Array.isArray(existingListing.images) ? existingListing.images.slice() : [];
      if (photo) images = [await optimizeImage(photo)];
      const payload = {
        ...values,
        availableQuantity: existingListing
          ? Math.min(Number(existingListing.availableQuantity ?? existingListing.quantity), values.quantity)
          : values.quantity,
        images,
        status: existingListing ? existingListing.status : 'AVAILABLE',
      };
      const saved = existingListing
        ? window.SIRKULA.storage.updateListing(existingListing.id, payload)
        : window.SIRKULA.storage.createListing({ ...payload, sellerId: currentUser.id });
      window.SIRKULA.showLoading(button, false);
      if (!saved) throw new Error('Listing could not be saved.');
      window.SIRKULA.toast(existingListing ? window.SIRKULA.t('Listing updated') : window.SIRKULA.t('Listing created'), 'success');
      window.location.href = '/seller-inventory.html';
    } catch (error) {
      window.SIRKULA.showLoading(button, false);
      message.textContent = error.message || 'The listing could not be saved. Please try again.';
      message.className = 'form-message form-message--error';
      window.SIRKULA.toast(message.textContent, 'error');
    }
  });
});

async function optimizeImage(file) {
  if (typeof createImageBitmap !== 'function') {
    return readFileAsDataUrl(file);
  }
  const bitmap = await createImageBitmap(file);
  const maxSide = 1000;
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext('2d');
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL('image/jpeg', 0.78);
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Foto tidak dapat dibaca.'));
    reader.readAsDataURL(file);
  });
}

function clearFieldErrors(form) {
  form.querySelectorAll('.field-error').forEach((element) => element.remove());
  form.querySelectorAll('.error').forEach((element) => element.classList.remove('error'));
}

function showFieldError(field, text) {
  field.classList.add('error');
  const error = document.createElement('div');
  error.className = 'error-text field-error';
  error.textContent = text;
  field.insertAdjacentElement('afterend', error);
}
