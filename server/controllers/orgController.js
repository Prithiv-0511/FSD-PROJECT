const Organization = require('../models/Organization');
const Department = require('../models/Department');

// @desc    Get current organization
// @route   GET /api/org
exports.getOrganization = async (req, res, next) => {
  try {
    const org = await Organization.findById(req.organizationId);
    if (!org) {
      return res.status(404).json({ message: 'Organization not found.' });
    }
    res.json({ organization: org });
  } catch (error) {
    next(error);
  }
};

// @desc    Update organization
// @route   PUT /api/org
exports.updateOrganization = async (req, res, next) => {
  try {
    const { name, industry, logo } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (industry !== undefined) updates.industry = industry;
    if (logo !== undefined) updates.logo = logo;

    const org = await Organization.findByIdAndUpdate(req.organizationId, updates, {
      new: true,
      runValidators: true,
    });

    res.json({ organization: org });
  } catch (error) {
    next(error);
  }
};

// @desc    Create department
// @route   POST /api/org/departments
exports.createDepartment = async (req, res, next) => {
  try {
    const department = await Department.create({
      ...req.body,
      organizationId: req.organizationId,
    });

    res.status(201).json({ department });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all departments
// @route   GET /api/org/departments
exports.getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find({
      organizationId: req.organizationId,
      isActive: true,
    }).sort('name');

    res.json({ departments });
  } catch (error) {
    next(error);
  }
};

// @desc    Update department
// @route   PUT /api/org/departments/:id
exports.updateDepartment = async (req, res, next) => {
  try {
    const department = await Department.findOneAndUpdate(
      { _id: req.params.id, organizationId: req.organizationId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!department) {
      return res.status(404).json({ message: 'Department not found.' });
    }

    res.json({ department });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete department
// @route   DELETE /api/org/departments/:id
exports.deleteDepartment = async (req, res, next) => {
  try {
    const department = await Department.findOneAndUpdate(
      { _id: req.params.id, organizationId: req.organizationId },
      { isActive: false },
      { new: true }
    );

    if (!department) {
      return res.status(404).json({ message: 'Department not found.' });
    }

    res.json({ message: 'Department deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
