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
router.post("/services", serviceController.createService);
router.get("/services", serviceController.getAllServices);
router.get("/services/:id", serviceController.getServiceById);
router.put("/services/:id", serviceController.updateServiceById);
router.delete("/services/:id", serviceController.deleteServiceById);
// router.get("/:id/details", serviceController.getServiceDetails);
module.exports = router;
