const Photo = require('../models/photo');

exports.createPhoto = async (title,filename) => {
  const imageUrl = `/uploads/gallery/${filename}`;
  const newPhoto = new Photo({
    title,
    imageUrl,
  });

  await newPhoto.save();
  return newPhoto;
};

exports.getAllPhotos = async () => {
  const photos = await Photo.find();
  return photos;
};