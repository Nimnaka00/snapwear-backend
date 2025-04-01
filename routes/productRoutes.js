const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');

const auth = require('../middlewares/authMiddleware');
const upload = require('../middlewares/multer'); // 👈 NEW: Multer + Cloudinary setup

// Public routes
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Protected routes with image upload
router.post('/', auth, upload.single('image'), addProduct);  // 👈 Handles image upload
router.put('/:id', auth, upload.single('image'), updateProduct);
router.delete('/:id', auth, deleteProduct);

module.exports = router;
