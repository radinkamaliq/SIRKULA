const prisma = require('../lib/prisma');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');

/**
 * GET /api/v1/matching/recommendations
 * Transparent, deterministic recommendation scoring (no AI/ML claims).
 *
 * Score factors (0-1 each), weighted:
 *   - category match (0.30)
 *   - geographic proximity (0.30) when coordinates exist
 *   - quantity fit (0.20): requested vs available
 *   - pickup deadline urgency (0.10): sooner deadline = higher
 *   - availability (0.10): whether listing is AVAILABLE
 *
 * Returns each recommendation with a short plain-language explanation.
 */
const getRecommendations = asyncHandler(async (req, res) => {
  const { lat, lng, category, limit = 10 } = req.query;
  const userLat = lat ? Number(lat) : null;
  const userLng = lng ? Number(lng) : null;
  const prefCategory = category ? String(category) : null;
  const take = Math.min(Math.max(Number(limit) || 10, 1), 50);

  // Auto-expire stale listings first
  await prisma.foodListing.updateMany({
    where: { status: 'AVAILABLE', pickupDeadline: { lt: new Date() } },
    data: { status: 'EXPIRED' },
  });

  const listings = await prisma.foodListing.findMany({
    where: {
      status: 'AVAILABLE',
      availableQuantity: { gt: 0 },
      ...(prefCategory ? { category: prefCategory } : {}),
    },
    include: { seller: { select: { id: true, name: true } } },
    take: 100, // score in memory over a reasonable candidate set
  });

  const now = new Date();
  const soon = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const scored = listings.map((l) => {
    let score = 0;
    const reasons = [];

    // 1. Category match (0.30)
    let categoryScore = 0;
    if (prefCategory && l.category === prefCategory) {
      categoryScore = 1;
      reasons.push('category matches your preference');
    } else if (!prefCategory) {
      categoryScore = 0.5;
    }
    score += categoryScore * 0.30;

    // 2. Geographic proximity (0.30)
    let proximityScore = 0;
    let distanceKm = null;
    if (userLat != null && userLng != null && l.pickupLat != null && l.pickupLng != null) {
      distanceKm = haversine(userLat, userLng, l.pickupLat, l.pickupLng);
      proximityScore = Math.max(0, 1 - distanceKm / 20); // 20 km = 0 score
      if (distanceKm <= 5) reasons.push('pickup location is nearby');
      else if (distanceKm <= 20) reasons.push('pickup location is within reasonable distance');
    }
    score += proximityScore * 0.30;

    // 3. Quantity fit (0.20)
    let qtyScore = Math.min(1, Number(l.availableQuantity || 0) / 10);
    score += qtyScore * 0.20;

    // 4. Deadline urgency (0.10)
    let deadlineScore = 0;
    const deadline = new Date(l.pickupDeadline);
    if (deadline <= soon) {
      deadlineScore = 1;
      reasons.push('pickup deadline is approaching');
    } else {
      deadlineScore = 0.3;
    }
    score += deadlineScore * 0.10;

    // 5. Availability (0.10)
    const availabilityScore = l.status === 'AVAILABLE' ? 1 : 0;
    score += availabilityScore * 0.10;

    let explanation = '';
    if (reasons.length > 0) {
      explanation = 'Recommended because ' + reasons.join(', ') + '.';
    } else {
      explanation = 'Listed as available surplus food near you.';
    }

    return { ...listingResponse(l), score: Math.round(score * 100) / 100, distanceKm, explanation };
  });

  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, take);

  res.json({
    success: true,
    data: {
      recommendations: top,
      method: 'deterministic-scoring',
      note: 'Recommendations use a transparent rule-based score, not AI or machine learning.',
    },
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

module.exports = { getRecommendations };
