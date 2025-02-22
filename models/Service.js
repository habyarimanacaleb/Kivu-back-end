const mongoose = require("mongoose");

const ServiceSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  detailPage: { type: String, required: true, trim: true },
  imageFile: { type: String }, // Store image as Base64 string
  details: {
    highlights: { type: [String], required: true },
    tips: { type: [String], required: true },
    contact: {
      whatsapp: { type: String, required: true },
      email: { type: String, required: true },
    },
  },
  createdAt: { type: Date, default: Date.now },
});

const Service = mongoose.model("Service", ServiceSchema);
module.exports = Service;
