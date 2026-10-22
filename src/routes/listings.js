const express = require('express');
const router = express.Router();
const {
  createListing, getListing, getMyListings, updateListing, deleteListing, archiveListing,
} = require('../controllers/listingController');
const { createListingRules, updateListingRules, listingIdParam } = require('../validators/listingValidator');
const { requireAuth, requireRole } = require('../middleware/auth');
const { csrfProtection } = require('../middleware/csrf');
const { uploadSingle } = require('../middleware/upload');

// Public listing detail
router.get('/:id', getListing);

// Seller routes
router.post('/', requireAuth, requireRole('SELLER'), csrfProtection, uploadSingle('image'), createListingRules, createListing);
router.get('/', requireAuth, requireRole('SELLER'), getMyListings);
router.patch('/:id', requireAuth, requireRole('SELLER'), csrfProtection, uploadSingle('image'), updateListingRules, updateListing);
router.delete('/:id', requireAuth, requireRole('SELLER'), csrfProtection, listingIdParam, deleteListing);
router.post('/:id/archive', requireAuth, requireRole('SELLER'), csrfProtection, listingIdParam, archiveListing);

module.exports = router;
