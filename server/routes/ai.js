const router = require('express').Router();
const { summarize, suggestTitle, categorize } = require('../controllers/aiController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/rbac');

router.use(authenticate, authorize('admin'));

router.post('/summarize', summarize);
router.post('/suggest-title', suggestTitle);
router.post('/categorize', categorize);

module.exports = router;
