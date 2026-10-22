const express = require('express');
const router = express.Router();
const { searchListings, getCategories } = require('../controllers/marketplaceController');
const { marketplaceFilters } = require('../validators/listingValidator');

// Public marketplace (search/filter/sort/paginate)
router.get('/', marketplaceFilters, searchListings);
router.get('/categories', getCategories);

module.exports = router;
