const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const verifyUserRole = require("../middleware/verifyUserRole");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/signup", userController.signup);
router.post("/login", userController.login);
router.post("/logout", userController.logout);
router.put("/user/:id", userController.updateUserProfile);
router.delete("/user/:id",authMiddleware, userController.deleteUser);
router.patch("/user/:id/block", userController.blockOrUnblockUser);
router.get("/users", userController.getAllUsers);
router.get("/user/:id", userController.getUserById);
router.get("/confirm-email/:token", userController.confirmEmail);
router.get("/session", userController.getSessionData);
router.get("/profile", authMiddleware, userController.getUserProfile);
router.get("/restricted", verifyUserRole(["admin"]), userController.restricted);


module.exports = router;
