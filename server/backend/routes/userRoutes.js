const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middlewares/auth');
const roleCheck = require('../middlewares/role');

// Auth
router.post('/register', userController.register);
router.post('/login', userController.login);

// Admin only: fetch all users with pagination
router.post('/list', auth, roleCheck(['admin']), userController.getUsers);

// Soft delete & restore user
router.post('/delete', auth, roleCheck(['admin']), userController.softDeleteUser);
router.post('/restore', auth, roleCheck(['admin']), userController.restoreUser);

module.exports = router;
