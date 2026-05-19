const express = require("express");
const router = express.Router();

// Controller Destructuring Imports
const { 
  broadcastMessage, 
  updateLegalPolicies, 
  handleSecurityAction, 
  getActiveAlert
} = require("../controllers/governanceController");

// Authentication & Authorization Gate Middleware Imports
const authMiddleware = require("../middleware/authMiddleware");
const verifyUserRole = require("../middleware/verifyUserRole");

// =========================================================================
// ADMINISTRATIVE CORE GATES (Requires valid token session AND admin clearance)
// =========================================================================
router.get("/active-alert", authMiddleware, getActiveAlert);
// 📡 Real-time global messaging pipeline execution endpoint
router.post(
  "/broadcast", 
  authMiddleware, 
  verifyUserRole(["admin"]), 
  broadcastMessage
);

// 📝 Platform legal contract registry configuration update endpoint
router.put(
  "/legal-policies", 
  authMiddleware, 
  verifyUserRole(["admin"]), 
  updateLegalPolicies
);

// ⚡ Operational security scripts and log flushing execution gateway
router.post(
  "/security/:actionType", 
  authMiddleware, 
  verifyUserRole(["admin"]), 
  handleSecurityAction
);

module.exports = router;