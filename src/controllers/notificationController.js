const { validationResult } = require('express-validator');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');
const { markAsRead, listForUser } = require('../services/notificationService');
const prisma = require('../lib/prisma');

/**
 * GET /api/v1/notifications — list current user's notifications
 */
const listNotifications = asyncHandler(async (req, res) => {
  const { page, limit, unreadOnly } = req.query;
  const data = await listForUser(req.user.id, {
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 20,
    unreadOnly: unreadOnly === 'true',
  });
  res.json({ success: true, data });
});

/**
 * PATCH /api/v1/notifications/:id/read — mark a notification as read
 */
const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await markAsRead(req.params.id, req.user.id);
  if (!notification) throw new ApiError('Notification not found', 404, 'NOT_FOUND');
  res.json({ success: true, message: 'Marked as read', data: { notification } });
});

/**
 * PATCH /api/v1/notifications/read-all — mark all as read
 */
const markAllRead = asyncHandler(async (req, res) => {
  await prisma.notification.updateMany({
    where: { userId: req.user.id, read: false },
    data: { read: true },
  });
  res.json({ success: true, message: 'All notifications marked as read' });
});

module.exports = { listNotifications, markNotificationRead, markAllRead };
