const router = require('express').Router();
const { getOrganization, updateOrganization, createDepartment, getDepartments, updateDepartment, deleteDepartment } = require('../controllers/orgController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/rbac');
const tenantScope = require('../middleware/tenantScope');

router.use(authenticate, tenantScope);

router.get('/', getOrganization);
router.put('/', authorize('admin'), updateOrganization);
router.post('/departments', authorize('admin'), createDepartment);
router.get('/departments', getDepartments);
router.put('/departments/:id', authorize('admin'), updateDepartment);
router.delete('/departments/:id', authorize('admin'), deleteDepartment);

module.exports = router;
