const mongoose = require("mongoose");

const ServiceSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, "Service title is required"], 
    trim: true 
  },
  description: { 
    type: String, 
    required: [true, "Service description is required"], 
    trim: true 
  },
  detailPage: { 
    type: String, 
    trim: true 
  },
  imageFile: { 
    type: String, 
    trim: true, 
    default: null 
  },
  // Excellent addition! Safely defaults to an empty array.
  gallery: { 
    type: [String], 
    default: [] 
  },
  details: {
    highlights: { 
      type: [String], 
      default: [] // Prevents React .map() crashes if left empty
    },
    tips: { 
      type: [String], 
      default: [] // Prevents React .map() crashes if left empty
    },
    whatsapp: { 
      type: String, 
      required: [true, "WhatsApp contact number is required"],
      trim: true
    },
    email: { 
      type: String, 
      required: [true, "Contact email is required"],
      trim: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please provide a valid email address"]
    },
  }
}, {
  timestamps: true 
});

const Service = mongoose.model("Service", ServiceSchema);
module.exports = Service;