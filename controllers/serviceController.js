const Service = require("../models/Service");
const { sendEmail } = require("../controllers/emailController");
const uploadToCloudinary = require("../utils/cloudinaryUpload");
const cloudinary = require("cloudinary").v2;

// Helper to extract Cloudinary Public ID from a secure URL for cleanup operations
const extractPublicId = (url) => {
  if (!url) return null;
  const parts = url.split('/');
  const fileName = parts[parts.length - 1];
  const [id] = fileName.split('.');
  // If your files upload into a specific folder, handle it here (e.g., `services/${id}`)
  return id;
};

// 1. Create a New Service with Grid Gallery Elements
exports.createService = async (req, res) => {
  try {
    const { title, description, detailPage, highlights, tips, whatsapp, email } = req.body;

    if (!title || !description || !highlights || !tips || !whatsapp || !email) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Dynamic extraction parsing for nested multi-string properties
    const parsedDetails = {
      highlights: Array.isArray(highlights) ? highlights : JSON.parse(highlights),
      tips: Array.isArray(tips) ? tips : JSON.parse(tips),
      whatsapp,
      email,
    };

    const exists = await Service.exists({ title }).lean();
    if (exists) {
      return res.status(400).json({ message: "Service already exists" });
    }

    let imageUrl = null;
    let galleryUrls = [];

    // Process single hero cover file via multi-fields format mapping
    if (req.files && req.files['imageFile']?.[0]) {
      const result = await uploadToCloudinary(req.files['imageFile'][0].buffer);
      imageUrl = result.secure_url;
    }

    // Process multiple asset files inside the gallery pipeline cleanly
    if (req.files && req.files['gallery']) {
      const galleryFiles = Array.isArray(req.files['gallery']) ? req.files['gallery'] : [req.files['gallery']];
      for (const file of galleryFiles) {
        const result = await uploadToCloudinary(file.buffer);
        galleryUrls.push(result.secure_url);
      }
    }

    const newService = await Service.create({
      title,
      description,
      detailPage,
      details: parsedDetails,
      imageFile: imageUrl,
      gallery: galleryUrls
    });

    const io = req.app.get("socketio");
    io.emit("newService", newService);

    await newService.save();
    // Alert dispatch execution
    sendEmail(
      process.env.ADMIN_EMAIL || "admin@example.com",
      `New Service Created: ${newService.title}`,
      `A new service "${newService.title}" has been created.`,
      `
        <h1>New Service Created</h1>
        <p>A new service has been added:</p>
        <ul>
          <li><strong>Title:</strong> ${newService.title}</li>
          <li><strong>Description:</strong> ${newService.description}</li>
          <li><strong>Detail Page:</strong> ${newService.detailPage}</li>
        </ul>
      `
    ).catch((err) => console.error("Email failed:", err));

    return res.status(201).json(newService);
  } catch (error) {
    console.error("Error creating service:", error);
    return res.status(500).json({
      message: error.name === "SyntaxError" ? "Invalid JSON format" : "Internal server error",
    });
  }
};

// 2. Fetch Paginated Summary Sets
exports.getAllServices = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 18;
    const skip = (page - 1) * limit;

    const [services, total] = await Promise.all([
      Service.find()
        .select("title description details imageFile gallery") 
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean()
        .exec(),
      Service.countDocuments(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      currentPage: page,
      totalPages,
      totalServices: total,
      services,
    });
  } catch (error) {
    console.error("Error fetching services:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// 3. Extract All Banner Artifact Links
exports.getServiceImages = async (req, res) => {
  try {
    const images = await Service.find({ imageFile: { $ne: null } })
      .select("imageFile")
      .lean()
      .sort({ createdAt: -1 })
      .exec();

    return res.status(200).json({
      success: true,
      message: "Service images retrieved successfully",
      data: images.map((image) => image.imageFile),
    });
  } catch (error) {
    console.error("Error fetching service images:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// 4. Extract Complete Target Entry Properties
exports.getServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findById(id)
      .select("title description detailPage details imageFile gallery") 
      .lean();

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    return res.status(200).json(service);
  } catch (error) {
    console.error("Error fetching service:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// 5. Mutate Existing Service Object Fields Safely
exports.updateServiceById = async (req, res) => {
  try {
    const updateData = {};

    // Map standard textual fields
    if (req.body.title) updateData.title = req.body.title;
    if (req.body.description) updateData.description = req.body.description;
    if (req.body.detailPage) updateData.detailPage = req.body.detailPage;

    // --- 🌟 FIXED: DYNAMIC PARSING FOR TIPS, HIGHLIGHTS, WHATSAPP, & EMAIL ---
    let finalDetails = {};

    // Fetch existing document to prevent overwriting missing fields
    const currentService = await Service.findById(req.params.id).lean();
    if (currentService && currentService.details) {
      finalDetails = { ...currentService.details };
    }

    // Scenario A: Frontend sent flat root values (e.g., formData.append('highlights', ...))
    if (req.body.highlights) {
      finalDetails.highlights = Array.isArray(req.body.highlights) 
        ? req.body.highlights 
        : JSON.parse(req.body.highlights);
    }
    if (req.body.tips) {
      finalDetails.tips = Array.isArray(req.body.tips) 
        ? req.body.tips 
        : JSON.parse(req.body.tips);
    }
    if (req.body.whatsapp) finalDetails.whatsapp = req.body.whatsapp;
    if (req.body.email) finalDetails.email = req.body.email;

    // Scenario B: Frontend sent nested structured details stringified or as an object
    if (req.body.details) {
      const parsedDetails = typeof req.body.details === "string" 
        ? JSON.parse(req.body.details) 
        : req.body.details;
      
      finalDetails = { ...finalDetails, ...parsedDetails };
    }

    // Only commit onto the payload update parameters if fields exist
    if (Object.keys(finalDetails).length > 0) {
      updateData.details = finalDetails;
    }
    // -------------------------------------------------------------------------

    // Process modified structural cover image replacement strings
    if (req.files && req.files['imageFile']?.[0]) {
      const result = await uploadToCloudinary(req.files['imageFile'][0].buffer);
      updateData.imageFile = result.secure_url;
    }

    // Safely reconstruct the gallery without losing existing entries
    let finalGallery = [];
    
    // Parse retained images sent back from frontend state
    if (req.body.existingGallery) {
      try {
        finalGallery = typeof req.body.existingGallery === "string" 
          ? JSON.parse(req.body.existingGallery) 
          : req.body.existingGallery;
      } catch (e) {
        finalGallery = Array.isArray(req.body.existingGallery) ? req.body.existingGallery : [req.body.existingGallery];
      }
    } else if (currentService && currentService.gallery) {
      finalGallery = [...currentService.gallery];
    }

    // Append newly uploaded file buffers on top of preserved assets
    if (req.files && req.files['gallery']) {
      const galleryFiles = Array.isArray(req.files['gallery']) ? req.files['gallery'] : [req.files['gallery']];
      
      for (const file of galleryFiles) {
        const result = await uploadToCloudinary(file.buffer);
        finalGallery.push(result.secure_url);
      }
    }

    // Only assign to update payload if either fresh files came in OR old files were altered
    if (req.body.existingGallery || (req.files && req.files['gallery'])) {
      updateData.gallery = finalGallery;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No fields provided for update" });
    }

    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true, lean: true }
    );

    if (!updatedService) {
      return res.status(404).json({ message: "Service not found" });
    }

    return res.status(200).json(updatedService);
  } catch (error) {
    console.error("Error updating service:", error);
    return res.status(500).json({
      message: error.name === "SyntaxError" ? "Invalid JSON format" : "Internal server error",
    });
  }
};

// 6. Purge Service Entry Instance and its Assets from Cloudinary
exports.deleteServiceById = async (req, res) => {
  try {
    // 🌟 FIX 2: Find document first to read hosted URLs before deleting
    const service = await Service.findById(req.params.id).lean();
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Purge Hero Cover out of Cloudinary bucket
    if (service.imageFile) {
      const publicId = extractPublicId(service.imageFile);
      if (publicId) await cloudinary.uploader.destroy(publicId).catch(err => console.error("Cloudinary wipe failed:", err));
    }

    // Loop and clean up complete gallery layout matrix array
    if (service.gallery && service.gallery.length > 0) {
      for (const url of service.gallery) {
        const publicId = extractPublicId(url);
        if (publicId) await cloudinary.uploader.destroy(publicId).catch(err => console.error("Cloudinary gallery item wipe failed:", err));
      }
    }

    await Service.deleteOne({ _id: req.params.id }).exec();
    return res.status(200).json({ message: "Service and associated media assets cleared successfully" });
  } catch (error) {
    console.error("Error deleting service:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};