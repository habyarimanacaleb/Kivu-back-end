const express = require('express');
const router = express.Router();
const uploadServiceImages = require('../middleware/uploadServiceImages');
const cardController = require('../controllers/cardsController');

router.post('/cards', uploadServiceImages.single('imageFile'), cardController.createCard);
router.get('/cards', cardController.getAllCards);

module.exports = router; // Ensure the router is exported