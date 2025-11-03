const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyFirebaseToken = require('../middlewares/verifyFirebaseToken');

router.post('/', verifyFirebaseToken, userController.create);
router.get('/', userController.getAll);
router.get('/me', verifyFirebaseToken, userController.getProfile);
router.get('/:id', userController.getById);
router.put('/:id', verifyFirebaseToken, userController.update);
router.delete('/:id', verifyFirebaseToken, userController.delete);

module.exports = router;
