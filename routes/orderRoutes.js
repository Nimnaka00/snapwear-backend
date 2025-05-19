const express = require('express');
const auth    = require('../middlewares/authMiddleware');
const { getOrders, createOrder, handleWebhook } = require('../controllers/orderController');

const router = express.Router();

router.post('/', auth, createOrder);
router.get( '/', auth, getOrders);

module.exports = router;
