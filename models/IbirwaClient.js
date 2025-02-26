const mongoose = require("mongoose");

const IbirwaClientSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true },
  phone: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
});

const IbirwaClient = mongoose.model("IbirwaClient", IbirwaClientSchema);
module.exports = IbirwaClient;
