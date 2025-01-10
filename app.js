const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// app.use('/uploads/gallery', express.static(path.join(__dirname, 'uploads/gallery')));
// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads');
    // cb(null, 'uploads/gallery');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Card model
const Card = require('./models/cards');

// Route to handle card creation
app.post('/api/cards', upload.single('imageFile'), async (req, res) => {
  try {
    const { title, description, detailPage } = req.body;

    // Validate required fields
    if (!title || !description || !detailPage) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Validate uploaded file
    if (!req.file) {
      return res.status(400).json({ message: 'Image file is required.' });
    }

    // Construct the image URL
    const imageUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;

    // Create and save the new card
    const newCard = new Card({
      title,
      description,
      detailPage,
      imageUrl,
    });

    await newCard.save();
    res.status(201).json({ message: 'Card created successfully', card: newCard });
  } catch (error) {
    console.error('Error creating card:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Gallery model
const Photo = require('./models/galleryModel'); // Ensure the correct path and export

// Route to handle gallery card creation
app.post('/api/gallery', upload.single('imageFile'), async (req, res) => {
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

    // Construct the image URL
    const imageUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;

    // Create and save the new photo
    const newPhoto = new Photo({
      title,
      imageUrl,
    });

    await newPhoto.save();
    res.status(201).json({ message: 'Photo created successfully', photo: newPhoto });
  } catch (error) {
    console.error('Error creating photo:', error);
    res.status(500).json({ message: 'Server error, unable to create photo' });
  }
});

// Route to handle fetching all cards
app.get('/api/cards', async (req, res) => {
  try {
    const cards = await Card.find();
    res.status(200).json(cards);
  } catch (error) {
    console.error('Error fetching cards:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
// Route to handle fetching all photo
app.get('/api/gallery', async (req, res) => {
  try {
    const gallery = await Photo.find();
    if (!gallery) {
      return res.status(404).json({ message: 'Gallery not found' });
    }
    res.status(200).json(gallery);
  } catch (error) {
    console.error('Error fetching cards:', error);
    res.status(500).json({ message: 'Server error' })
  }
});

// Start the server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
