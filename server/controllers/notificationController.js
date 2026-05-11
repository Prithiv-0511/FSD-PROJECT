const Notification = require('../models/Notification');

// @desc    Get user's notifications
// @route   GET /api/notifications
exports.getNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = { userId: req.user._id };
    if (status) query.status = status;

    const notifications = await Notification.find(query)
      .populate('announcementId', 'title priority')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
      userId: req.user._id,
      status: { $ne: 'read' },
    });

    res.json({ notifications, unreadCount, pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) } });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { status: 'read', readAt: new Date() },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: 'Notification not found.' });
    res.json({ notification });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all as read
// @route   PUT /api/notifications/read-all
exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, status: { $ne: 'read' } },
      { status: 'read', readAt: new Date() }
    );
    res.json({ message: 'All notifications marked as read.' });
  } catch (error) {
    next(error);
  }
};
