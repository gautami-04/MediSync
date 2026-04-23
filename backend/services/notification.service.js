const Notification = require('../models/notification.model');

const createNotification = async ({ recipient, type, title, message, data }) => {
  try {
    const notification = await Notification.create({
      recipient,
      type,
      title,
      message,
      data
    });
    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error);
    throw error;
  }
};

module.exports = {
  createNotification
};
