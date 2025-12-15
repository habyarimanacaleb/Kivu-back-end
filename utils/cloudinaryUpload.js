const cloudinary = require("../utils/cloudinary");

const uploadToCloudinary = (buffer, folder = "kivu/services") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
};

module.exports = uploadToCloudinary;
