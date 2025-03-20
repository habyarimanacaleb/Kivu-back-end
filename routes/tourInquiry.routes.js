const express = require("express");
const router = express.Router();
const tourInquiryController = require("../controllers/tourInquiryController");

router.post("/", tourInquiryController.createInquiry);
router.get("/", tourInquiryController.getAllInquiries);
router.get("/:id", tourInquiryController.getInquiryById);
router.put("/:id", tourInquiryController.updateInquiry);
router.delete("/:id", tourInquiryController.deleteInquiry);
router.post("/respond/:id", tourInquiryController.respondToInquiry);

module.exports = router;
