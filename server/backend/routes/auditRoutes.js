const express = require('express');
const router = express.Router();
const auditLogController = require('../controllers/auditController');
const auth = require('../middlewares/auth');
const roleCheck = require('../middlewares/role');

// Admin only: view logs
router.post('/list', auth, roleCheck(['admin']), auditLogController.getLogs);

module.exports = router;
