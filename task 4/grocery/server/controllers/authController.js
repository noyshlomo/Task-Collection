const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { GroceryOwner, Supplier } = require('../models/User');

async function registerOwner(req, res) {
  try {
    const { name, email, phone, password } = req.body;

    let owner = await GroceryOwner.findOne({ email });
    if (owner) return res.status(400).json({ msg: 'Owner already exists' });

    owner = new GroceryOwner({ name, email, phone, password });
    const salt = await bcrypt.genSalt(10);
    owner.password = await bcrypt.hash(password, salt);
    await owner.save();

    const payload = { user: { id: owner.id, role: 'owner' } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
}

async function loginOwner(req, res) {
  try {
    const { email, password } = req.body;

    const owner = await GroceryOwner.findOne({ email });
    if (!owner) return res.status(400).json({ msg: 'Invalid Credentials' });

    const isMatch = await bcrypt.compare(password, owner.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

    const payload = { user: { id: owner.id, role: 'owner' } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
}

async function registerSupplier(req, res) {
  try {
    const { companyName, representativeName, email, phone, password, products } = req.body;

    let supplier = await Supplier.findOne({ email });
    if (supplier) return res.status(400).json({ msg: 'Supplier already exists' });

    supplier = new Supplier({ companyName, representativeName, email, phone, password, products });
    const salt = await bcrypt.genSalt(10);
    supplier.password = await bcrypt.hash(password, salt);
    await supplier.save();

    const payload = { user: { id: supplier.id, role: 'supplier' } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
}

async function loginSupplier(req, res) {
  try {
    const { email, password } = req.body;

    const supplier = await Supplier.findOne({ email });
    if (!supplier) return res.status(400).json({ msg: 'Invalid Credentials' });

    const isMatch = await bcrypt.compare(password, supplier.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

    const payload = { user: { id: supplier.id, role: 'supplier' } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
}

module.exports = {
  registerOwner,
  loginOwner,
  registerSupplier,
  loginSupplier
};