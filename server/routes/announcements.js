const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const { createAnnouncement, getAnnouncements, getAnnouncement, updateAnnouncement, deleteAnnouncement, publishAnnouncement, getAnnouncementAnalytics } = require('../controllers/announcementController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/rbac');
const tenantScope = require('../middleware/tenantScope');

router.use(authenticate, tenantScope);

const validateAnnouncement = [
  body('title').notEmpty().withMessage('Title is required'),
  body('content').notEmpty().withMessage('Content is required'),
  body('expiresAt').isISO8601().withMessage('Expiry date is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'ValidationError',
        message: errors.array()[0].msg
      });
    }
    next();
  }
];

router.post('/', authorize('admin'), validateAnnouncement, createAnnouncement);
router.get('/', getAnnouncements);
router.get('/:id', getAnnouncement);
router.put('/:id', authorize('admin'), validateAnnouncement, updateAnnouncement);
router.delete('/:id', authorize('admin'), deleteAnnouncement);
router.post('/:id/publish', authorize('admin'), publishAnnouncement);
router.get('/:id/analytics', authorize('admin'), getAnnouncementAnalytics);

module.exports = router;
