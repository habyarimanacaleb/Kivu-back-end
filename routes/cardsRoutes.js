const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const cardController = require('../controllers/cardsController');

router.post('/cards', upload.single('imageFile'), cardController.createCard);
router.get('/cards', cardController.getAllCards);

module.exports = router; // Ensure the router is exported