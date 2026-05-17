const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contactController");
const verifyToken = require("../middleware/verifyUserRole");



router.post("/contact", contactController.createContact);
router.get("/contacts", contactController.getAllContacts);
router.post("/respond",verifyToken(["admin"]), contactController.respondToContact);
router.delete("/:id", verifyToken(["admin"]), contactController.deleteContact);
router.delete("/", verifyToken(["admin"]), contactController.deleteAllContacts); 

module.exports = router;
