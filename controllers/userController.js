// User Controller
require("dotenv").config();
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
// const crypto = require("crypto");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === "true", // Use SSL
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

exports.signup = async (req, res) => {
  try {
    const { email, username, password, role } = req.body;
    if (!email || !username || !password) {
      return res
        .status(400)
        .json({ message: "Email, userName and password are required." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists with that email or userName" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create and save the new user
    const newUser = new User({
      email,
      username,
      password: hashedPassword,
      role,
      isConfirmed: false, // Add a field to track email confirmation
    });
    await newUser.save();

    // Generate a confirmation token
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Send confirmation email
    const confirmationUrl = `${process.env.BASE_URL}/api/confirm-email/${token}`;
    const mailOptions = {
      from: `"Ibirwa Kivu Bike Tour Services" <${process.env.SMTP_USER}>`,
      to: newUser.email,
      subject: "Email Confirmation",
      html: `<p>Dear ${username},</p>
          <p>Thank you for registering to our website.</p>
          <p>Please click <a href='${confirmationUrl}'>Here</a> to confirm your account.</p>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending confirmation email:", error);
        return res
          .status(500)
          .json({ message: "Error sending confirmation email" });
      }
      console.log("Confirmation email sent:", info.response);
      res.status(201).json({
        message:
          "User signed up successfully. Please check your email to confirm your account.",
        user: newUser,
      });
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.confirmEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "Invalid token" });
    }

    user.isConfirmed = true;
    await user.save();

    res.status(200).json({ message: "Email confirmed successfully" });
  } catch (error) {
    console.error("Error confirming email:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    // Find the user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Compare the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect Password" });
    }

    // Generate a token
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        name: user.username,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Save the token in the session
    req.session.token = token;

    res
      .status(200)
      .json({ message: "User logged in successfully", token, user });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.logout = (req, res) => {
  // Destroy the session to log out the user
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Error logging out" });
    }
    res.status(200).json({ message: "User logged out successfully" });
  });
};

exports.restricted = (req, res) => {
  res.status(200).json({ message: "Access granted to restricted endpoint" });
};
