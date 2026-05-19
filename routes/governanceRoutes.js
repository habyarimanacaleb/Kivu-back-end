import express from "express";
import { 
  broadcastMessage, 
  updateLegalPolicies, 
  handleSecurityAction 
} from "../controllers/governanceController.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js"; 
// Note: Ensure your core protect/isAdmin validation handlers match your server configuration

const router = express.Router();

// Apply authorization gate guards across all endpoint entries
router.use(protect);
router.use(isAdmin);

// Mapping routes to controller operations
router.post("/broadcast", broadcastMessage);
router.put("/legal-policies", updateLegalPolicies);
router.post("/security/:actionType", handleSecurityAction);

export default router;