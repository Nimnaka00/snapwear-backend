const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const {
  getCart,
  addToCart,
  updateCartItem,
  clearCart
} = require('../controllers/cartController');

router.get('/', auth, getCart);
router.post('/', auth, addToCart);
router.put('/', auth, updateCartItem);
router.delete('/', auth, clearCart);

module.exports = router;
