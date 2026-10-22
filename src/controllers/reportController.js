const prisma = require('../lib/prisma');
const { validationResult } = require('express-validator');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');

/**
 * POST /api/v1/reports — report a suspicious/unsafe listing
 */
const createReport = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw Object.assign(new Error('Validation failed'), { statusCode: 400, errors: errors.array() });
  }

  const { listingId, reason, description } = req.body;
  const listing = await prisma.foodListing.findUnique({ where: { id: listingId } });
  if (!listing) throw new ApiError('Listing not found', 404, 'NOT_FOUND');

  const report = await prisma.report.create({
    data: {
      reason,
      description: description || null,
      listing: { connect: { id: listingId } },
      reporter: { connect: { id: req.user.id } },
    },
    include: { listing: { select: { id: true, title: true } }, reporter: { select: { id: true, name: true } } },
  });

  res.status(201).json({ success: true, message: 'Report submitted', data: { report } });
});

/**
 * GET /api/v1/reports — my reports (receiver) or all (admin handled in adminController)
 */
const getMyReports = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const [items, total] = await prisma.$transaction([
    prisma.report.findMany({
      where: { reporterId: req.user.id },
      include: { listing: { select: { id: true, title: true, status: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    }),
    prisma.report.count({ where: { reporterId: req.user.id } }),
  ]);
  res.json({ success: true, data: { reports: items, page: Number(page), limit: Number(limit), total } });
});

module.exports = { createReport, getMyReports };
