const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const verifyFirebaseToken = require('../middleware/verifyFirebaseToken');

// Create a new rating
router.post('/', verifyFirebaseToken, ratingController.create);

// Get all ratings
router.get('/', ratingController.getAll);

// Get rating by ID
router.get('/:id', ratingController.getById);

// Get ratings for a specific service provider
router.get('/provider/:providerId', ratingController.getByProvider);

// Get ratings by a specific user
router.get('/user/:userId', ratingController.getByUser);

// Update rating
router.put('/:id', verifyFirebaseToken, ratingController.update);

// Delete rating
router.delete('/:id', verifyFirebaseToken, ratingController.delete);

module.exports = router;
