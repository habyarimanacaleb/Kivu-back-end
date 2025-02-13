const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: false },
    email: { type: String, required: true },
    message: { type: String, required: true },
    responded: { type: Boolean, default: false },
    responseMessage: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Contact", contactSchema);
