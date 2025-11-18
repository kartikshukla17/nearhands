const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const verifyFirebaseToken = require('../middleware/verifyFirebaseToken');

// Create a new payment
router.post('/', verifyFirebaseToken, paymentController.create);

// Get all payments
router.get('/', paymentController.getAll);

// Get current user's payments
router.get('/me', verifyFirebaseToken, paymentController.getMyPayments);

// Get payment by ID
router.get('/:id', paymentController.getById);

// Get payments by user ID
router.get('/user/:user_id', paymentController.getByUserId);

// Get payments by provider ID
router.get('/provider/:provider_id', paymentController.getByProviderId);

// Get payment by job ID
router.get('/job/:job_id', paymentController.getByJobId);

// Update payment
router.put('/:id', verifyFirebaseToken, paymentController.update);

// Delete payment
router.delete('/:id', verifyFirebaseToken, paymentController.delete);

module.exports = router;