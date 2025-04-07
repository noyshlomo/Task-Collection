const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Base user schema
const baseUserSchema = {
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
};

// Grocery Owner Schema
const groceryOwnerSchema = new Schema({
  ...baseUserSchema,
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'owner'
  }
});

// Supplier Schema
const supplierSchema = new Schema({
  ...baseUserSchema,
  companyName: {
    type: String,
    required: true
  },
  representativeName: {
    type: String,
    required: true
  },
  products: [
    {
      name: {
        type: String,
        required: true
      },
      minQuantity: {
        type: Number,
        required: true
      },
      pricePerUnit: {
        type: Number,
        required: true
      }
    }
  ],
  role: {
    type: String,
    default: 'supplier'
  }
});

const GroceryOwner = mongoose.model('GroceryOwner', groceryOwnerSchema);
const Supplier = mongoose.model('Supplier', supplierSchema);

module.exports = { GroceryOwner, Supplier };