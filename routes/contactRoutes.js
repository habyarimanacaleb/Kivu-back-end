const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contactController");
const verifyToken = require("../middleware/verifyUserRole");



router.post("/contact", contactController.createContact);
router.get("/contacts", contactController.getAllContacts);
router.post("/contact/respond",verifyToken(["admin"]), contactController.respondToContact);
router.delete("/contact/:id", verifyToken(["admin"]), contactController.deleteContact);
router.delete("/contacts/", verifyToken(["admin"]), contactController.deleteAllContacts); 

module.exports = router;
