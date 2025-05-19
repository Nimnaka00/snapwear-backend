const Order = require('../models/Order');
const Cart = require('../models/Cart');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.createOrder = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.userId }).populate('items.product');
    if (!cart || cart.items.length === 0) return res.status(400).json({ message: 'Cart is empty' });

    const subTotal = cart.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
    const discount = 0; // you can apply coupons here
    const deliveryCost = 287; // or calculate dynamically
    const total = subTotal - discount + deliveryCost;

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100),
      currency: 'lkr',
      metadata: { userId: req.user.userId }
    });

    // Create local order record
    const order = new Order({
      user: req.user.userId,
      items: cart.items.map(i => ({ product: i.product._id, quantity: i.quantity })),
      subTotal, discount, deliveryCost, total,
      stripePaymentIntentId: paymentIntent.id
    });
    await order.save();

    res.json({ clientSecret: paymentIntent.client_secret, orderId: order._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object;
    const order = await Order.findOne({ stripePaymentIntentId: pi.id });
    if (order) {
      order.paymentStatus = 'paid';
      await order.save();
      // clear cart
      await Cart.findOneAndDelete({ user: order.user });
    }
  }
  res.json({ received: true });
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.userId }).populate('items.product');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
