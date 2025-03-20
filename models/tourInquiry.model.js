const mongoose = require("mongoose");

const tourInquirySchema = new mongoose.Schema({
  name: { type: String, default: "" },
  email: { type: String, required: true },
  destination: { type: String, required: true },
  paxNumber: { type: Number, required: true },
  checkinDate: { type: String, required: true },
  checkoutDate: { type: String, required: true },
});

const TourInquiry = mongoose.model("TourInquiry", tourInquirySchema);
module.exports = TourInquiry;
