const router = require('express').Router();
const { getDashboardStats, getDepartmentStats } = require('../controllers/analyticsController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/rbac');
const tenantScope = require('../middleware/tenantScope');

router.use(authenticate, tenantScope, authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/departments', getDepartmentStats);

module.exports = router;
