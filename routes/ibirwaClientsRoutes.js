const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const verifyUserRole = require("../middleware/verifyUserRole");

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

const ibirwaClientsController = require("../controllers/ibirwaClientsController");

router.get("/", ibirwaClientsController.getAllClients);
router.get("/:id", ibirwaClientsController.getClientById);
router.post("/", ibirwaClientsController.createClient);
router.put("/:id", ibirwaClientsController.updateClientById);
router.delete("/:id", ibirwaClientsController.deleteClientById);

const serviceController = require("../controllers/serviceController");

// Update a service by ID
router.put("/api/services/:id", serviceController.updateServiceById);

module.exports = router;
