const Order = require('../models/Order');

async function getOrders(req, res) {
  try {
    const orders = await Order.find({ owner: req.user.id })
      .populate('supplier', 'companyName email phone')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).send('Server Error');
  }
}

async function createOrder(req, res) {
  try {
    const { products, notes } = req.body;
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ msg: 'Products are required' });
    }
    const validProducts = products.every(
      product => product.name && product.quantity && product.quantity > 0
    );
    if (!validProducts) {
      return res.status(400).json({ msg: 'Invalid product entries' });
    }

    const newOrder = new Order({
      owner: req.user.id,
      products,
      notes: notes || '',
      status: 'pending'
    });

    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(500).send('Server Error');
  }
}

async function updateOrderStatus(req, res) {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ msg: 'Order not found' });
    if (order.owner.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const validTransitions = {
      'pending': ['cancelled'],
      'delivered': ['received'],
      'received': ['completed']
    };

    const isValid = 
      (order.status === 'delivered' && status === 'received') ||
      (order.status === 'approved' && status === 'received') ||
      (order.status === 'received' && status === 'completed') ||
      (validTransitions[order.status]?.includes(status));

    if (!isValid) {
      return res.status(400).json({ 
        msg: `Invalid status transition from ${order.status} to ${status}` 
      });
    }

    order.status = status;
    order.updatedAt = Date.now();
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).send('Server Error');
  }
}

module.exports = {
  getOrders,
  createOrder,
  updateOrderStatus
};
