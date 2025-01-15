const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const galleryController = require('../controllers/galleryController');

router.post('/gallery', upload.single('imageFile'), galleryController.createGalleryCard);
router.get('/gallery', galleryController.getAllPhotos);

module.exports = router;