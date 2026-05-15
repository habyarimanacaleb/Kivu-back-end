const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// Middleware Imports
const authMiddleware = require("../middleware/authMiddleware");
const verifyUserRole = require("../middleware/verifyUserRole");

// --- Public Authentication Pipelines ---
router.post("/signup", userController.signup);
router.post("/login", userController.login);
router.get("/confirm-email/:token", userController.confirmEmail);

// --- Authenticated User Operations (Requires valid token) ---
router.post("/logout", authMiddleware, userController.logout);
router.get("/session", authMiddleware, userController.getSessionData);
router.get("/profile", authMiddleware, userController.getUserProfile);
router.put("/user/:id", authMiddleware, userController.updateUserProfile); 
router.delete("/user/:id", authMiddleware, userController.deleteUser);

// --- Administrative Core Gates (Requires valid token AND admin role) ---
router.get("/users", authMiddleware, verifyUserRole(["admin"]), userController.getAllUsers);
router.get("/user/:id", authMiddleware, verifyUserRole(["admin"]), userController.getUserById);
router.patch("/user/:id/block", authMiddleware, verifyUserRole(["admin"]), userController.blockOrUnblockUser);
router.get("/restricted", authMiddleware, verifyUserRole(["admin"]), userController.restricted);

module.exports = router;