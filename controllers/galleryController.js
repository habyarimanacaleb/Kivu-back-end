const photoService = require('../services/photoService');

exports.createGalleryCard = async (req, res) => {
  try {
    const { title } = req.body;

    // Validate required fields
    if (!title) {
      return res.status(400).json({ message: 'Title field is required.' });
    }

    // Validate uploaded file
    if (!req.file) {
      return res.status(400).json({ message: 'Image file is required.' });
    }

    // Save the photo information to the database using the service
    const photo = await photoService.createPhoto(title, req.file.filename);

    res.status(201).json(photo);
  } catch (error) {
    console.error('Error creating gallery card:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllPhotos = async (req, res) => {
  try {
    const gallery = await photoService.getAllPhotos();
    if (!gallery) {
      return res.status(404).json({ message: 'Gallery not found' });
    }
    res.status(200).json(gallery);
  } catch (error) {
    console.error('Error fetching photos:', error);
    res.status(500).json({ message: 'Server error' });
  }
};