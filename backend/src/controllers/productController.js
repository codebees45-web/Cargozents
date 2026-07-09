const Product = require('../models/Product');

/** GET /api/products — public catalog browse, active listings only */
const getProducts = async (req, res, next) => {
  try {
    const { category, shipper } = req.query;
    const filter = { isActive: true };
    if (category) filter.category = category;
    if (shipper) filter.shipper = shipper;

    const products = await Product.find(filter).sort({ createdAt: -1 }).populate('shipper', 'name');
    res.status(200).json({ success: true, products });
  } catch (err) {
    next(err);
  }
};

/** GET /api/products/mine — shipper's own catalog, including inactive items */
const getMyProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ shipper: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, products });
  } catch (err) {
    next(err);
  }
};

/** GET /api/products/:id */
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('shipper', 'name phone');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.status(200).json({ success: true, product });
  } catch (err) {
    next(err);
  }
};

/** POST /api/products — shipper creates a catalog item */
const createProduct = async (req, res, next) => {
  try {
    if (!['catalog', 'both'].includes(req.user.shipperMode)) {
      return res.status(403).json({ success: false, message: 'Your account is not set up for catalog selling' });
    }

    const { name, description, category, price, unit, stock, images, weightPerUnit } = req.body;
    if (!name || !description || !category || price === undefined || !weightPerUnit) {
      return res.status(400).json({ success: false, message: 'Missing required product fields' });
    }

    const product = await Product.create({
      shipper: req.user._id,
      name,
      description,
      category,
      price,
      unit: unit || 'unit',
      stock: stock || 0,
      images: images || [],
      weightPerUnit,
    });

    res.status(201).json({ success: true, product });
  } catch (err) {
    next(err);
  }
};

/** PATCH /api/products/:id — shipper updates their own product */
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, shipper: req.user._id });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const editable = ['name', 'description', 'category', 'price', 'unit', 'stock', 'images', 'weightPerUnit', 'isActive'];
    editable.forEach((field) => {
      if (req.body[field] !== undefined) product[field] = req.body[field];
    });

    await product.save();
    res.status(200).json({ success: true, product });
  } catch (err) {
    next(err);
  }
};

/** DELETE /api/products/:id — soft delete (deactivate) */
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, shipper: req.user._id },
      { isActive: false },
      { new: true }
    );
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.status(200).json({ success: true, message: 'Product removed from catalog' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProducts, getMyProducts, getProductById, createProduct, updateProduct, deleteProduct };
