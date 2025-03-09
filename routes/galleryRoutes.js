const express = require("express");
const galleryController = require("../controllers/galleryController");
const upload = require("../middleware/upload");

const router = express.Router();

router.post(
  "/",
  upload.single("imageFile"),
  galleryController.createGalleryCard
);
router.get("/", galleryController.getAllPhotos);
router.get("/:id", galleryController.getPhotoById);
router.put(
  "/:id",
  upload.single("imageFile"),
  galleryController.updateGalleryCard
);
router.delete("/:id", galleryController.deleteGalleryCard);

module.exports = router;
