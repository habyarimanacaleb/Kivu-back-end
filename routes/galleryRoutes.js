const express = require("express");
const galleryController = require("../controllers/galleryController");
const upload = require("../middleware/upload");
const resizeTourImage = require("../middleware/resizeImage");

const router = express.Router();

router.post(
  "/",
  upload.single("imageFile"),
  resizeTourImage,
  galleryController.createGalleryCard
);
router.get("/", galleryController.getAllPhotos);
router.get("/:id", galleryController.getPhotoById);
router.put(
  "/:id",
  upload.single("imageFile"),
  resizeTourImage,
  galleryController.updateGalleryCard
);
router.delete("/:id", galleryController.deleteGalleryCard);

module.exports = router;
