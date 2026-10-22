const prisma = require('../lib/prisma');
const { validationResult } = require('express-validator');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');
const { unlinkSync } = require('fs');
const { join } = require('path');
const { Decimal } = require('@prisma/client');

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
    pickupLocation: l.pickupLocation,
    pickupLat: l.pickupLat ? Number(l.pickupLat) : null,
    pickupLng: l.pickupLng ? Number(l.pickupLng) : null,
    pickupDeadline: l.pickupDeadline,
    images: l.images || [],
    status: l.status,
    createdAt: l.createdAt,
    updatedAt: l.updatedAt,
  };
}

function toDecimal(value) {
  return value ? new Decimal(value) : null;
}

/**
 * POST /api/v1/listings  (Seller) — create listing
 */
const createListing = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw Object.assign(new Error('Validation failed'), {
      statusCode: 400,
      errors: errors.array(),
    });
  }

  const {
    title, description, category, quantity, unit, condition,
    price, pickupLocation, pickupLat, pickupLng, pickupDeadline,
  } = req.body;

  const images = req.file ? [req.file.filename] : (req.body.images ? JSON.parse(req.body.images) : []);

  const listing = await prisma.foodListing.create({
    data: {
      title,
      description,
      category,
      quantity: toDecimal(quantity),
      unit,
      condition,
      price: toDecimal(price),
      pickupLocation,
      pickupLat: toDecimal(pickupLat),
      pickupLng: toDecimal(pickupLng),
      pickupDeadline: new Date(pickupDeadline),
      images,
      availableQuantity: toDecimal(quantity),
      status: 'AVAILABLE',
      seller: { connect: { id: req.user.id } },
    },
  });

  res.status(201).json({ success: true, message: 'Listing created', data: listingResponse(listing) });
});

/**
 * GET /api/v1/listings/:id — public detail view
 */
const getListing = asyncHandler(async (req, res) => {
  const listing = await prisma.foodListing.findUnique({
    where: { id: req.params.id },
    include: {
      seller: { select: { id: true, name: true, role: true } },
    },
  });
  if (!listing) throw new ApiError('Listing not found', 404, 'NOT_FOUND');

  res.json({ success: true, data: listingResponse(listing) });
});

/**
 * GET /api/v1/listings — seller's own listings (with filters)
 */
const getMyListings = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const where = { sellerId: req.user.id, ...(status ? { status } : {}) };

  const [listings, total] = await prisma.$transaction([
    prisma.foodListing.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    }),
    prisma.foodListing.count({ where }),
  ]);

  res.json({
    success: true,
    data: { listings: listings.map(listingResponse), page: Number(page), limit: Number(limit), total },
  });
});

/**
 * PATCH /api/v1/listings/:id — seller edits own listing
 */
const updateListing = asyncHandler(async (req, res) => {
  const listing = await prisma.foodListing.findUnique({ where: { id: req.params.id } });
  if (!listing) throw new ApiError('Listing not found', 404, 'NOT_FOUND');
  if (listing.sellerId !== req.user.id) throw new ApiError('Not your listing', 403, 'FORBIDDEN');

  const data = { ...req.body };
  if (data.quantity !== undefined) data.quantity = toDecimal(data.quantity);
  if (data.price !== undefined) data.price = toDecimal(data.price);
  if (data.pickupLat !== undefined) data.pickupLat = toDecimal(data.pickupLat);
  if (data.pickupLng !== undefined) data.pickupLng = toDecimal(data.pickupLng);
  if (data.pickupDeadline) data.pickupDeadline = new Date(data.pickupDeadline);
  if (data.images && typeof data.images === 'string') data.images = JSON.parse(data.images);

  // Keep available inventory consistent when the total quantity changes:
  // the delta between the new total and the old total is added to (or
  // removed from) what is still available, never below zero.
  if (data.quantity !== undefined) {
    const newTotal = Number(data.quantity);
    const oldTotal = Number(listing.quantity);
    const newAvailable = Number(listing.availableQuantity) + (newTotal - oldTotal);
    data.availableQuantity = toDecimal(Math.max(0, newAvailable));
  }

  const updated = await prisma.foodListing.update({ where: { id: req.params.id }, data });
  res.json({ success: true, message: 'Listing updated', data: listingResponse(updated) });
});

/**
 * DELETE /api/v1/listings/:id — seller deletes own listing
 */
const deleteListing = asyncHandler(async (req, res) => {
  const listing = await prisma.foodListing.findUnique({ where: { id: req.params.id } });
  if (!listing) throw new ApiError('Listing not found', 404, 'NOT_FOUND');
  if (listing.sellerId !== req.user.id) throw new ApiError('Not your listing', 403, 'FORBIDDEN');

  const activeCount = await prisma.reservation.count({
    where: { listingId: req.params.id, status: { in: ['PENDING', 'APPROVED'] } },
  });
  if (activeCount > 0) {
    throw new ApiError('Cannot delete listing with active reservations', 400, 'ACTIVE_RESERVATIONS');
  }

  for (const img of listing.images || []) {
    try { unlinkSync(join(process.env.UPLOAD_DIR || 'public/uploads', img)); } catch (_) {}
  }

  await prisma.foodListing.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: 'Listing deleted' });
});

/**
 * POST /api/v1/listings/:id/archive — set status UNAVAILABLE
 */
const archiveListing = asyncHandler(async (req, res) => {
  const listing = await prisma.foodListing.findUnique({ where: { id: req.params.id } });
  if (!listing) throw new ApiError('Listing not found', 404, 'NOT_FOUND');
  if (listing.sellerId !== req.user.id) throw new ApiError('Not your listing', 403, 'FORBIDDEN');

  const updated = await prisma.foodListing.update({
    where: { id: req.params.id },
    data: { status: 'UNAVAILABLE' },
  });
  res.json({ success: true, message: 'Listing archived', data: listingResponse(updated) });
});

module.exports = {
  createListing,
  getListing,
  getMyListings,
  updateListing,
  deleteListing,
  archiveListing,
  listingResponse,
};

