const express = require("express");
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/profile", authMiddleware, userController.getUserProfile);
router.put("/profile", authMiddleware, userController.updateUserProfile);
router.delete("/profile", authMiddleware, userController.deleteUser);

// Add the route for email confirmation
router.get("/confirm-email/:token", userController.confirmEmail);

module.exports = router;
