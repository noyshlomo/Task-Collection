//check if user is a grocery owner
const isGroceryOwner = (req, res, next) => {
  if (req.user.role !== 'owner') {
    return res.status(403).json({ msg: 'Access denied. Not a grocery owner.' });
  }
  next();
};

//check if user is a supplier
const isSupplier = (req, res, next) => {
  if (req.user.role !== 'supplier') {
    return res.status(403).json({ msg: 'Access denied. Not a supplier.' });
  }
  next();
};

module.exports = { isGroceryOwner, isSupplier };