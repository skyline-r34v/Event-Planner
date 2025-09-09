const express = require('express');
const router = express.Router();
const bookmarkController = require('../controllers/bookmarkController');
const auth = require('../middlewares/auth');

// Add bookmark
router.post('/add', auth, bookmarkController.addBookmark);

// List bookmarks (pagination)
router.post('/list', auth, bookmarkController.getBookmarks);

// Soft delete & restore bookmark
router.post('/delete', auth, bookmarkController.softDeleteBookmark);
router.post('/restore', auth, bookmarkController.restoreBookmark);

module.exports = router;
