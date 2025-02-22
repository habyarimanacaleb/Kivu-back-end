const express = require("express");
const router = express.Router();
const uploadServiceImages = require("../middleware/uploadServiceImages");
const cardController = require("../controllers/cardsController");

router.post(
  "/",
  uploadServiceImages.single("imageFile"),
  cardController.createCard
);
router.get("/", cardController.getAllCards);

module.exports = router;
