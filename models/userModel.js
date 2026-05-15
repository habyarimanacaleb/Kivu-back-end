const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: [true, "Username field is required."], 
    unique: true, 
    trim: true 
  },
  email: { 
    type: String, 
    required: [true, "Email field is required."], 
    unique: true, 
    trim: true,
    lowercase: true // Automatically forces lowercase storage to prevent duplicate variations
  },
  password: { 
    type: String, 
    required: [true, "Password validation string is required."],
    select: false 
  },
  role: { 
    type: String, 
    enum: ["admin", "client"], 
    default: "client" 
  },
  isConfirmed: { 
    type: Boolean, 
    default: false 
  },
  // Tracks administrative system access controls
  blocked: {
    type: Boolean,
    default: false,
  },
  // Verification expiration milestone tracker (cleans up stale unverified documents)
  confirmationExpires: {
    type: Date,
    default: () => Date.now() + 1000 * 60 * 60 * 24 // Defaults cleanly to a 24-hour TTL window
  }
}, {
  // Handles both createdAt and updatedAt timelines with zero configuration redundancy
  timestamps: true 
});

// --- CRITICAL DATABASE SECURITY LAYER: Pre-Save Hashing Mechanism ---
userSchema.pre("save", async function (next) {
  // If the password text field hasn't been altered during this lifecycle, skip hashing
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("User", userSchema);