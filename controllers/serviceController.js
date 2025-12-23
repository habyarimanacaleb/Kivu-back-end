const Service = require("../models/Service");
const { sendEmail } = require("../controllers/emailController");
const uploadToCloudinary = require("../utils/cloudinaryUpload");

exports.createService = async (req, res) => {
  try {
    const { title, description, detailPage,highlights,tips,whatsapp,email } = req.body;

    if (!title || !description || !highlights || !tips || !whatsapp || !email) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const parsedDetails = {
      highlights: Array.isArray(highlights)
        ? highlights
        : JSON.parse(highlights),

      tips: Array.isArray(tips) ? tips : JSON.parse(tips),
      whatsapp,
      email,
    };

    const exists = await Service.exists({ title }).lean();
    if (exists) {
      return res.status(400).json({ message: "Service already exists" });
    }

     let imageUrl = null;
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      imageUrl = result.secure_url;
    }

    const newService = await Service.create({
      title,
      description,
      detailPage,
      details: parsedDetails,
      imageFile: imageUrl,
    });

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
    console.log("Email sent successfully");

    // email sent to admin
    console.log("Service created successfully:", newService);
    return res.status(201).json(newService);
  } catch (error) {
    if (req.file?.path) {
      const publicId = req.file?.path.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`services/${publicId}`);
    }

    console.error("Error creating service:", error);
    return res.status(500).json({
      message:
        error.name === "SyntaxError"
          ? "Invalid JSON format"
          : "Internal server error",
    });
  }
};

exports.getAllServices = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [services, total] = await Promise.all([
      Service.find()
        .select("title description details imageFile")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: 1 })
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

exports.getServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findById(id)
      .select("title description detailPage details imageFile")
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

exports.updateServiceById = async (req, res) => {
  try {
    const updateData = {};

    // Update only provided fields
    if (req.body.title) updateData.title = req.body.title;
    if (req.body.description) updateData.description = req.body.description;
    if (req.body.detailPage) updateData.detailPage = req.body.detailPage;

    // Handle details only if provided
    if (req.body.details) {
      const parsedDetails =
        typeof req.body.details === "string"
          ? JSON.parse(req.body.details)
          : req.body.details;

      if (
        !Array.isArray(parsedDetails?.highlights) ||
        !Array.isArray(parsedDetails?.tips) ||
        !parsedDetails?.whatsapp ||
        !parsedDetails?.email
      ) {
        return res.status(400).json({ message: "Invalid details format" });
      }

      updateData.details = parsedDetails;
    }

    // Handle image upload
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      updateData.imageFile = result.secure_url;
    }

    // Prevent empty update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No fields provided for update" });
    }

    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      {
        new: true,
        runValidators: true,
        lean: true,
      }
    ).exec();

    if (!updatedService) {
      return res.status(404).json({ message: "Service not found" });
    }
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    return res.status(200).json(updatedService);
  } catch (error) {
    console.error("Error updating service:", error);

    return res.status(500).json({
      message:
        error.name === "SyntaxError"
          ? "Invalid JSON format"
          : "Internal server error",
    });
  }
};

exports.deleteServiceById = async (req, res) => {
  try {
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
