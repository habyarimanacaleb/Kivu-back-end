const Service = require("../models/Service");
const { sendEmail } = require('../controllers/emailController');

exports.createService = async (req, res) => {
  try {
    const { title, description, detailPage, details } = req.body;
        if (!title || !description || !detailPage || !details) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const parsedDetails = typeof details === "string" 
      ? JSON.parse(details) 
      : details;

    if (!Array.isArray(parsedDetails?.highlights) || 
        !Array.isArray(parsedDetails?.tips) ||
        !parsedDetails?.whatsapp || 
        !parsedDetails?.email) {
      return res.status(400).json({ message: "Invalid details format" });
    }

    const exists = await Service.exists({ title }).lean();
    if (exists) {
      return res.status(400).json({ message: "Service already exists" });
    }

    const newService = await Service.create({
      title,
      description,
      detailPage,
      details: parsedDetails,
      imageFile: req.file?.path || null,
    });
    sendEmail(
      process.env.ADMIN_EMAIL || 'admin@example.com',
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
    ).catch(err => console.error("Email failed:", err));
    await newService.save();
    return res.status(201).json(newService);
  } catch (error) {
    console.error("Error creating service:", error);
    return res.status(500).json({ 
      message: error.name === 'SyntaxError' 
        ? "Invalid JSON format" 
        : "Internal server error" 
    });
  }
};
exports.getAllServices = async (req, res) => {
  try {
    const services = await Service.find()
      .select('title description detailPage imageFile')
      .lean()
      .exec();
      
    return res.status(200).json(services);
  } catch (error) {
    console.error("Error fetching services:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
exports.getServiceImages = async (req, res) => {
  try {
    const images = await Service.find({ imageFile: { $ne: null } })
      .select('imageFile')
      .lean()
      .exec();

    return res.status(200).json({
      success: true,
      message: "Service images retrieved successfully",
      data: images.map(image => image.imageFile)
    });

  } catch (error) {
    console.error("Error fetching service images:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};


exports.getServiceById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid service ID' });
  }

  try {
    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.status(200).json(service);
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateServiceById = async (req, res) => {
  try {
    await handleUpload(req, res);

    const { title, description, detailPage, details } = req.body;

    if (!title || !description || !detailPage || !details) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const parsedDetails = typeof details === "string" 
      ? JSON.parse(details) 
      : details;
    if (!Array.isArray(parsedDetails?.highlights) || 
        !Array.isArray(parsedDetails?.tips) ||
        !parsedDetails?.whatsapp || 
        !parsedDetails?.email) {
      return res.status(400).json({ message: "Invalid details format" });
    }
    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          title,
          description,
          detailPage,
          details: parsedDetails,
          ...(req.file && { imageFile: req.file.path })
        }
      },
      { 
        new: true,
        runValidators: true,
        lean: true 
      }
    ).exec();

    if (!updatedService) {
      return res.status(404).json({ message: "Service not found" });
    }

    return res.status(200).json(updatedService);
  } catch (error) {
    console.error("Error updating service:", error);
    return res.status(500).json({ 
      message: error.name === 'ValidationError' 
        ? "Validation failed" 
        : "Internal server error" 
    });
  }
};

exports.deleteServiceById = async (req, res) => {
  try {
    // Direct deletion without fetching first
    const result = await Service.deleteOne({ _id: req.params.id }).exec();
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Service not found" });
    }
    
    return res.status(200).json({ message: "Service deleted successfully" });
  } catch (error) {
    console.error("Error deleting service:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};