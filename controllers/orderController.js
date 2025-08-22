const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.createOrder = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.userId }).populate(
      "items.product"
    );
    if (!cart || cart.items.length === 0)
      return res.status(400).json({ message: "Cart is empty" });

    // Ensure all products still exist and have prices
    const computedItems = cart.items.map((i) => {
      if (!i.product)
        throw new Error("A product in your cart no longer exists");
      return {
        product: i.product._id,
        quantity: i.quantity,
        unitPrice: i.product.price,
      };
    });

    const subTotal = computedItems.reduce(
      (sum, i) => sum + i.unitPrice * i.quantity,
      0
    );
    const discount = 0;
    const deliveryCost = 287;
    const total = subTotal - discount + deliveryCost;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100),
      currency: "lkr",
      metadata: { userId: req.user.userId },
    });

    const order = new Order({
      user: req.user.userId,
      items: computedItems,
      subTotal,
      discount,
      deliveryCost,
      total,
      stripePaymentIntentId: paymentIntent.id,
    });
    await order.save();

    res.json({ clientSecret: paymentIntent.client_secret, orderId: order._id });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to create order" });
  }
};

exports.handleWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;
  try {
    // IMPORTANT: express.raw() places Buffer on req.body
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "payment_intent.succeeded") {
    const pi = event.data.object;
    const order = await Order.findOne({ stripePaymentIntentId: pi.id });
    if (order) {
      order.paymentStatus = "paid";
      await order.save();
      await Cart.findOneAndDelete({ user: order.user });
    }
  }

  res.json({ received: true });
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.userId })
      .populate("items.product")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
