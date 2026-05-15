const mongoose = require('mongoose');

// Schema tracking anonymous or self-nicknamed interactions
const CommentSchema = new mongoose.Schema({
  user: { 
    type: String, 
    default: "Anonymous Explorer" 
  },
  text: { 
    type: String, 
    required: [true, "Comment text cannot be empty."] 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

const BlogSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, "A post title is required."],
    trim: true 
  },
  slug: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true 
  },
  author: { 
    type: String, 
    required: [true, "Author name is required."],
    trim: true 
  },
  tags: { 
    type: [String], 
    default: [], 
  },
  category: { 
    type: String, 
    required: [true, "A specific category classification is required."],
    enum: ["Technical", "Culture", "Eco", "Safety", "Nature", "Geology"]
  },
  mainImage: { 
    type: String, 
    required: [true, "A primary banner image asset URL is required."] 
  },
  excerpt: { 
    type: String, 
    required: [true, "An excerpt abstract summary is required."],
    maxlength: 250 
  },
  content: { 
    type: String, 
    required: [true, "The core text content body is required."] 
  },
  gallery: { 
    type: [String], 
    default: [] 
  },
  toursNearby: { 
    type: [mongoose.Schema.Types.ObjectId], 
    default: [],
    ref: "Tour"
  },
  // Holds unique client/device fingerprints string array to track toggles cleanly
  likes: { 
    type: [String], 
    default: [] 
  },
  comments: [CommentSchema]
}, { 
  timestamps: true,
  // Permits virtual metrics calculations to serialize out over REST API endpoints smoothly
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Computed dynamic virtual variable yielding absolute aggregate number count of flags
BlogSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

module.exports = mongoose.model('Blog', BlogSchema);