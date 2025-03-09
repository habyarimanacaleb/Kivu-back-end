const Photo = require("../models/photo");
const upload = require("../middleware/upload");

/**
 * Create Gallery Card (Upload Image & Store Data)
 */
exports.createGalleryCard = async (req, res) => {
  try {
    const { title } = req.body;
    const imageUrl = req.file?.path; // Cloudinary URL

    console.log("Request Headers:", req.headers);
    console.log("Request Body:", req.body);
    console.log("Uploaded File:", req.file);

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
 * Get All Gallery Photos
 */
exports.getAllPhotos = async (req, res) => {
  try {
    const galleryCards = await Photo.find();
    res.status(200).json(galleryCards);
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
      // Delete old image from Cloudinary
      const oldImagePublicId = photo.imageFile.split("/").pop().split(".")[0];
      await upload.uploader.destroy(oldImagePublicId);

      // Assign new image URL
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
    // Remove from database
    await Photo.findByIdAndDelete(id);
    res.status(200).json({ message: "Gallery Card Deleted Successfully" });
  } catch (error) {
    console.error("Error deleting photo:", error);
    res.status(500).json({ message: "Server error" });
  }
};
