const express = require("express");
const serviceController = require("../controllers/serviceController");
const upload = require("../middleware/upload");
const verifyAdmin = require("../middleware/adminAuth");
const router = express.Router();
const resizeTourImage = require("../middleware/resizeImage");

const serviceUploadFields = upload.fields([
  { name: "imageFile", maxCount: 1 },
  { name: "gallery", maxCount: 5 }
]);

// Publicly viewable
router.get("/", serviceController.getAllServices);
router.get('/images', serviceController.getServiceImages);
router.get("/:id", serviceController.getServiceById);

// Secured Administrative Control Gates
router.post("/", verifyAdmin, serviceUploadFields,resizeTourImage, serviceController.createService);
router.put("/:id", verifyAdmin, serviceUploadFields, resizeTourImage, serviceController.updateServiceById);
router.delete("/:id", verifyAdmin, serviceController.deleteServiceById);

module.exports = router;