const sharp = require('sharp');

const resizeTourImage = async (req, res, next) => {
  // If no file was uploaded, skip to the next controller
  if (!req.file) return next();

  try {
    // 🚀 Compress and resize the image buffer in memory
    const optimizedBuffer = await sharp(req.file.buffer)
      .resize({ width: 1200, height: 800, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80 }) // Converts to optimized progressive JPEG
      .toBuffer();

    // Replace the massive raw buffer with our tiny, optimized buffer
    req.file.buffer = optimizedBuffer;
    
    next();
  } catch (error) {
    console.error("Image processing error:", error);
    return res.status(500).json({ message: "Failed to process image style metrics." });
  }
};

module.exports = resizeTourImage;