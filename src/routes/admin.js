const express = require('express');
const router = express.Router();
const {
  getAdminStats, getUsers, setUserStatus, getListings, moderateListing,
  getReports, updateReport, getAuditLogs,
} = require('../controllers/adminController');
const { requireAuth, requireRole } = require('../middleware/auth');
const { csrfProtection } = require('../middleware/csrf');
const { adminUserStatusRules } = require('../validators/userValidator');

// All admin routes require ADMIN role
router.use(requireAuth, requireRole('ADMIN'));

router.get('/stats', getAdminStats);
router.get('/users', getUsers);
router.patch('/users/:id/status', csrfProtection, adminUserStatusRules, setUserStatus);
router.get('/listings', getListings);
router.patch('/listings/:id/moderate', csrfProtection, moderateListing);
router.get('/reports', getReports);
router.patch('/reports/:id', csrfProtection, updateReport);
router.get('/audit-logs', getAuditLogs);

module.exports = router;
