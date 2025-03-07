const Service = require("../models/Service");
const multer = require("multer");
const path = require("path");

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
}).single("imageFile");

const handleUpload = (req, res) => {
  return new Promise((resolve, reject) => {
    upload(req, res, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

exports.createService = async (req, res) => {
  try {
    await handleUpload(req, res);

    const { title, description, detailPage, details } = req.body;
    if (!title || !description || !detailPage || !details) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    let parsedDetails;
    if (typeof details === "string") {
      try {
        parsedDetails = JSON.parse(details);
      } catch (error) {
        return res
          .status(400)
          .json({ message: "Invalid JSON format for details" });
      }
    } else {
      parsedDetails = details;
    }
    if (
      !parsedDetails.highlights ||
      !Array.isArray(parsedDetails.highlights) ||
      !parsedDetails.tips ||
      !Array.isArray(parsedDetails.tips) ||
      !parsedDetails.whatsapp ||
      !parsedDetails.email
    ) {
      return res.status(400).json({ message: "Invalid details format" });
    }

    const existService = await Service.findOne({ title });
    if (existService) {
      return res.status(400).json({ message: "Service already exists" });
    }

    const newService = new Service({
      title,
      description,
      detailPage,
      details: parsedDetails,
      imageFile: req.file ? `/uploads/${req.file.originalname}` : null, // Correct path
    });

    await newService.save();
    res.status(201).json(newService);
  } catch (error) {
    console.error("Error creating service:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getAllServices = async (req, res) => {
  try {
    const services = await Service.find();
    res.status(200).json(services);
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }
    res.status(200).json(service);
  } catch (error) {
    console.error("Error fetching service:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateServiceById = async (req, res) => {
  try {
    await handleUpload(req, res);

    const { title, description, detailPage, details } = req.body;

    if (!title || !description || !detailPage || !details) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    let parsedDetails;
    if (typeof details === "string") {
      try {
        parsedDetails = JSON.parse(details);
      } catch (error) {
        return res
          .status(400)
          .json({ message: "Invalid JSON format for details" });
      }
    } else {
      parsedDetails = details;
    }

    if (
      !parsedDetails.highlights ||
      !Array.isArray(parsedDetails.highlights) ||
      !parsedDetails.tips ||
      !Array.isArray(parsedDetails.tips) ||
      !parsedDetails.whatsapp ||
      !parsedDetails.email
    ) {
      return res.status(400).json({ message: "Invalid details format" });
    }

    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        detailPage,
        details: parsedDetails,
        imageFile: req.file ? `/uploads/${req.file.originalname}` : undefined, // Correct path
      },
      { new: true }
    );

    if (!updatedService) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.status(200).json(updatedService);
  } catch (error) {
    console.error("Error updating service:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.deleteServiceById = async (req, res) => {
  try {
    const deletedService = await Service.findByIdAndDelete(req.params.id);
    if (!deletedService) {
      return res.status(404).json({ message: "Service not found" });
    }
    res.status(200).json({ message: "Service deleted successfully" });
  } catch (error) {
    console.error("Error deleting service:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
