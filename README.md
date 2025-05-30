# 🛡️ Snapwear Backend

This is the backend service for **Snapwear**, a smart fashion e-commerce platform. Built with **Node.js**, **Express**, and **MongoDB**, it supports authentication, product management, shopping cart, orders, Stripe payments, and integrates with the Snapwear AI chatbot.

---

## 🚀 Features

- 🔐 User Registration, Login, JWT Auth
- 🔒 OTP-based password reset (via email)
- 💼 Admin-friendly product CRUD
- 🛒 Cart management (add, update, delete)
- 🏦 Orders with Stripe payment and webhook handling
- 💌 Email support via Gmail SMTP
- 🎨 Cloudinary image uploads (via Multer)
- 🧠 AI product recommendations (via separate AI microservice)

---

## 🧱 Tech Stack

- **Node.js**
- **Express.js**
- **MongoDB + Mongoose**
- **Stripe API**
- **Cloudinary** (image hosting)
- **JWT** (Authentication)
- **Nodemailer** (OTP emails)

---

## 📁 Project Structure

```
snapwear-backend/
├── config/               # DB and cloudinary setup
├── controllers/          # Route logic
├── middlewares/          # Auth, multer
├── models/               # Mongoose schemas
├── routes/               # API endpoints
├── tests/                # (Optional) API tests
├── .env                  # Environment variables
├── server.js             # Entry point
```

---

## ⚙️ Setup Instructions

### 1. Clone the Repo

```bash
git clone https://github.com/yourusername/snapwear-backend.git
cd snapwear-backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file:

```env
PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

MAIL_USER=your_email@gmail.com
MAIL_PASS=your_email_app_password

STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### 4. Run the Server

```bash
npm start
```

Your API should be running at: [http://localhost:5000](http://localhost:5000)

---

## 🧪 API Endpoints Overview

```
/api/auth         # Register, login, OTP, reset-password
/api/products     # Product catalog + admin CRUD
/api/cart         # Add, update, delete cart items
/api/orders       # Create & list orders
/api/payment      # Stripe webhook endpoint
/api/users        # Profile, notifications, payment methods
```

---

## 🪨 Webhook Testing with Stripe CLI

```bash
stripe listen --forward-to localhost:5000/api/payment/webhook
```

Copy the webhook signing secret and paste into your `.env` under:

```env
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## 🔗 Related Repos

- [Snapwear Frontend](https://github.com/yourusername/snapwear-frontend)
- [Snapwear AI Service](https://github.com/yourusername/snapwear-ai-service)

---

## 📄 License

MIT © [Your Name](https://github.com/yourusername)
