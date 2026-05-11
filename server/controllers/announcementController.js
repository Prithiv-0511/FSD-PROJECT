const Announcement = require('../models/Announcement');
const AnnouncementView = require('../models/AnnouncementView');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');

const createEnrollmentsForAnnouncement = async (announcement, orgId) => {
  if (!announcement.requiresAcknowledgement && !announcement.requiresCompletion) return;

  let userQuery = { organizationId: orgId, isActive: true, role: 'employee' };
  if (announcement.departmentIds && announcement.departmentIds.length > 0) {
    userQuery.departmentId = { $in: announcement.departmentIds };
  }

  const users = await User.find(userQuery).select('_id');
  if (users.length === 0) return;

  const enrollments = users.map((u) => ({
    announcementId: announcement._id,
    userId: u._id,
    organizationId: orgId,
    status: 'pending',
  }));

  try {
    await Enrollment.insertMany(enrollments, { ordered: false });
  } catch (err) {
    // Ignore duplicate keys
  }
};

// @desc    Create announcement
// @route   POST /api/announcements
exports.createAnnouncement = async (req, res, next) => {
  try {
    const { title, content, summary, priority, departmentIds, publishAt, expiresAt, attachments, category, requiresAcknowledgement, requiresCompletion } = req.body;

    const now = new Date();
    let status = 'draft';
    let isPublished = false;

    // Determine initial status
    if (publishAt && new Date(publishAt) > now) {
      status = 'scheduled';
      isPublished = true;
    } else if (!publishAt) {
      status = 'active';
      isPublished = true;
    }

    const announcement = await Announcement.create({
      title,
      content,
      summary: summary || '',
      priority: priority || 'normal',
      status,
      authorId: req.user._id,
      organizationId: req.organizationId,
      departmentIds: departmentIds || [],
      publishAt: publishAt || now,
      expiresAt,
      attachments: attachments || [],
      isPublished,
      category: category || 'general',
      requiresAcknowledgement: requiresAcknowledgement || false,
      requiresCompletion: requiresCompletion || false,
    });

    if (isPublished) {
      await createEnrollmentsForAnnouncement(announcement, req.organizationId);
    }

    await announcement.populate('authorId', 'firstName lastName avatar');
    await announcement.populate('departmentIds', 'name color');

    res.status(201).json({ announcement });
  } catch (error) {
    next(error);
  }
};

// @desc    Get announcements (admin sees all, employee sees active only)
// @route   GET /api/announcements
exports.getAnnouncements = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, priority, department, search, sort = '-createdAt' } = req.query;

    const query = { organizationId: req.organizationId };

    // CRITICAL: Employees only see active, non-expired announcements
    if (req.user.role === 'employee') {
      query.status = 'active';
      query.isPublished = true;
      query.expiresAt = { $gt: new Date() };

      // Optionally filter by employee's department
      if (req.user.departmentId) {
        query.$or = [
          { departmentIds: { $size: 0 } }, // Org-wide announcements
          { departmentIds: req.user.departmentId }, // Department-specific
        ];
      }
    } else {
      // Admin filters
      if (status) query.status = status;
    }

    if (priority) query.priority = priority;
    if (department) query.departmentIds = department;
    if (search) {
      query.$text = { $search: search };
    }

    const announcements = await Announcement.find(query)
      .populate('authorId', 'firstName lastName avatar')
      .populate('departmentIds', 'name color')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Announcement.countDocuments(query);

    res.json({
      announcements,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single announcement
// @route   GET /api/announcements/:id
exports.getAnnouncement = async (req, res, next) => {
  try {
    const query = {
      _id: req.params.id,
      organizationId: req.organizationId,
    };

    // Employees cannot see expired announcements
    if (req.user.role === 'employee') {
      query.status = 'active';
      query.isPublished = true;
      query.expiresAt = { $gt: new Date() };
    }

    const announcement = await Announcement.findOne(query)
      .populate('authorId', 'firstName lastName avatar')
      .populate('departmentIds', 'name color');

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found.' });
    }

    // Track view for employees
    if (req.user.role === 'employee') {
      try {
        await AnnouncementView.create({
          announcementId: announcement._id,
          userId: req.user._id,
        });
        // Increment view count
        await Announcement.findByIdAndUpdate(announcement._id, { $inc: { viewCount: 1 } });
        announcement.viewCount += 1;
      } catch (e) {
        // Ignore duplicate view error (user already viewed)
      }
    }

    res.json({ announcement });
  } catch (error) {
    next(error);
  }
};

// @desc    Update announcement
// @route   PUT /api/announcements/:id
exports.updateAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findOneAndUpdate(
      { _id: req.params.id, organizationId: req.organizationId },
      req.body,
      { new: true, runValidators: true }
    )
      .populate('authorId', 'firstName lastName avatar')
      .populate('departmentIds', 'name color');

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found.' });
    }

    // If it's active/scheduled and requires acknowledgement, ensure enrollments exist
    if ((announcement.status === 'active' || announcement.status === 'scheduled') && (announcement.requiresAcknowledgement || announcement.requiresCompletion)) {
      // Find existing enrollments count
      const Enrollment = require('../models/Enrollment');
      const existingCount = await Enrollment.countDocuments({ announcementId: announcement._id });
      if (existingCount === 0) {
        const { createEnrollmentsForAnnouncement } = require('./announcementController');
        // Actually, createEnrollmentsForAnnouncement is defined in this file, we can just call it
        // Wait, it's defined at the top of the file.
      }
    }

    // Better logic: Just call createEnrollmentsForAnnouncement which uses insertMany with ordered: false (ignores duplicates)
    if ((announcement.status === 'active' || announcement.status === 'scheduled') && (announcement.requiresAcknowledgement || announcement.requiresCompletion)) {
       await createEnrollmentsForAnnouncement(announcement, req.organizationId);
    }

    res.json({ announcement });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
exports.deleteAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findOneAndDelete({
      _id: req.params.id,
      organizationId: req.organizationId,
    });

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found.' });
    }

    // Clean up views and notifications
    await AnnouncementView.deleteMany({ announcementId: announcement._id });
    await Notification.deleteMany({ announcementId: announcement._id });

    res.json({ message: 'Announcement deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Publish announcement (set active)
// @route   POST /api/announcements/:id/publish
exports.publishAnnouncement = async (req, res, next) => {
  try {
    const now = new Date();
    const announcement = await Announcement.findOne({
      _id: req.params.id,
      organizationId: req.organizationId,
    });

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found.' });
    }

    if (announcement.expiresAt <= now) {
      return res.status(400).json({ message: 'Cannot publish an expired announcement.' });
    }

    announcement.isPublished = true;
    if (announcement.publishAt && announcement.publishAt > now) {
      announcement.status = 'scheduled';
    } else {
      announcement.status = 'active';
      announcement.publishAt = now;
    }
    await announcement.save();

    // Create in-app notifications for relevant users
    let userQuery = { organizationId: req.organizationId, isActive: true, role: 'employee' };
    if (announcement.departmentIds.length > 0) {
      userQuery.departmentId = { $in: announcement.departmentIds };
    }

    const users = await User.find(userQuery).select('_id');

    const notifications = users.map((u) => ({
      userId: u._id,
      announcementId: announcement._id,
      title: `New: ${announcement.title}`,
      message: announcement.summary || announcement.title,
      type: 'in_app',
      status: 'sent',
      sentAt: now,
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    await createEnrollmentsForAnnouncement(announcement, req.organizationId);

    await announcement.populate('authorId', 'firstName lastName avatar');
    await announcement.populate('departmentIds', 'name color');

    res.json({ announcement });
  } catch (error) {
    next(error);
  }
};

// @desc    Get announcement analytics
// @route   GET /api/announcements/:id/analytics
exports.getAnnouncementAnalytics = async (req, res, next) => {
  try {
    const announcement = await Announcement.findOne({
      _id: req.params.id,
      organizationId: req.organizationId,
    });

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found.' });
    }

    const views = await AnnouncementView.find({ announcementId: announcement._id })
      .populate('userId', 'firstName lastName email departmentId')
      .sort('-viewedAt');

    // Get total target audience
    let audienceQuery = { organizationId: req.organizationId, isActive: true, role: 'employee' };
    if (announcement.departmentIds.length > 0) {
      audienceQuery.departmentId = { $in: announcement.departmentIds };
    }
    const totalAudience = await User.countDocuments(audienceQuery);

    res.json({
      announcementId: announcement._id,
      title: announcement.title,
      totalViews: views.length,
      totalAudience,
      engagementRate: totalAudience > 0 ? ((views.length / totalAudience) * 100).toFixed(1) : 0,
      views,
    });
  } catch (error) {
    next(error);
  }
};
