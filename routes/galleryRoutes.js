const express = require('express');
const router = express.Router();
const uploadPhotoImages = require('../middleware/uploadgalleryImages');
const galleryController = require('../controllers/galleryController');

router.post('/gallery', uploadPhotoImages.single('imageFile'), galleryController.createGalleryCard);
router.get('/gallery', galleryController.getAllPhotos);

module.exports = router;