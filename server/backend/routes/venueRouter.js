const express = require('express');
const router = express.Router();
const venueController = require('../controllers/venueController');
const auth = require('../middlewares/auth');
const roleCheck = require('../middlewares/role');

// Create venue (admin only)
router.post('/create', auth, roleCheck(['admin']), venueController.createVenue);

// Get venues (with pagination & search filters)
router.post('/list', auth, venueController.getVenues);

// Update venue (admin only)
router.post('/update', auth, roleCheck(['admin']), venueController.updateVenue);

// Soft delete & restore venue
router.post('/delete', auth, roleCheck(['admin']), venueController.softDeleteVenue);
router.post('/restore', auth, roleCheck(['admin']), venueController.restoreVenue);

module.exports = router;
