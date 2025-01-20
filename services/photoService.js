const Photo = require('../models/photo');

exports.createPhoto = async (title, description, filename) => {
  const imageUrl = `/uploads/gallery/${filename}`;
  const newPhoto = new Photo({
    title,
    description,
    imageUrl,
  });

  await newPhoto.save();
  return newPhoto;
};

exports.getAllPhotos = async () => {
  const photos = await Photo.find();
  return photos;
};