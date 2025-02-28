const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const verifyUserRole = require("../middleware/verifyUserRole");
const serviceController = require("../controllers/serviceController");

router.post("/signup", userController.signup);
router.post("/login", userController.login);
router.post("/logout", userController.logout);
router.delete("/users/:id", userController.deleteUser);
router.put("/users/:id", userController.updateUserProfile);
router.get("/confirm-email/:token", userController.confirmEmail);
router.get("/users", userController.getAllUsers);
router.get("/session", userController.getSessionData);

// Example of a restricted endpoint
router.get("/restricted", verifyUserRole(["admin"]), userController.restricted);

// Update a service by ID
router.put("/api/services/:id", serviceController.updateServiceById);

module.exports = router;
