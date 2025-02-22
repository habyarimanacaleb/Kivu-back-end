const express = require("express");
const multer = require("multer");
const serviceController = require("../controllers/serviceController");
const router = express.Router();
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });
router.post("/", upload.single("imageFile"), serviceController.createService);
router.get("/", serviceController.getAllServices);
router.get("/:id", serviceController.getServiceById);
router.put(
  "/:id",
  upload.single("imageFile"),
  serviceController.updateServiceById
);
router.delete("/:id", serviceController.deleteServiceById);
router.get("/:id/details", serviceController.getServiceDetails);
module.exports = router;
