const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// Hash a short token/otp
const hashToken = (plain) =>
  crypto.createHash("sha256").update(plain).digest("hex");

const signJwt = (user) =>
  jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

// ✅ REGISTER
exports.registerUser = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  try {
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    const token = signJwt(newUser);

    res.status(201).json({
      message: "Account created successfully",
      token,
      user: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Registration failed" });
  }
};

// ✅ LOGIN
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = signJwt(user);

    res.json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
};

// ✅ SEND OTP (hashed in DB)
exports.sendOtp = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = generateOTP();
    user.resetPasswordToken = hashToken(otp);
    user.resetPasswordExpires = Date.now() + 5 * 60 * 1000;
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: "SnapWear <no-reply@snapwear.com>",
      to: email,
      subject: "Your SnapWear OTP Code",
      html: `<p>Your OTP for password reset is:</p>
             <h2>${otp}</h2>
             <p>This code will expire in 5 minutes.</p>`,
    });

    res.json({ message: "OTP sent to your email" });
  } catch (err) {
    res.status(500).json({ error: "Failed to send OTP" });
  }
};

// ✅ VERIFY OTP (issue short-lived reset token)
exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({
      email: email.toLowerCase(),
      resetPasswordToken: hashToken(otp),
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user)
      return res.status(400).json({ message: "Invalid or expired OTP" });

    // Emit a one-time reset token (JWT 10 min)
    const resetJwt = jwt.sign(
      { userId: user._id, purpose: "password_reset" },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );

    res.json({ message: "OTP verified", resetToken: resetJwt });
  } catch (err) {
    res.status(500).json({ error: "OTP verification failed" });
  }
};

// ✅ RESET PASSWORD (requires resetToken from verifyOtp)
exports.resetPassword = async (req, res) => {
  const { email, newPassword, resetToken } = req.body;
  try {
    // verify reset token
    const payload = jwt.verify(resetToken, process.env.JWT_SECRET);
    if (payload.purpose !== "password_reset") {
      return res.status(400).json({ message: "Invalid reset token" });
    }

    const user = await User.findOne({
      _id: payload.userId,
      email: email.toLowerCase(),
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user)
      return res
        .status(404)
        .json({ message: "User not found or token expired" });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password has been reset successfully" });
  } catch (err) {
    res
      .status(400)
      .json({ error: "Reset failed. Token may be invalid or expired." });
  }
};
