const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Invite (create) a new employee
// @route   POST /api/users/invite
exports.inviteUser = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, role, departmentId } = req.body;
    const orgId = req.organizationId;

    // Check if email exists in this org
    const exists = await User.findOne({ email, organizationId: orgId });
    if (exists) {
      return res.status(400).json({ message: 'User with this email already exists in your organization.' });
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: role || 'employee',
      organizationId: orgId,
      departmentId: departmentId || null,
    });

    // Create welcome notification
    await Notification.create({
      userId: user._id,
      title: 'Welcome to AnnounceHub!',
      message: `Welcome to ${org.name}. You can now view announcements from your organization.`,
      type: 'in_app',
      status: 'sent',
      sentAt: new Date(),
    });

    res.status(201).json({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        department: user.departmentId,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users in organization
// @route   GET /api/users
exports.getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, search, department } = req.query;
    const query = { organizationId: req.organizationId };

    if (role) query.role = role;
    if (department) query.departmentId = department;
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query)
      .populate('departmentId', 'name color')
      .select('-refreshToken')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      users,
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

// @desc    Update user role
// @route   PUT /api/users/:id/role
exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, organizationId: req.organizationId },
      { role },
      { new: true, runValidators: true }
    ).populate('departmentId', 'name color');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

// @desc    Deactivate user
// @route   DELETE /api/users/:id
exports.deactivateUser = async (req, res, next) => {
  try {
    // Prevent self-deactivation
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot deactivate yourself.' });
    }

    const user = await User.findOneAndUpdate(
      { _id: req.params.id, organizationId: req.organizationId },
      { isActive: false, refreshToken: null },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({ message: 'User deactivated successfully.', user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, avatar } = req.body;
    const updates = {};
    if (firstName) updates.firstName = firstName;
    if (lastName) updates.lastName = lastName;
    if (avatar !== undefined) updates.avatar = avatar;

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).populate('departmentId', 'name color');

    res.json({ user });
  } catch (error) {
    next(error);
  }
};
