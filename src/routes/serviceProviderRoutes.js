const express = require('express');
const router = express.Router();
const providerController = require('../controllers/providerController');
const verifyFirebaseToken = require('../middlewares/verifyFirebaseToken');

router.post('/', verifyFirebaseToken, providerController.create);
router.get('/', providerController.getAll);
router.get('/verified', providerController.getVerified);
router.get('/subscribed', providerController.getSubscribed);
router.get('/service/:service', providerController.getByService);
router.get('/me', verifyFirebaseToken, providerController.getProfile);
router.get('/:id', providerController.getById);

router.put('/:id', verifyFirebaseToken, providerController.update);
router.put('/:id/verify', verifyFirebaseToken, providerController.updateVerification);
router.put('/:id/subscription', verifyFirebaseToken, providerController.updateSubscription);
router.delete('/:id', verifyFirebaseToken, providerController.delete);

module.exports = router;
