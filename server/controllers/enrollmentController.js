const Enrollment = require('../models/Enrollment');
const Announcement = require('../models/Announcement');
const User = require('../models/User');

// @desc    Update enrollment status (mark as acknowledged or completed)
// @route   POST /api/enrollments/:announcementId
exports.updateEnrollmentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const { announcementId } = req.params;

    if (!['acknowledged', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const enrollment = await Enrollment.findOneAndUpdate(
      {
        announcementId,
        userId: req.user._id,
        organizationId: req.organizationId
      },
      { status },
      { new: true, runValidators: true }
    );

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found.' });
    }

    res.json({ enrollment });
  } catch (error) {
    next(error);
  }
};

// @desc    Get enrollment statuses for an announcement (admin only)
// @route   GET /api/enrollments/:announcementId
exports.getAnnouncementEnrollments = async (req, res, next) => {
  try {
    const { announcementId } = req.params;

    // Verify announcement exists and belongs to org
    const announcement = await Announcement.findOne({
      _id: announcementId,
      organizationId: req.organizationId
    });

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found.' });
    }

    const enrollments = await Enrollment.find({
      announcementId,
      organizationId: req.organizationId
    })
      .populate('userId', 'firstName lastName email departmentId avatar')
      .sort('-updatedAt');

    res.json({ enrollments });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's enrollment for an announcement
// @route   GET /api/enrollments/:announcementId/me
exports.getMyEnrollment = async (req, res, next) => {
  try {
    const { announcementId } = req.params;

    const enrollment = await Enrollment.findOne({
      announcementId,
      userId: req.user._id,
      organizationId: req.organizationId
    });

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found.' });
    }

    res.json({ enrollment });
  } catch (error) {
    next(error);
  }
};
