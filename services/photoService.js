const Photo = require('../models/galleryModel');

exports.createPhoto = async (title, filename) => {
  const photo = new Photo({
    title,
    imagePath: `/uploads/gallery/${filename}`
  });

  await photo.save();
  return photo;
};

exports.getAllPhotos = async () => {
  const gallery = await Photo.find();
  return gallery;
};