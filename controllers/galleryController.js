const Photo = require("../models/photo");
const upload = require("../middleware/upload");

/**
 * Create Gallery Card (Upload Image & Store Data)
 */
exports.createGalleryCard = async (req, res) => {
  try {
    const { title } = req.body;
    const imageUrl = req.file?.path;

    // Validate required fields
    if (!title || !imageUrl) {
      return res
        .status(400)
        .json({ message: "Missing required fields: title and imageUrl" });
    }

    // Validate uploaded file
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }
    if (req.file.size > 5 * 1024 * 1024) {
      return res
        .status(400)
        .json({ message: "File size too large (Max: 5MB)" });
    }

    // Create new gallery card
    const newCard = new Photo({ title, imageFile: imageUrl });
    await newCard.save();

    res.status(201).json({
      message: "Gallery Card Created!",
      gallery: newCard,
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating gallery card", error });
  }
};

/**
 * Get All Gallery Photos with Filters & Pagination
 */
exports.getAllPhotos = async (req, res) => {
  try {
    const { page = 1, limit = 10, title, showAll } = req.query;
    const query = {};

    if (title) {
      query.title = { $regex: title, $options: "i" };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const photos =
      showAll === "true"
        ? await Photo.find(query).sort({ createdAt: -1 })
        : await Photo.find(query)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

    const total = await Photo.countDocuments(query);

    res.status(200).json({
      page: showAll === "true" ? 1 : parseInt(page),
      limit: showAll === "true" ? total : parseInt(limit),
      total,
      totalPages: showAll === "true" ? 1 : Math.ceil(total / limit),
      results: photos,
    });
  } catch (error) {
    console.error("Error fetching photos:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get Single Photo by ID
 */
exports.getPhotoById = async (req, res) => {
  try {
    const { id } = req.params;
    const photo = await Photo.findById(id);

    if (!photo) {
      return res.status(404).json({ message: "Photo not found" });
    }

    res.status(200).json(photo);
  } catch (error) {
    console.error("Error fetching photo:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Update Gallery Card by ID
 */
exports.updateGalleryCard = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    const photo = await Photo.findById(id);
    if (!photo) {
      return res.status(404).json({ message: "Photo not found" });
    }

    // Update title if provided
    if (title) {
      photo.title = title;
    }

    // Handle new image upload
    if (req.file) {
      // Extract Cloudinary public ID from the URL
      const oldImagePublicId = photo.imageFile
        .split("/")
        .pop()
        .split(".")[0];

      try {
        // Remove previous image from cloudinary
        await upload.uploader.destroy(oldImagePublicId);
      } catch (err) {
        console.warn("Failed to delete previous image from Cloudinary:", err);
      }

      // Assign new uploaded image
      photo.imageFile = req.file.path;
    }

    await photo.save();

    res.status(200).json({ message: "Gallery Card Updated!", photo });
  } catch (error) {
    res.status(500).json({ message: "Error updating gallery card", error });
  }
};

/**
 * Delete Gallery Card by ID
 */
exports.deleteGalleryCard = async (req, res) => {
  try {
    const { id } = req.params;
    const photo = await Photo.findById(id);

    if (!photo) {
      return res.status(404).json({ message: "Photo not found" });
    }

    // Delete image from Cloudinary
    try {
      const publicId = photo.imageFile.split("/").pop().split(".")[0];
      await upload.uploader.destroy(publicId);
    } catch (err) {
      console.warn("Failed to delete image from Cloudinary:", err);
    }

    await Photo.findByIdAndDelete(id);
    res.status(200).json({ message: "Gallery Card Deleted Successfully" });
  } catch (error) {
    console.error("Error deleting photo:", error);
    res.status(500).json({ message: "Server error" });
  }
};
