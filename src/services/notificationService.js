const prisma = require('../lib/prisma');

/**
 * Create a persisted notification and link it to a listing and/or reservation.
 *
 * `client` lets callers pass an existing Prisma transaction client so the
 * notification is written inside the same transaction as the state change it
 * describes (see reservationController). When omitted, the global client is used.
 */
async function createNotification({ userId, type, title, message, listingId, reservationId, client }) {
  const db = client || prisma;
  return db.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      // Scalar foreign keys are used directly (the relation fields are optional
      // and Prisma rejects nested `connect` payloads for optional relations here).
      ...(listingId ? { listingId } : {}),
      ...(reservationId ? { reservationId } : {}),
    },
  });
}

/**
 * Mark a notification as read (only by its owner).
 */
async function markAsRead(notificationId, userId) {
  const notification = await prisma.notification.findUnique({ where: { id: notificationId } });
  if (!notification) return null;
  if (notification.userId !== userId) return null;
  return prisma.notification.update({ where: { id: notificationId }, data: { read: true } });
}

/**
 * List notifications for a user.
 */
async function listForUser(userId, { page = 1, limit = 20, unreadOnly = false } = {}) {
  const where = { userId, ...(unreadOnly ? { read: false } : {}) };
  const [items, total] = await prisma.$transaction([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      include: { listing: { select: { id: true, title: true } }, reservation: { select: { id: true, status: true } } },
    }),
    prisma.notification.count({ where }),
  ]);
  return { items, page: Number(page), limit: Number(limit), total, unreadCount: await prisma.notification.count({ where: { userId, read: false } }) };
}

module.exports = { createNotification, markAsRead, listForUser };
