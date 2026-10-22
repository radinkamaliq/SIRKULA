const prisma = require('../lib/prisma');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');

/**
 * GET /api/v1/impact/stats — platform-wide aggregated impact (real DB data)
 */
const getStats = asyncHandler(async (_req, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalDistributed,
    completedReservations,
    activeListings,
    sellersCount,
    receiversCount,
    recentDistributions,
    categoryStats,
  ] = await prisma.$transaction([
    prisma.distributionRecord.aggregate({
      _sum: { quantityDistributed: true },
    }),
    prisma.reservation.count({ where: { status: 'COMPLETED' } }),
    prisma.foodListing.count({ where: { status: 'AVAILABLE' } }),
    prisma.user.count({ where: { role: 'SELLER', status: 'ACTIVE' } }),
    prisma.user.count({ where: { role: 'RECEIVER', status: 'ACTIVE' } }),
    prisma.distributionRecord.findMany({
      where: { distributedAt: { gte: startOfMonth } },
      orderBy: { distributedAt: 'asc' },
      take: 100,
      include: { reservation: { select: { listingId: true } } },
    }),
    prisma.reservation.groupBy({
      by: ['listingId'],
      where: { status: 'COMPLETED' },
      _sum: { quantity: true },
    }),
  ]);

  // Category-level distribution: join reservations -> listings -> category
  const reservations = await prisma.reservation.findMany({
    where: { status: 'COMPLETED' },
    include: { listing: { select: { category: true } } },
  });
  const categoryMap = {};
  for (const r of reservations) {
    const cat = r.listing.category;
    categoryMap[cat] = (categoryMap[cat] || 0) + Number(r.quantity || 0);
  }
  const categoryStatsOut = Object.entries(categoryMap).map(([category, qty]) => ({ category, quantity: qty }));

  // Distribution trends over time (group by day, last 30 days)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const distributions = await prisma.distributionRecord.findMany({
    where: { distributedAt: { gte: thirtyDaysAgo } },
    select: { distributedAt: true, quantityDistributed: true },
  });
  const trendMap = {};
  for (const d of distributions) {
    const day = d.distributedAt.toISOString().slice(0, 10);
    trendMap[day] = (trendMap[day] || 0) + Number(d.quantityDistributed || 0);
  }
  const trends = Object.entries(trendMap).map(([date, qty]) => ({ date, quantity: qty })).sort((a, b) => a.date.localeCompare(b.date));

  const totalQty = Number(totalDistributed._sum.quantityDistributed || 0);

  res.json({
    success: true,
    data: {
      totalDistributed: totalQty,
      completedReservations,
      activeListings,
      sellersCount,
      receiversCount,
      estimatedWasteAvoidedKg: totalQty, // label as estimate in docs
      // The waste-avoided figure is a unit-based estimate (1 unit ~= 1 kg),
      // not a measured weight. Consumers must present it as an estimate.
      estimated: true,
      estimateBasis: 'Quantity in listing units is treated as 1 kg per unit for demonstration purposes.',
      trends,
      categoryStats: categoryStatsOut,
      recentDistributions: recentDistributions.map((d) => ({
        id: d.id,
        quantityDistributed: Number(d.quantityDistributed),
        distributedAt: d.distributedAt,
      })),
    },
  });
});

module.exports = { getStats };
