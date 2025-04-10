const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const verifyUserRole = require("../middleware/verifyUserRole");
const authMiddleware = require("../middleware/authMiddleware");


router.post("/signup", userController.signup);
router.post("/confirm-email", userController.confirmEmail);
router.post("/login", userController.login);
router.post("/logout", userController.logout);
router.put("/users/:id", userController.updateUserProfile);
router.put("/profile", authMiddleware, userController.updateUserProfile);
router.delete("/users/:id", userController.deleteUser);
router.delete("/profile", authMiddleware, userController.deleteUser);
router.get("/users", userController.getAllUsers);
router.get("/confirm-email/:token", userController.confirmEmail);
router.get("/session", userController.getSessionData);
router.get("/profile", authMiddleware, userController.getUserProfile);
router.get("/restricted", verifyUserRole(["admin"]), userController.restricted);


module.exports = router;
