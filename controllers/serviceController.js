const Service = require("../models/Service");

// Create a new service
exports.createService = async (req, res) => {
  try {
    const { title, description, detailPage, details } = req.body;
    const imageFile = req.file ? `/uploads/${req.file.filename}` : null;

    const parsedDetails = {
      ...details,
      highlights: JSON.parse(details.highlights),
      tips: JSON.parse(details.tips),
    };

    const newService = new Service({
      title,
      description,
      detailPage,
      imageFile,
      details: parsedDetails,
    });
    await newService.save();

    res
      .status(201)
      .json({ message: "Service created successfully!", service: newService });
  } catch (error) {
    console.error("Error creating service:", error); // Log the error details
    res.status(500).json({ message: "Error creating service", error });
  }
};

// Get all services with pagination
exports.getAllServices = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const services = await Service.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const totalServices = await Service.countDocuments();
    const totalPages = Math.ceil(totalServices / limit);
    const currentPage = parseInt(page);

    res.json({
      services,
      totalPages,
      currentPage,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
    });
  } catch (error) {
console.error("Error fetching services:", error); // Log the error details
    res.status(500).json({ message: "Error fetching services", error });
  }
};

// Get a single service by ID
exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: "Service not found" });
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: "Error fetching service", error });
  }
};

// Update a service by ID
exports.updateServiceById = async (req, res) => {
  try {
    const { title, description, detailPage, details } = req.body;
    const imageFile = req.file ? `/uploads/${req.file.filename}` : null;

    const parsedDetails = {
      ...details,
      highlights: JSON.parse(details.highlights),
      tips: JSON.parse(details.tips),
    };

    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      { title, description, detailPage, imageFile, details: parsedDetails },
      { new: true }
    );

    if (!updatedService)
      return res.status(404).json({ message: "Service not found" });

    res.json({
      message: "Service updated successfully!",
      service: updatedService,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating service", error });
  }
};

// Delete a service by ID
exports.deleteServiceById = async (req, res) => {
  try {
    const deletedService = await Service.findByIdAndDelete(req.params.id);
    if (!deletedService)
      return res.status(404).json({ message: "Service not found" });

    res.json({ message: "Service deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting service", error });
  }
};

// Get detailed service info
exports.getServiceDetails = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: "Service not found" });

    res.json({
      service: {
        id: service._id,
        title: service.title,
        description: service.description,
        detailPage: service.detailPage,
        imageUrl: service.imageFile
          ? `http://localhost:${process.env.PORT || 5000}${service.imageFile}`
          : null,
        details: service.details,
      },
      message: "Here's the cool service info you requested!",
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching service details", error });
  }
};
