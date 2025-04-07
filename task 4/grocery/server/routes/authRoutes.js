const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/owner/register', authController.registerOwner);
router.post('/owner/login', authController.loginOwner);
router.post('/supplier/register', authController.registerSupplier);
router.post('/supplier/login', authController.loginSupplier);

module.exports = router;
