const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'GroceryOwner',
    required: true
  },
  supplier: {
    type: Schema.Types.ObjectId,
    ref: 'Supplier',
  },
  products: [
    {
      name: {
        type: String,
        required: true
      },
      quantity: {
        type: Number,
        required: true
      },
      price: {
        type: Number
      }
    }
  ],
  totalAmount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'delivered', 'received', 'completed'],
    default: 'pending'
  },
  rejectedBy: [{
    type: Schema.Types.ObjectId,
    ref: 'Supplier'
  }],
  notes: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
});

module.exports = mongoose.model('Order', orderSchema);