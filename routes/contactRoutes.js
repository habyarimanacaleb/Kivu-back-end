const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contactController");

router.post("/contact", contactController.createContact);
router.get("/contacts", contactController.getAllContacts);
router.post("/respond", contactController.respondToContact);
router.delete("/:id", verifyToken, contactController.deleteContact);
router.delete("/", verifyToken, contactController.deleteAllContacts); 

module.exports = router;
