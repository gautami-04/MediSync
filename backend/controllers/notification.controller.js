const Notification = require('../models/notification.model');

exports.getMyNotifications = async (req, res) => {
	try {
		const notifications = await Notification.find({ recipient: req.user._id })
			.sort({ createdAt: -1 })
			.limit(50);
		res.json(notifications);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

exports.markAsRead = async (req, res) => {
	try {
		const { id } = req.params;
		if (id) {
			const notification = await Notification.findOneAndUpdate(
				{ _id: id, recipient: req.user._id },
				{ isRead: true },
				{ new: true }
			);
			return res.json(notification);
		}

		await Notification.updateMany({ recipient: req.user._id }, { isRead: true });
		res.json({ message: 'All notifications marked as read' });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

exports.createNotification = async (req, res) => {
	try {
		const { recipient, type, title, message, data, link } = req.body;
		const notification = await Notification.create({
			recipient,
			type,
			title,
			message,
			data,
			link,
		});
		res.status(201).json(notification);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
