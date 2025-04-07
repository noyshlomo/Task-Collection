const Order = require('../models/Order');
const { Supplier } = require('../models/User');

async function getProfile(req, res) {
  try {
    const supplier = await Supplier.findById(req.user.id).select('-password');

    if (!supplier) {
      return res.status(404).json({ msg: 'Supplier not found' });
    }

    res.json(supplier);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
}


async function getOrders(req, res) {
  try {
  const supplierId = req.user.id;
    
  // Find all orders that:
  // 1. pending and haven't been rejected by this supplier
  // 2. approved/delivered by this supplier
  const orders = await Order.find({
    $or: [
      { status: 'pending', rejectedBy: { $ne: supplierId } },
      { supplier: supplierId }
    ]
  })
  .populate('owner', ['name', 'email', 'phone'])
  .sort({ createdAt: -1 });
  
  res.json(orders);
} catch (err) {
  console.error(err.message);
  res.status(500).send('Server Error');
}
}


async function approveOrder(req, res) {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ msg: 'Order cannot be approved - not in pending status' });
    }

    const supplier = await Supplier.findById(req.user.id);

    const requestedProducts = order.products.map(item => item.name.toLowerCase());
    const supplierProducts = supplier.products.map(product => ({
      name: product.name.toLowerCase(),
      pricePerUnit: product.pricePerUnit
    }));

    const supplierProductNames = supplierProducts.map(p => p.name);

    const canFulfill = requestedProducts.every(product =>
      supplierProductNames.includes(product)
    );

    if (!canFulfill) {
      return res.status(400).json({
        msg: 'Cannot approve order - supplier does not offer all requested products'
      });
    }

    let totalAmount = 0;
    const updatedProducts = order.products.map(orderProduct => {
      const supplierProduct = supplierProducts.find(
        product => product.name === orderProduct.name.toLowerCase()
      );

      const price = supplierProduct.pricePerUnit;
      totalAmount += price * orderProduct.quantity;

      return {
        name: orderProduct.name,
        quantity: orderProduct.quantity,
        price: price
      };
    });

    order.products = updatedProducts;
    order.totalAmount = totalAmount;
    order.status = 'approved';
    order.supplier = req.user.id;
    order.updatedAt = Date.now();

    await order.save();

    res.json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
}


async function updateOrderStatus(req, res) {
  try {
    const { status, products, totalAmount } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    const validTransitions = {
      'pending': ['approved', 'rejected'],
      'approved': ['delivered'],
      'delivered': ['completed']
    };

    if (!validTransitions[order.status] || !validTransitions[order.status].includes(status)) {
      return res.status(400).json({
        msg: `Invalid status transition from ${order.status} to ${status}`
      });
    }

    if (status === 'approved') {
      order.supplier = req.user.id;

      if (products && Array.isArray(products)) {
        order.products = products;
      }

      if (totalAmount) {
        order.totalAmount = totalAmount;
      }
    }

    order.status = status;
    order.updatedAt = Date.now();

    await order.save();

    res.json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
}

module.exports = {
  getProfile,
  getOrders,
  approveOrder,
  updateOrderStatus
};