const express = require('express');
const router = express.Router();
const requestController = require('../controllers/serviceRequestController');
const verifyFirebaseToken = require('../middlewares/verifyFirebaseToken');

router.post('/', verifyFirebaseToken, requestController.create);
router.get('/', requestController.getAll);
router.get('/status/:status', requestController.getByStatus);
router.get('/user/me', verifyFirebaseToken, requestController.getByUser);
router.get('/provider/:providerId', requestController.getByProvider);
router.get('/:id', requestController.getById);

router.put('/:id', verifyFirebaseToken, requestController.update);
router.patch('/:id/status', verifyFirebaseToken, requestController.updateStatus);
router.patch('/:id/payment', verifyFirebaseToken, requestController.updatePaymentStatus);
router.post('/:id/verify-otp', verifyFirebaseToken, requestController.verifyOTP);
router.delete('/:id', verifyFirebaseToken, requestController.delete);

module.exports = router;
