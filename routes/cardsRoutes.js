// const express = require('express');
// const router = express.Router();
// const multer = require('multer');
// const uploadServiceImages = require('../middleware/uploadServiceImages');
// const cardController = require('../controllers/cardsController');

// router.post('/cards', uploadServiceImages.single('imageFile'), cardController.createCard);
// router.get('/cards', cardController.getAllCards);

// module.exports = router; // Ensure the router is exported


const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const cardSchema = new mongoose.Schema({
    title: String,
    description: String,
    imagePath: String,
  });
  const Card = mongoose.model('Card', cardSchema);
  
  // Multer configuration for file uploads
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, './uploads'),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
  });
  const upload = multer({ storage });
  
  // Routes
  // 1. Post form data
  router.post('/cards', upload.single('image'), async (req, res) => {
    try {
      const { title, description } = req.body;
      if (!title || !description || !req.file) {
        return res.status(400).json({ message: 'All fields are required.' });
      }
  
      const card = new Card({
        title,
        description,
        imagePath: `/uploads/cards/${req.file.filename}`,
      });
      await card.save();
      res.status(201).json(card);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  });
  
  // 2. Get cards data
  router.get('/cards', async (req, res) => {
    try {
      const cards = await Card.find();
      res.status(200).json(cards);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  });

  module.exports = router; // Ensure the router is exported