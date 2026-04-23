const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth.middleware');
const { createNotification, getMyNotifications, markAsRead } = require('../controllers/notification.controller');

router.post('/', protect, createNotification);
router.get('/', protect, getMyNotifications);
router.get('/my', protect, getMyNotifications);
router.put('/mark-read', protect, markAsRead);
router.put('/:id/read', protect, markAsRead);
router.patch('/:id/read', protect, markAsRead);

module.exports = router;
