const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');

const auth = require('../middlewares/authMiddleware'); // 👈 use this to protect add/edit/delete if needed

// Public routes
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Protected admin routes (you can secure with `auth`)
router.post('/', auth, addProduct);
router.put('/:id', auth, updateProduct);
router.delete('/:id', auth, deleteProduct);

module.exports = router;
