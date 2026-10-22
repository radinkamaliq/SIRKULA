const prisma = require('../lib/prisma');
const { validationResult } = require('express-validator');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');

function listingResponse(l) {
  return {
    id: l.id,
    title: l.title,
    description: l.description,
    category: l.category,
    quantity: l.quantity ? Number(l.quantity) : 0,
    availableQuantity: l.availableQuantity ? Number(l.availableQuantity) : 0,
    unit: l.unit,
    condition: l.condition,
    price: l.price ? Number(l.price) : null,
    currency: l.currency,
    sellerId: l.sellerId,
    sellerName: l.seller ? l.seller.name : null,
    pickupLocation: l.pickupLocation,
    pickupLat: l.pickupLat ? Number(l.pickupLat) : null,
    pickupLng: l.pickupLng ? Number(l.pickupLng) : null,
    pickupDeadline: l.pickupDeadline,
    images: l.images || [],
    status: l.status,
    createdAt: l.createdAt,
  };
}

/**
 * GET /api/v1/marketplace — search/filter/sort/paginate listings (public)
 */
const searchListings = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw Object.assign(new Error('Validation failed'), { statusCode: 400, errors: errors.array() });
  }

  const {
    q, category, location, status = 'AVAILABLE', sort = 'newest',
    page = 1, limit = 20, lat, lng,
  } = req.query;

  const where = {};
  if (status) where.status = status;
  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
      { category: { contains: q, mode: 'insensitive' } },
      { pickupLocation: { contains: q, mode: 'insensitive' } },
    ];
  }
  if (category) where.category = category;
  if (location) where.pickupLocation = { contains: location, mode: 'insensitive' };

  // Auto-flag expired listings: any listing whose pickupDeadline is past and still AVAILABLE
  await prisma.foodListing.updateMany({
    where: { status: 'AVAILABLE', pickupDeadline: { lt: new Date() } },
    data: { status: 'EXPIRED' },
  });

  const orderBy = sort === 'nearest' ? { createdAt: 'desc' } : sort === 'deadline' ? { pickupDeadline: 'asc' } : { createdAt: 'desc' };

  const [listings, total] = await prisma.$transaction([
    prisma.foodListing.findMany({
      where,
      orderBy,
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      include: { seller: { select: { id: true, name: true } } },
    }),
    prisma.foodListing.count({ where }),
  ]);

  let results = listings.map(listingResponse);

  // Distance sorting when coordinates provided (haversine in JS, deterministic)
  if (sort === 'nearest' && lat && lng) {
    const userLat = Number(lat);
    const userLng = Number(lng);
    results = results.map((l) => {
      let dist = null;
      if (l.pickupLat != null && l.pickupLng != null) {
        dist = haversine(userLat, userLng, l.pickupLat, l.pickupLng);
      }
      return { ...l, _distance: dist };
    }).filter((l) => l._distance != null)
      .sort((a, b) => a._distance - b._distance)
      .map(({ _distance, ...rest }) => rest);
  }

  res.json({
    success: true,
    data: { listings: results, page: Number(page), limit: Number(limit), total },
  });
});

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * GET /api/v1/marketplace/categories — list categories (public)
 */
const getCategories = asyncHandler(async (_req, res) => {
  const categories = await prisma.foodListing.findMany({
    select: { category: true },
    distinct: ['category'],
    where: { status: 'AVAILABLE' },
  });
  res.json({ success: true, data: categories.map((c) => c.category) });
});

module.exports = { searchListings, getCategories, listingResponse };
