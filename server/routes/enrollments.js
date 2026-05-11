const router = require('express').Router();
const { updateEnrollmentStatus, getAnnouncementEnrollments, getMyEnrollment } = require('../controllers/enrollmentController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/rbac');
const tenantScope = require('../middleware/tenantScope');

router.use(authenticate, tenantScope);

router.get('/:announcementId/me', getMyEnrollment);
router.post('/:announcementId', updateEnrollmentStatus);
router.get('/:announcementId', authorize('admin'), getAnnouncementEnrollments);

module.exports = router;
