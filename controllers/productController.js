const Product = require("../models/Product");

// GET /api/products?keyword=&category=&minPrice=&maxPrice=&page=&limit=&sort=
exports.getAllProducts = async (req, res) => {
  try {
    const {
      keyword = "",
      category,
      minPrice,
      maxPrice,
      page = 1,
      limit = 12,
      sort = "-createdAt", // -price for high->low, price for low->high
    } = req.query;

    const q = {};
    if (keyword) {
      const regex = new RegExp(keyword, "i");
      q.$or = [
        { name: regex },
        { brand: regex },
        { description: regex },
        { color: regex },
      ];
    }
    if (category) q.category = category;
    if (minPrice || maxPrice) {
      q.price = {};
      if (minPrice) q.price.$gte = Number(minPrice);
      if (maxPrice) q.price.$lte = Number(maxPrice);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Product.find(q).sort(sort).skip(skip).limit(Number(limit)),
      Product.countDocuments(q),
    ]);

    res.json({
      items,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      total,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Single
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create (admin)
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
      description,
    } = req.body;

    const imageUrl = req.file?.path || "";

    const newProduct = new Product({
      name,
      brand,
      category,
      price: Number(price),
      size:
        size
          ?.split(",")
          .map((s) => s.trim())
          .filter(Boolean) || [],
      color,
      stockCount: Number(stockCount),
      description,
      imageUrl,
    });

    await newProduct.save();
    res.status(201).json({ message: "Product created", product: newProduct });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update (admin)
exports.updateProduct = async (req, res) => {
  try {
    const {
      name,
      brand,
      category,
      price,
      size,
      color,
      stockCount,
      description,
    } = req.body;

    const updatedProduct = await Product.findById(req.params.id);
    if (!updatedProduct)
      return res.status(404).json({ message: "Product not found" });

    updatedProduct.name = name ?? updatedProduct.name;
    updatedProduct.brand = brand ?? updatedProduct.brand;
    updatedProduct.category = category ?? updatedProduct.category;
    updatedProduct.price =
      price !== undefined ? Number(price) : updatedProduct.price;
    updatedProduct.size = size
      ? size
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : updatedProduct.size;
    updatedProduct.color = color ?? updatedProduct.color;
    updatedProduct.stockCount =
      stockCount !== undefined ? Number(stockCount) : updatedProduct.stockCount;
    updatedProduct.description = description ?? updatedProduct.description;
    if (req.file?.path) updatedProduct.imageUrl = req.file.path;

    await updatedProduct.save();
    res.json({ message: "Product updated", product: updatedProduct });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Simple search (kept for compatibility)
exports.searchProducts = async (req, res) => {
  const keyword = req.query.keyword || "";
  try {
    const regex = new RegExp(keyword, "i");
    const products = await Product.find({
      $or: [
        { name: regex },
        { brand: regex },
        { category: regex },
        { description: regex },
        { color: regex },
      ],
    }).limit(50);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
