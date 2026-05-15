require("dotenv").config();
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { sendEmail } = require("../controllers/emailController");

// 1. Secure Signup with Automatic Stale Accounts Cleanup
exports.signup = async (req, res) => {
  try {
    const { email, username, password, role } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ message: "Email, Username, and Password are required." });
    }

    // Proactively clean out expired unconfirmed users to free up registration keys
    await User.deleteMany({
      $or: [{ email }, { username }],
      isConfirmed: false,
      confirmationExpires: { $lt: Date.now() }
    });

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        message: existingUser.isConfirmed 
          ? "User already exists with that email or Username." 
          : "An unverified account already exists with those details. Please check your inbox."
      });
    }

    // Rely explicitly on your schema's pre-save middleware to hash the password safely
    const newUser = new User({
      email,
      username,
      password, 
      role: role || "client"
    });

    await newUser.save();

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    const confirmationUrl = `${process.env.BASE_URL}/api/ibirwa-clients/confirm-email/${token}`;
    
    await sendEmail(
      newUser.email,
      "Email Confirmation",
      `Please confirm your account by visiting this link: ${confirmationUrl}`,
      `<p>Dear ${username},</p><p>Thank you for registering. Please click <a href='${confirmationUrl}'>Here</a> to confirm your account.</p>`
    );

    res.status(201).json({
      message: "Signup successful! Please check your email to confirm your account.",
      user: { id: newUser._id, email: newUser.email, username: newUser.username, role: newUser.role }
    });
  } catch (error) {
    console.error("Signup tracking failure:", error);
    res.status(500).json({ message: "Server error occurred during account registration." });
  }
};

// 2. Email Link Confirmation Interceptor
exports.confirmEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(400).render("confirmationFailure");

    // Enforce expiry window check manually if document still sits in DB un-purged
    if (!user.isConfirmed && user.confirmationExpires < Date.now()) {
      await User.findByIdAndDelete(user._id);
      return res.status(400).render("confirmationFailure", { message: "Verification link expired. Please sign up again." });
    }

    user.isConfirmed = true;
    user.confirmationExpires = undefined; // Drop expiration window tracking metrics
    await user.save();

    res.status(200).render("confirmationSuccess");
  } catch (error) {
    console.error("Link processing failure:", error);
    res.status(500).render("confirmationFailure");
  }
};

// 3. Login Vector (Perfect Synchronization with verifyAdmin middleware)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    // Fetch user and explicitly request the hidden password string field
    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    if (!user.isConfirmed) {
      return res.status(403).json({ message: "Please confirm your email before logging in." });
    }

    if (user.blocked) {
      return res.status(403).json({ message: "Your account clearance has been administratively suspended." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Incorrect Password" });

    // Synchronization Fix: Generate matching boolean flags for your verifyAdmin middleware check
    const isAdminUser = user.role === "admin";

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        isAdmin: isAdminUser, // Unlocks dashboard modifications seamlessly
        name: user.username
      },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    if (req.session) {
      req.session.user = { userId: user._id, role: user.role, username: user.username, token };
    }

    res.cookie(
      "userPreferences",
      JSON.stringify({ theme: "dark", language: "en" }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: "lax"
      }
    );

    res.status(200).json({ 
      message: "User logged in successfully", 
      user: { id: user._id, email: user.email, username: user.username, role: user.role }, 
      token 
    });
  } catch (error) {
    console.error("Login authorization execution fault:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 4. Update Profile Fields Securely (Completely Fixes Double-Hashing Risk)
exports.updateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (updates.username) user.username = updates.username;
    if (updates.email) user.email = updates.email;
    if (updates.role) user.role = updates.role;
    
    // Assignment directly onto document triggers the schema's pre("save") wrapper perfectly
    if (updates.password) {
      user.password = updates.password; 
    }

    await user.save();

    const cleanUserOutput = user.toObject();
    delete cleanUserOutput.password; // Strip credential leaks out of response payload

    res.json({ message: "User profile updated successfully", updateUser: cleanUserOutput });
  } catch (error) {
    console.error("User mutation tracking fault:", error.message);
    res.status(500).json({ message: "Error updating user profile", error: error.message });
  }
};

// 5. Fetch Profiler Information Model Instance
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    console.error("Profile view extraction fault:", error.message);
    res.status(500).json({ message: "Error fetching user profile", error: error.message });
  }
};

// 6. Block/Unblock Access Modifier Controls
exports.blockOrUnblockUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { blocked } = req.body;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.blocked = blocked;
    await user.save();

    res.status(200).json({
      message: `User has been ${blocked ? "blocked" : "unblocked"} successfully.`,
      user
    });
  } catch (error) {
    console.error("Error updating block status:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 7. Account Purge Execution Matrix
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error.message);
    res.status(500).json({ message: "Error deleting user", error: error.message });
  }
};

// 8. Bulk Index Retrieval Sets
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
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 9. Session Tear-down Vectors
exports.logout = (req, res) => {
  try {
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          console.error("Error destroying session:", err);
          return res.status(500).json({ message: "Failed to log out. Please try again." });
        }
        res.clearCookie("connect.sid");
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
    if (!req.session || !req.session.user) {
      return res.status(401).json({ message: "No active session" });
    }
    res.status(200).json({ user: req.session.user });
  } catch (error) {
    console.error("Error fetching session data:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 10. Dashboard Aggregate Analytics Reports Engine
exports.getMonthlySignups = async (req, res) => {
  try {
    const signups = await User.aggregate([
      { $group: { _id: { $month: "$createdAt" }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const formattedData = signups.map((s) => ({
      month: months[s._id - 1],
      count: s.count
    }));
    res.status(200).json(formattedData);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.restricted = (req, res) => {
  res.status(200).json({ message: "Access granted to restricted endpoint" });
};