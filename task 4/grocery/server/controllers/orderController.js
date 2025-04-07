const Order = require('../models/Order');

async function updateOrderStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, products, totalAmount, action } = req.body;
    const supplierId = req.user.id;
    
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    if (action === 'reject') {
      if (!order.rejectedBy) {
        order.rejectedBy = [];
      }
      
      if (!order.rejectedBy.includes(supplierId)) {
        order.rejectedBy.push(supplierId);
        order.updatedAt = Date.now();
        await order.save();
      }
      
      return res.json(order);
    }
    
    // Handle other status updates
    if (status) {
      order.status = status;
    }
    
    if (products) {
      order.products = products;
    }
    
    if (totalAmount) {
      order.totalAmount = totalAmount;
    }
    
    if (status === 'approved') {
      order.supplier = supplierId;
    }
    
    order.updatedAt = Date.now();
    await order.save();
    
    res.json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

module.exports = {
    updateOrderStatus, 
  };