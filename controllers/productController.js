const Product = require('../models/Product');

// 🔄 Get All Products (Public)
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🧾 Get Single Product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ➕ Add New Product (with image upload)
exports.addProduct = async (req, res) => {
  try {
    const {
      name,
      brand,
      category,
      price,
      size,
      color,
      stockCount,
      description
    } = req.body;

    const imageUrl = req.file?.path || '';

    const newProduct = new Product({
      name,
      brand,
      category,
      price,
      size: size?.split(',') || [],
      color,
      stockCount,
      description,
      imageUrl
    });

    await newProduct.save();
    res.status(201).json({ message: "Product created", product: newProduct });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✏️ Update Product
exports.updateProduct = async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Product not found" });

    res.json({ message: "Product updated", product: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ❌ Delete Product
exports.deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Product not found" });

    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
