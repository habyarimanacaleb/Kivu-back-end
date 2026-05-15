const Blog = require("../models/Blog");
const cloudinary = require("cloudinary").v2;

// Cloudinary Configuration Matrix
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Helper stream processor handling RAM data storage buffers
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

// 1. Fetch All Sorted Logs
exports.getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ message: "Extraction failure.", error: error.message });
  }
};

// 2. Fetch Single Target Document
exports.getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Document entry index not located." });
    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ message: "Query processing error.", error: error.message });
  }
};

// 3. Process & Generate New Log Record
exports.createBlog = async (req, res) => {

   

  try {
    const { title, category, excerpt, content, author } = req.body;
   
    const sluggen = title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const slug = sluggen.length > 100 ? sluggen.substring(0, 100) : sluggen;
    const existingSlug = await Blog.findOne({ slug });
    if (existingSlug) return res.status(400).json({ message: "A blog post with a similar title already exists. Please modify the title to be more unique." });

    const tags = req.body.tags ? (Array.isArray(req.body.tags) ? req.body.tags : [req.body.tags]) : [];

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

    // blog exists check
    const existingBlog = await Blog.findOne({ title: title.trim() });
    if (existingBlog) return res.status(400).json({ message: "A blog post with this title already exists. Please choose a different title." });


    const newBlog = new Blog({
      title,
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

// get blog post by slug with populated tour data

exports.getBlogBySlug = async(req,res)=>{
    try {
        const blog = await Blog.findOne({ slug: req.params.slug }).populate('toursNearby');
        if (!blog) return res.status(404).json({ message: "Blog post not found." });
        res.status(200).json(blog);
    } catch (error) {
        res.status(500).json({ message: "Error fetching blog post.", error: error.message });
    }
}

// 4. Update Existing Record Properties
exports.updateBlog = async (req, res) => {
  try {
    const updates = { ...req.body };
    
    if (req.files) {
      if (req.files['mainImage']?.[0]) {
        updates.mainImage = await uploadBufferToCloud(req.files['mainImage'][0].buffer);
      }
      if (req.files['gallery']) {
        const structuralGallery = [];
        for (const file of req.files['gallery']) {
          const url = await uploadBufferToCloud(file.buffer);
          structuralGallery.push(url);
        }
        updates.gallery = structuralGallery;
      }
    }

    const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!updatedBlog) return res.status(404).json({ message: "Target document footprint not discovered." });
    
    res.status(200).json(updatedBlog);
  } catch (error) {
    res.status(400).json({ message: "Modification cycle error.", error: error.message });
  }
};

// 5. Delete Log Instance
exports.deleteBlog = async (req, res) => {
  try {
    const deletedBlog = await Blog.findByIdAndDelete(req.params.id);
    if (!deletedBlog) return res.status(404).json({ message: "Target log entry not discovered." });
    res.status(200).json({ message: "Record cleanly purged from database indexes." });
  } catch (error) {
    res.status(500).json({ message: "Purge process failed.", error: error.message });
  }
};

// 6. Flexible Open Comment Ingestion Endpoint
exports.addAnonymousComment = async (req, res) => {
  try {
    const { text, clientNickname } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ message: "Comment body text content cannot be blank." });

    const targetBlog = await Blog.findById(req.params.id);
    if (!targetBlog) return res.status(404).json({ message: "Blog parameter invalid." });

    // Fall back to structured name tag if no text nickname is provided
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

// 7. Open Like/Unlike Toggle (Using Device/Browser Fingerprint tracking)
exports.toggleBlogLike = async (req, res) => {
  try {
    const { clientId } = req.body;
    if (!clientId) return res.status(400).json({ message: "Unique identifier payload signature missing." });

    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Target log record missing." });

    const hasLiked = blog.likes.includes(clientId);

    if (hasLiked) {
      // Unlike state execution
      blog.likes = blog.likes.filter(id => id !== clientId);
    } else {
      // Like state execution
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