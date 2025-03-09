const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer-Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "kivu-images/", // Cloudinary folder
    format: async (req, file) => "jpg", // Convert images to JPG
    public_id: (req, file) => file.originalname.split(".")[0], // Keep original name
  },
});

const upload = multer({ storage });

module.exports = upload;
