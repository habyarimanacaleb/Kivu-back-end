const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const verifyUserRole = require("../middleware/verifyUserRole");

router.post("/signup", userController.signup);
router.post("/login", userController.login);
router.post("/logout", userController.logout);
router.delete("/users/:id", userController.deleteUser);
router.put("/users/:id", userController.updateUser);
router.get("/confirm-email/:token", userController.confirmEmail);
router.get("/users", userController.getAllUsers);

// Example of a restricted endpoint
router.get("/restricted", verifyUserRole(["admin"]), userController.restricted);

module.exports = router;
