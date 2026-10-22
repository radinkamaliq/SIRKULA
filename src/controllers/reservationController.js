const prisma = require('../lib/prisma');
const { validationResult } = require('express-validator');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');

function reservationResponse(r) {
  return {
    id: r.id,
    listingId: r.listingId,
    receiverId: r.receiverId,
    quantity: r.quantity ? Number(r.quantity) : 0,
    status: r.status,
    notes: r.notes,
    pickupInstructions: r.pickupInstructions,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

function canTransition(from, to) {
  const allowed = {
    PENDING: ['APPROVED', 'REJECTED', 'CANCELLED'],
    APPROVED: ['COMPLETED', 'CANCELLED'],
    REJECTED: [],
    CANCELLED: [],
    COMPLETED: [],
  };
  return (allowed[from] || []).includes(to);
}

/**
 * POST /api/v1/reservations — Receiver requests a quantity
 */
const createReservation = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw Object.assign(new Error('Validation failed'), {
      statusCode: 400,
      errors: errors.array(),
    });
  }

  const { listingId, quantity, notes } = req.body;
  const receiverId = req.user.id;
  const qty = Number(quantity);

  const listing = await prisma.foodListing.findUnique({ where: { id: listingId } });
  if (!listing) throw new ApiError('Listing not found', 404, 'NOT_FOUND');
  if (listing.status !== 'AVAILABLE') throw new ApiError('Listing is not available', 400, 'NOT_AVAILABLE');
  if (listing.sellerId === receiverId) throw new ApiError('Cannot reserve your own listing', 400, 'OWN_LISTING');

  const existing = await prisma.reservation.findFirst({
    where: { listingId, receiverId, status: { in: ['PENDING', 'APPROVED'] } },
  });
  if (existing) {
    throw new ApiError('You already have an active reservation for this listing', 409, 'DUPLICATE_RESERVATION');
  }

  if (qty > Number(listing.availableQuantity || 0)) {
    throw new ApiError('Requested quantity exceeds available inventory', 400, 'INSUFFICIENT_INVENTORY');
  }

  const Decimal = require('@prisma/client').Decimal;
  const reservation = await prisma.reservation.create({
    data: {
      quantity: new Decimal(qty),
      status: 'PENDING',
      notes: notes || null,
      listing: { connect: { id: listingId } },
      receiver: { connect: { id: receiverId } },
    },
    include: { listing: { select: { title: true, sellerId: true, unit: true } } },
  });

  res.status(201).json({ success: true, message: 'Reservation request created', data: reservationResponse(reservation) });
});

/**
 * GET /api/v1/reservations — list reservations (role-scoped)
 */
const getMyReservations = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const where = {};

  if (req.user.role === 'SELLER') {
    where.listing = { sellerId: req.user.id };
  } else if (req.user.role === 'RECEIVER') {
    where.receiverId = req.user.id;
  }
  if (status) where.status = status;

  const [reservations, total] = await prisma.$transaction([
    prisma.reservation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      include: {
        listing: { select: { id: true, title: true, status: true, pickupLocation: true, pickupDeadline: true, sellerId: true } },
        receiver: { select: { id: true, name: true } },
      },
    }),
    prisma.reservation.count({ where }),
  ]);

  res.json({
    success: true,
    data: { reservations: reservations.map(reservationResponse), page: Number(page), limit: Number(limit), total },
  });
});

const { createNotification } = require('../services/notificationService');

/**
 * PATCH /api/v1/reservations/:id — Seller approves or rejects a pending request
 */
const updateReservation = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw Object.assign(new Error('Validation failed'), {
      statusCode: 400,
      errors: errors.array(),
    });
  }

  const { status, pickupInstructions } = req.body;
  const reservationId = req.params.id;

  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: { listing: true, receiver: true },
  });
  if (!reservation) throw new ApiError('Reservation not found', 404, 'NOT_FOUND');
  if (req.user.role !== 'SELLER' || reservation.listing.sellerId !== req.user.id) {
    throw new ApiError('Only the listing seller can approve/reject', 403, 'FORBIDDEN');
  }
  if (reservation.status !== 'PENDING') {
    throw new ApiError('Only pending reservations can be approved or rejected', 400, 'NOT_PENDING');
  }
  if (!canTransition(reservation.status, status)) {
    throw new ApiError(`Cannot transition ${reservation.status} to ${status}`, 400, 'INVALID_TRANSITION');
  }

  await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT * FROM "FoodListing" WHERE id = ${reservation.listingId} FOR UPDATE`;
    const current = await tx.foodListing.findUnique({ where: { id: reservation.listingId } });
    const committed = await tx.reservation.aggregate({
      where: { listingId: reservation.listingId, status: { in: ['APPROVED', 'COMPLETED'] } },
      _sum: { quantity: true },
    });
    const available = Number(current.availableQuantity || 0);

    if (status === 'APPROVED') {
      if (available < reservation.quantity) {
        throw Object.assign(new ApiError('Insufficient inventory to approve', 400, 'INSUFFICIENT_INVENTORY'), { statusCode: 400 });
      }
      await tx.foodListing.update({
        where: { id: reservation.listingId },
        data: { availableQuantity: new (require('@prisma/client').Decimal)(available - reservation.quantity) },
      });
    }
    await tx.reservation.update({
      where: { id: reservationId },
      data: { status, ...(status === 'APPROVED' && pickupInstructions ? { pickupInstructions } : {}) },
    });

    if (status === 'APPROVED') {
      await createNotification({ userId: reservation.receiverId, type: 'RESERVATION_APPROVED', title: 'Reservation Approved', message: `Your request for "${reservation.listing.title}" was approved.`, listingId: reservation.listingId, reservationId, client: tx });
    } else if (status === 'REJECTED') {
      await createNotification({ userId: reservation.receiverId, type: 'RESERVATION_REJECTED', title: 'Reservation Rejected', message: `Your request for "${reservation.listing.title}" was rejected.`, listingId: reservation.listingId, reservationId, client: tx });
    }
  });

  const updated = await prisma.reservation.findUnique({ where: { id: reservationId } });
  res.json({ success: true, message: `Reservation ${status.toLowerCase()}`, data: reservationResponse(updated) });
});

/**
 * DELETE /api/v1/reservations/:id — Receiver cancels a pending reservation
 */
const cancelReservation = asyncHandler(async (req, res) => {
  const reservation = await prisma.reservation.findUnique({
    where: { id: req.params.id },
    include: { listing: true, receiver: true },
  });
  if (!reservation) throw new ApiError('Reservation not found', 404, 'NOT_FOUND');
  if (reservation.receiverId !== req.user.id) throw new ApiError('Not your reservation', 403, 'FORBIDDEN');
  if (reservation.status !== 'PENDING') {
    throw new ApiError('Only pending reservations can be cancelled', 400, 'NOT_PENDING');
  }

  await prisma.$transaction(async (tx) => {
    await tx.reservation.update({ where: { id: req.params.id }, data: { status: 'CANCELLED' } });
    await createNotification({ userId: reservation.listing.sellerId, type: 'RESERVATION_CANCELLED', title: 'Reservation Cancelled', message: `${reservation.receiver.name} cancelled their request for "${reservation.listing.title}".`, listingId: reservation.listingId, reservationId: reservation.id, client: tx });
  });

  res.json({ success: true, message: 'Reservation cancelled' });
});

/**
 * POST /api/v1/reservations/:id/complete — Seller records pickup completion
 */
const completeReservation = asyncHandler(async (req, res) => {
  const reservation = await prisma.reservation.findUnique({
    where: { id: req.params.id },
    include: { listing: true, receiver: true },
  });
  if (!reservation) throw new ApiError('Reservation not found', 404, 'NOT_FOUND');
  if (req.user.role !== 'SELLER' || reservation.listing.sellerId !== req.user.id) {
    throw new ApiError('Only the listing seller can complete a pickup', 403, 'FORBIDDEN');
  }
  if (reservation.status !== 'APPROVED') {
    throw new ApiError('Only approved reservations can be completed', 400, 'NOT_APPROVED');
  }

  await prisma.$transaction(async (tx) => {
    await tx.reservation.update({ where: { id: req.params.id }, data: { status: 'COMPLETED' } });
    await tx.distributionRecord.create({
      data: { quantityDistributed: reservation.quantity, notes: 'Pickup completed', reservation: { connect: { id: req.params.id } } },
    });
    await createNotification({ userId: reservation.receiverId, type: 'RESERVATION_COMPLETED', title: 'Pickup Completed', message: `Your pickup of "${reservation.listing.title}" is marked complete.`, listingId: reservation.listingId, reservationId: reservation.id, client: tx });
  });

  res.json({ success: true, message: 'Pickup marked complete' });
});

module.exports = {
  createReservation,
  getMyReservations,
  updateReservation,
  cancelReservation,
  completeReservation,
  reservationResponse,
  canTransition,
};

