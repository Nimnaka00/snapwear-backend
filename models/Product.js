const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  brand: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['Shirts', 'Pants', 'Dresses', 'Jackets', 'Accessories', 'Others'],
    required: true,
  },
  size: {
    type: [String], // e.g., ['S', 'M', 'L', 'XL']
    default: [],
  },
  color: {
    type: String,
  },
  price: {
    type: Number,
    required: true,
  },
  stockCount: {
    type: Number,
    default: 0,
  },
  description: {
    type: String,
  },
  imageUrl: {
    type: String, // or Array of strings if multiple images
    default: '',
  },
  isFeatured: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
