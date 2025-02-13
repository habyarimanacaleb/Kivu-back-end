const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  userName: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "guest" },
  isConfirmed: { type: Boolean, default: false },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
