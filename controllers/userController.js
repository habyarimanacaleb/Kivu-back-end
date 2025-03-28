// User Controller
require("dotenv").config();
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
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

    // Validate required fields
    if (!email || !username || !password || !role) {
      return res.status(400).json({ 
        message: "Email, Username, Password, and Role are required." 
      });
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        message: "User already exists with that email or Username." 
      });
    }

    // Hash the password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    const newUser = new User({
      email,
      username,
      password: hashedPassword,
      role,
      isConfirmed: false,
    });
    await newUser.save();

    // Generate a confirmation token
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Confirmation URL
    const confirmationUrl = `${process.env.BASE_URL}/api/users/confirm-email/${token}`;

    // Setup email options
    const mailOptions = {
      from: `"Ibirwa Kivu Bike Tour Services" <${process.env.SMTP_USER}>`,
      to: newUser.email,
      subject: "Email Confirmation",
      html: `
        <p>Dear ${username},</p>
        <p>Thank you for registering to our website.</p>
        <p>Please click <a href='${confirmationUrl}'>Here</a> to confirm your account.</p>
      `,
    };

    // Send confirmation email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending confirmation email:", error);
        return res.status(500).json({ message: "Error sending confirmation email. Please try again later." });
      }
      if (info.rejected.length > 0) {
        console.error("Email rejected:", info.rejected);
        return res.status(500).json({ message: "Email rejected. Please check the email address." });
      }
      console.log("Confirmation email sent:", info.response);

      // Return success message and user data
      res.status(201).json({ message: "Signup successful! Please check your email to confirm your account.", user: newUser });
      console.log("Email confirmation sent to:", newUser.email);
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error occurred. Please try again later." });
  }
};
exports.confirmEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).render("confirmationFailure");
    }

    user.isConfirmed = true;
    await user.save();

    res.status(200).render("confirmationSuccess");
  } catch (error) {
    console.error("Error confirming email:", error);
    res.status(500).render("confirmationFailure");
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error.message);
    res
      .status(500)
      .json({ message: "Error fetching user profile", error: error.message });
  }
};
exports.updateUserProfile = async (req, res) => {
  try {
    const { username, email } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.username = username || user.username;
    user.email = email || user.email;

    await user.save();

    res.json({ message: "User profile updated successfully", user });
  } catch (error) {
    console.error("Error updating user profile:", error.message);
    res
      .status(500)
      .json({ message: "Error updating user profile", error: error.message });
  }
};
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error.message);
    res
      .status(500)
      .json({ message: "Error deleting user", error: error.message });
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
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if the user's email is confirmed
    if (!user.isConfirmed) {
      return res
        .status(403)
        .json({ message: "Please confirm your email before logging in." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect Password" });
    }
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        name: user.username,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    // Ensure req.session is defined before setting properties
    if (req.session) {
      req.session.user = {
        userId: user._id,
        role: user.role,
        username: user.username,
        token: token,
      };
    }
    res.cookie(
      "userPreferences",
      JSON.stringify({ theme: "dark", language: "en" }),
      {
        httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
        secure: process.env.NODE_ENV === "production", // Ensures cookie is only sent over HTTPS in production
        maxAge: 24 * 60 * 60 * 1000, // Cookie will expire in 1 day
        sameSite: "lax", // Helps protect against CSRF attacks
      }
    );

    res
      .status(200)
      .json({ message: "User logged in successfully", token, user });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
exports.logout = (req, res) => {
  try {
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          console.error("Error destroying session:", err);
          return res.status(500).json({ message: "Failed to log out. Please try again." });
        }
        res.clearCookie("connect.sid"); // Clear the session cookie
        res.status(200).json({ message: "Logged out successfully." });
      });
    } else {
      res.status(200).json({ message: "No active session found." });
    }
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ message: "Server error occurred during logout." });
  }
};

exports.getSessionData = (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "No active session" });
    }

    res.status(200).json({ user: req.session.user });
  } catch (error) {
    console.error("Error fetching session data:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getMonthlySignups = async (req, res) => {
  try {
    const signups = await User.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const formattedData = signups.map((s) => ({
      month: months[s._id - 1],
      count: s.count,
    }));
    res.status(200).json(formattedData);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.restricted = (req, res) => {
  res.status(200).json({ message: "Access granted to restricted endpoint" });
};
