const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth.middleware');
const authorizeRoles = require('../middleware/role.middleware');
const {
	getMyNotifications,
	markAsRead,
	createNotification,
} = require('../controllers/notification.controller');

router.get('/', protect, getMyNotifications);
router.put('/mark-read', protect, markAsRead);
router.put('/:id/read', protect, markAsRead);
router.post('/', protect, authorizeRoles('admin'), createNotification);

module.exports = router;
