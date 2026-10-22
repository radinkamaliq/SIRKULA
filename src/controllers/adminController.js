const prisma = require('../lib/prisma');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');

/**
 * GET /api/v1/admin/stats — platform stats for admin
 */
const getAdminStats = asyncHandler(async (_req, res) => {
  const [users, listings, reservations, reports] = await prisma.$transaction([
    prisma.user.groupBy({ by: ['role'], _count: { id: true } }),
    prisma.foodListing.groupBy({ by: ['status'], _count: { id: true } }),
    prisma.reservation.groupBy({ by: ['status'], _count: { id: true } }),
    prisma.report.count(),
  ]);
  res.json({ success: true, data: { users, listings, reservations, reports } });
});

/**
 * GET /api/v1/admin/users — manage users (with optional status filter)
 */
const getUsers = asyncHandler(async (req, res) => {
  const { role, status, page = 1, limit = 20 } = req.query;
  const where = {};
  if (role) where.role = role;
  if (status) where.status = status;
  const [items, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      select: { id: true, email: true, name: true, phone: true, address: true, role: true, status: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    }),
    prisma.user.count({ where }),
  ]);
  res.json({ success: true, data: { users: items, page: Number(page), limit: Number(limit), total } });
});

/**
 * PATCH /api/v1/admin/users/:id — suspend or reactivate an account
 */
const setUserStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['ACTIVE', 'SUSPENDED'].includes(status)) {
    throw new ApiError('Status must be ACTIVE or SUSPENDED', 400, 'INVALID_STATUS');
  }
  if (req.params.id === req.user.id) {
    throw new ApiError('You cannot change your own account status', 400, 'SELF_MODIFY');
  }
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) throw new ApiError('User not found', 404, 'NOT_FOUND');

  const updated = await prisma.user.update({
    where: { id: req.params.id },
    data: { status },
    select: { id: true, email: true, name: true, role: true, status: true },
  });

  await prisma.auditLog.create({
    data: {
      action: `USER_${status}`,
      targetType: 'User',
      targetId: user.id,
      details: `Account ${status.toLowerCase()} by admin`,
      adminId: req.user.id,
    },
  });

  res.json({ success: true, message: `User ${status.toLowerCase()}`, data: { user: updated } });
});

/**
 * GET /api/v1/admin/listings — all listings for moderation
 */
const getListings = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const where = {};
  if (status) where.status = status;
  const [items, total] = await prisma.$transaction([
    prisma.foodListing.findMany({
      where,
      include: { seller: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    }),
    prisma.foodListing.count({ where }),
  ]);
  res.json({ success: true, data: { listings: items, page: Number(page), limit: Number(limit), total } });
});

/**
 * PATCH /api/v1/admin/listings/:id/moderate — moderator sets listing status
 */
const moderateListing = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['AVAILABLE', 'RESERVED', 'UNAVAILABLE', 'EXPIRED'].includes(status)) {
    throw new ApiError('Invalid listing status', 400, 'INVALID_STATUS');
  }
  const listing = await prisma.foodListing.findUnique({ where: { id: req.params.id } });
  if (!listing) throw new ApiError('Listing not found', 404, 'NOT_FOUND');

  const updated = await prisma.foodListing.update({
    where: { id: req.params.id },
    data: { status },
    include: { seller: { select: { id: true, name: true } } },
  });

  await prisma.auditLog.create({
    data: {
      action: 'MODERATE_LISTING',
      targetType: 'FoodListing',
      targetId: listing.id,
      details: `Listing status set to ${status} by admin`,
      adminId: req.user.id,
    },
  });

  res.json({ success: true, message: 'Listing moderated', data: { listing: updated } });
});

/**
 * GET /api/v1/admin/reports — list reports
 */
const getReports = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const where = {};
  if (status) where.status = status;
  const [items, total] = await prisma.$transaction([
    prisma.report.findMany({
      where,
      include: {
        listing: { select: { id: true, title: true } },
        reporter: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    }),
    prisma.report.count({ where }),
  ]);
  res.json({ success: true, data: { reports: items, page: Number(page), limit: Number(limit), total } });
});

/**
 * PATCH /api/v1/admin/reports/:id — resolve/dismiss a report
 */
const updateReport = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['PENDING', 'REVIEWED', 'RESOLVED', 'DISMISSED'].includes(status)) {
    throw new ApiError('Invalid report status', 400, 'INVALID_STATUS');
  }
  const report = await prisma.report.findUnique({ where: { id: req.params.id } });
  if (!report) throw new ApiError('Report not found', 404, 'NOT_FOUND');

  const updated = await prisma.report.update({
    where: { id: req.params.id },
    data: { status },
    include: { listing: { select: { id: true, title: true } }, reporter: { select: { id: true, name: true } } },
  });

  await prisma.auditLog.create({
    data: {
      action: 'UPDATE_REPORT',
      targetType: 'Report',
      targetId: report.id,
      details: `Report status set to ${status} by admin`,
      adminId: req.user.id,
    },
  });

  res.json({ success: true, message: 'Report updated', data: { report: updated } });
});

/**
 * GET /api/v1/admin/audit-logs — audit log of admin actions
 */
const getAuditLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const [items, total] = await prisma.$transaction([
    prisma.auditLog.findMany({
      include: { admin: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    }),
    prisma.auditLog.count(),
  ]);
  res.json({ success: true, data: { auditLogs: items, page: Number(page), limit: Number(limit), total } });
});

module.exports = {
  getAdminStats,
  getUsers,
  setUserStatus,
  getListings,
  moderateListing,
  getReports,
  updateReport,
  getAuditLogs,
};
