const Blog = require("../models/blog");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadBufferToCloud = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "expedition_logs" }, 
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url); 
      }
    );
    uploadStream.end(fileBuffer);
  });
};

// Helper function to extract tags perfectly regardless of parsing strategy
const normalizeTags = (body) => {
  const rawTags = body.tags || body["tags[]"];
  if (!rawTags) return [];
  if (Array.isArray(rawTags)) return rawTags;
  if (typeof rawTags === "string") {
    // If it comes through as stringified JSON or a comma-separated line fallback
    if (rawTags.startsWith("[") && rawTags.endsWith("]")) {
      try { return JSON.parse(rawTags); } catch (e) { /* fall through */ }
    }
    return rawTags.split(",").map(t => t.trim()).filter(t => t !== "");
  }
  return [rawTags];
};

exports.getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ message: "Extraction failure.", error: error.message });
  }
};

exports.getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Document entry index not located." });
    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ message: "Query processing error.", error: error.message });
  }
};

// 1. Create a Brand New Blog Link Instance
exports.createBlog = async (req, res) => {
  try {
    const { title, category, excerpt, content, author } = req.body;
    
    // Double-check title uniqueness
    const existingBlog = await Blog.findOne({ title: title.trim() });
    if (existingBlog) {
      return res.status(400).json({ message: "A blog post with this title already exists. Please choose a more unique title." });
    }

    const sluggen = title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const slug = sluggen.length > 100 ? sluggen.substring(0, 100) : sluggen;
    
    const existingSlug = await Blog.findOne({ slug });
    if (existingSlug) {
      return res.status(400).json({ message: "A URL path routing slug with a similar signature already exists." });
    }

    // 🌟 Normalize Tags cleanly from both "tags" or "tags[]" fields
    const tags = normalizeTags(req.body);

    let mainImageUrl = req.body.mainImage; 
    let galleryUrls = [];

    if (req.files) {
      if (req.files['mainImage']?.[0]) {
        mainImageUrl = await uploadBufferToCloud(req.files['mainImage'][0].buffer);
      }
      if (req.files['gallery']) {
        for (const file of req.files['gallery']) {
          const url = await uploadBufferToCloud(file.buffer);
          galleryUrls.push(url);
        }
      }
    }

    if (req.body.gallery && galleryUrls.length === 0) {
      galleryUrls = Array.isArray(req.body.gallery) ? req.body.gallery : [req.body.gallery];
    }

    const newBlog = new Blog({
      title: title.trim(),
      slug,
      author,
      tags,
      category,
      excerpt,
      content,
      mainImage: mainImageUrl,
      gallery: galleryUrls
    });

    const savedBlog = await newBlog.save();
    res.status(201).json(savedBlog);
  } catch (error) {
    res.status(400).json({ message: "Payload commit abort.", error: error.message });
  }
};

exports.getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug }).populate('toursNearby');
    if (!blog) return res.status(404).json({ message: "Blog post not found." });
    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ message: "Error fetching blog post.", error: error.message });
  }
};

// 2. Update Existing Record Properties Safely
exports.updateBlog = async (req, res) => {
  try {
    const { title, category, excerpt, content, author, existingGallery } = req.body;
    
    const updates = {};
    if (title) {
      updates.title = title.trim();
      const sluggen = title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      const slug = sluggen.length > 100 ? sluggen.substring(0, 100) : sluggen;
      
      // 🌟 Security Check: Make sure slug doesn't collide with another record
      const duplicateSlug = await Blog.findOne({ slug, _id: { $ne: req.params.id } });
      if (duplicateSlug) {
        return res.status(400).json({ message: "Another record is already using this updated title routing pathway." });
      }
      updates.slug = slug;
    }
    
    if (category) updates.category = category;
    if (excerpt) updates.excerpt = excerpt;
    if (content) updates.content = content;
    if (author) updates.author = author;
    
    // 🌟 Normalize Tags cleanly on mutations
    if (req.body.tags || req.body["tags[]"]) {
      updates.tags = normalizeTags(req.body);
    }

    // Initialize gallery arrays
    let finalGallery = [];
    if (existingGallery) {
      try {
        finalGallery = typeof existingGallery === 'string' ? JSON.parse(existingGallery) : existingGallery;
      } catch (e) {
        finalGallery = Array.isArray(existingGallery) ? existingGallery : [existingGallery];
      }
    }

    if (req.files) {
      if (req.files['mainImage']?.[0]) {
        updates.mainImage = await uploadBufferToCloud(req.files['mainImage'][0].buffer);
      }
      
      if (req.files['gallery'] && req.files['gallery'].length > 0) {
        for (const file of req.files['gallery']) {
          const url = await uploadBufferToCloud(file.buffer);
          finalGallery.push(url);
        }
      }
    }

    // If modifications were requested on the photo structure layouts
    if (existingGallery || (req.files && req.files['gallery'])) {
      updates.gallery = finalGallery;
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id, 
      { $set: updates }, 
      { new: true, runValidators: true }
    );

    if (!updatedBlog) {
      return res.status(404).json({ message: "Target document footprint not discovered." });
    }
    
    res.status(200).json(updatedBlog);
  } catch (error) {
    console.error("Internal Blog Update Failure Log:", error);
    res.status(500).json({ message: "Modification cycle error.", error: error.message });
  }
};

exports.deleteBlog = async (req, res) => {
  try {
    const deletedBlog = await Blog.findByIdAndDelete(req.params.id);
    if (!deletedBlog) return res.status(404).json({ message: "Target log entry not discovered." });
    res.status(200).json({ message: "Record cleanly purged from database indexes." });
  } catch (error) {
    res.status(500).json({ message: "Purge process failed.", error: error.message });
  }
};

exports.addAnonymousComment = async (req, res) => {
  try {
    const { text, clientNickname } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ message: "Comment body text content cannot be blank." });

    const targetBlog = await Blog.findById(req.params.id);
    if (!targetBlog) return res.status(404).json({ message: "Blog parameter invalid." });

    const userTag = clientNickname && clientNickname.trim() ? clientNickname.trim() : "Anonymous Explorer";

    targetBlog.comments.push({ 
      user: userTag,
      text: text 
    }); 
    
    await targetBlog.save();
    res.status(201).json({ message: "Note securely published to route.", comments: targetBlog.comments });
  } catch (error) {
    res.status(500).json({ message: "Comment append fault execution.", error: error.message });
  }
};

exports.toggleBlogLike = async (req, res) => {
  try {
    const { clientId } = req.body;
    if (!clientId) return res.status(400).json({ message: "Unique identifier payload signature missing." });

    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Target log record missing." });

    const hasLiked = blog.likes.includes(clientId);

    if (hasLiked) {
      blog.likes = blog.likes.filter(id => id !== clientId);
    } else {
      blog.likes.push(clientId);
    }

    await blog.save();
    
    res.status(200).json({ 
      message: hasLiked ? "Like retracted cleanly." : "Like recorded securely.",
      likes: blog.likes,
      likeCount: blog.likes.length 
    });
  } catch (error) {
    res.status(500).json({ message: "Error parsing system like mechanics.", error: error.message });
  }
};