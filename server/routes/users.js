const router = require('express').Router();
const { inviteUser, getUsers, updateUserRole, deactivateUser, updateProfile } = require('../controllers/userController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/rbac');
const tenantScope = require('../middleware/tenantScope');

router.use(authenticate, tenantScope);

router.post('/invite', authorize('admin'), inviteUser);
router.get('/', authorize('admin'), getUsers);
router.put('/profile', updateProfile);
router.put('/:id/role', authorize('admin'), updateUserRole);
router.delete('/:id', authorize('admin'), deactivateUser);

module.exports = router;
