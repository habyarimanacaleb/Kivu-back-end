const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const verifyUserRole = require("../middleware/verifyUserRole");

router.post("/signup", userController.signup);
router.post("/login", userController.login);
router.post("/logout", userController.logout);
router.get("/confirm/:token", userController.confirmEmail); // Ensure this route is defined

// Example of a restricted endpoint
router.get("/restricted", verifyUserRole(["admin"]), userController.restricted);

module.exports = router;
