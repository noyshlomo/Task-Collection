const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const { updateOrderStatus } = require('../controllers/orderController');

router.put('/:id/status', auth, updateOrderStatus);


module.exports = router;