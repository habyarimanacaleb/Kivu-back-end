const express = require("express");
const serviceController = require("../controllers/serviceController");
const upload = require("../middleware/upload");
const router = express.Router();
router.post("/" , upload.single("imageFile") , serviceController.createService);
router.get("/", serviceController.getAllServices);
router.get('/images', serviceController.getServiceImages);
router.get("/:id", serviceController.getServiceById);
router.put("/:id", upload.single("imageFile") , serviceController.updateServiceById);
router.delete("/:id", serviceController.deleteServiceById);

module.exports = router;
