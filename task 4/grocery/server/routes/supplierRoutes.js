const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { isSupplier } = require('../middleware/roleCheck');

const {
  getProfile,
  getOrders,
  approveOrder,
  updateOrderStatus
} = require('../controllers/supplierController');

router.get('/profile', auth, isSupplier, getProfile);
router.get('/orders', auth, isSupplier, getOrders);
router.put('/orders/:id/approve', auth, isSupplier, approveOrder);
router.put('/orders/:id/status', auth, isSupplier, updateOrderStatus);

module.exports = router;