const Announcement = require('../models/Announcement');
const AnnouncementView = require('../models/AnnouncementView');
const User = require('../models/User');

// @desc    Get dashboard analytics
// @route   GET /api/analytics/dashboard
exports.getDashboardStats = async (req, res, next) => {
  try {
    const orgId = req.organizationId;
    const now = new Date();

    const [totalAnnouncements, activeAnnouncements, expiredAnnouncements, scheduledAnnouncements, totalUsers, totalViews] = await Promise.all([
      Announcement.countDocuments({ organizationId: orgId }),
      Announcement.countDocuments({ organizationId: orgId, status: 'active', expiresAt: { $gt: now } }),
      Announcement.countDocuments({ organizationId: orgId, status: 'expired' }),
      Announcement.countDocuments({ organizationId: orgId, status: 'scheduled' }),
      User.countDocuments({ organizationId: orgId, isActive: true }),
      AnnouncementView.countDocuments(),
    ]);

    // Recent announcements
    const recentAnnouncements = await Announcement.find({ organizationId: orgId })
      .populate('authorId', 'firstName lastName')
      .sort('-createdAt')
      .limit(5);

    // Top viewed announcements
    const topViewed = await Announcement.find({ organizationId: orgId })
      .sort('-viewCount')
      .limit(5)
      .select('title viewCount priority status');

    res.json({
      stats: { totalAnnouncements, activeAnnouncements, expiredAnnouncements, scheduledAnnouncements, totalUsers, totalViews },
      recentAnnouncements,
      topViewed,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get department analytics
// @route   GET /api/analytics/departments
exports.getDepartmentStats = async (req, res, next) => {
  try {
    const orgId = req.organizationId;
    const stats = await Announcement.aggregate([
      { $match: { organizationId: orgId } },
      { $unwind: { path: '$departmentIds', preserveNullAndEmptyArrays: true } },
      { $group: { _id: '$departmentIds', count: { $sum: 1 }, totalViews: { $sum: '$viewCount' } } },
      { $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'department' } },
      { $unwind: { path: '$department', preserveNullAndEmptyArrays: true } },
      { $project: { departmentName: { $ifNull: ['$department.name', 'Organization-wide'] }, count: 1, totalViews: 1 } },
      { $sort: { count: -1 } },
    ]);
    res.json({ departmentStats: stats });
  } catch (error) {
    next(error);
  }
};
