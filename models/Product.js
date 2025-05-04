const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: String,
  brand: String,
  category: { type: String, enum: ['Women', 'Men', 'Kids'] },
  size: [String],
  color: String,
  price: Number,
  stockCount: Number,
  description: String,
  imageUrl: String,
  isFeatured: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
