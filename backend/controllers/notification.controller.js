const Notification = require('../models/notification.model');

// Get My Notifications
exports.getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark as Read
exports.markAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true }
    );
    res.json({ message: 'Notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper to create notification (Internal)
exports.createInternalNotification = async (recipient, title, message, type, link) => {
  try {
    await Notification.create({ recipient, title, message, type, link });
  } catch (error) {
    console.error('Notification Error:', error);
  }
};
