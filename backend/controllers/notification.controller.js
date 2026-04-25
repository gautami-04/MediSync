const Notification = require('../models/notification.model');

// Get My Notifications
const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark as Read (Individual or Bulk)
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    if (id === 'all') {
      await Notification.updateMany(
        { recipient: req.user._id, isRead: false },
        { isRead: true }
      );
      return res.json({ message: 'All notifications marked as read' });
    }

    const notification = await Notification.findById(id);
    if (!notification) return res.status(404).json({ message: 'Notification not found' });

    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    notification.isRead = true;
    await notification.save();
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a notification (system/admin use)
const createNotification = async (req, res) => {
  try {
    const { recipient, type, title, message, data, link } = req.body;

    if (!recipient) {
      return res.status(400).json({ message: 'Recipient is required' });
    }

    const notification = await Notification.create({ recipient, type, title, message, data, link });
    return res.status(201).json(notification);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Internal helper
const createInternalNotification = async (recipient, title, message, type, link, data) => {
  try {
    await Notification.create({ recipient, title, message, type, link, data });
  } catch (error) {
    console.error('Notification Error:', error);
  }
};

module.exports = {
  createNotification,
  getMyNotifications,
  markAsRead,
  createInternalNotification
};
