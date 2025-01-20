const express = require('express');
const router = express.Router();
const uploadPhotoImages = require('../middleware/uploadgalleryImages');
const galleryController = require('../controllers/galleryController');

router.post('/', uploadPhotoImages.single('imageFile'), galleryController.createGalleryCard);
router.get('/', galleryController.getAllPhotos);

module.exports = router;