const photoService = require('../services/photoService');

exports.createGalleryCard = async (req, res) => {
  try {
    const { title, description } = req.body;

    // Validate required fields
    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required.' });
    }

    // Validate uploaded file
    if (!req.file) {
      return res.status(400).json({ message: 'Image file is required.' });
    }

    // Save the photo information to the database using the service
    const newPhoto = await photoService.createPhoto(title, description, req.file.filename);

    res.status(201).json({ message: 'Photo created successfully', photo: newPhoto });
  } catch (error) {
    console.error('Error creating photo:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllPhotos = async (req, res) => {
  try {
    const photos = await photoService.getAllPhotos();
    res.status(200).json(photos);
  } catch (error) {
    console.error('Error fetching photos:', error);
    res.status(500).json({ message: 'Server error' });
  }
};