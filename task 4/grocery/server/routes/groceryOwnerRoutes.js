const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { isGroceryOwner } = require('../middleware/roleCheck');

const {
  getOrders,
  createOrder,
  updateOrderStatus
} = require('../controllers/groceryOwnerController');

router.get('/orders', auth, isGroceryOwner, getOrders);
router.post('/orders', auth, isGroceryOwner, createOrder);
router.put('/orders/:id/status', auth, isGroceryOwner, updateOrderStatus);

module.exports = router;
