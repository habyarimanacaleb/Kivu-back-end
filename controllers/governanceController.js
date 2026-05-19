import Governance from "../models/Governance.js";
import User from "../models/User.js"; // Assuming your User schema file path

// Helper to get or initialize the singular global governance settings doc
const getOrCreateSettings = async () => {
  let settings = await Governance.findOne();
  if (!settings) {
    settings = await Governance.create({
      legal: { terms: "# Terms", privacy: "# Privacy" }
    });
  }
  return settings;
};

// 📡 POST: Dispatch Bulk System Notification
export const broadcastMessage = async (req, res) => {
  try {
    const { title, text, scope } = req.body;
    
    if (!title || !text) {
      return res.status(400).json({ message: "Broadcast parameters incomplete." });
    }

    const settings = await getOrCreateSettings();
    
    // Log the event record in the database
    settings.broadcastLogs.push({
      title,
      text,
      scope,
      dispatchedBy: req.user?._id // Extracted from auth middleware
    });
    
    await settings.save();

    /* Note: Here you can plug in real dispatch drivers!
      e.g., await sendMassEmails(scope, title, text); 
      or sendSocketNotification(scope, { title, text });
    */

    res.status(200).json({ success: true, message: "System broadcast successfully dispatched." });
  } catch (error) {
    res.status(500).json({ message: "Internal server error during dispatch context.", error: error.message });
  }
};

// 📝 PUT: Modify Platform Legal Policies
export const updateLegalPolicies = async (req, res) => {
  try {
    const { terms, privacy } = req.body;
    const settings = await getOrCreateSettings();

    if (terms !== undefined) settings.legal.terms = terms;
    if (privacy !== undefined) settings.legal.privacy = privacy;
    settings.legal.updatedAt = Date.now();

    await settings.save();
    res.status(200).json({ success: true, message: "Legal framework updated." });
  } catch (error) {
    res.status(500).json({ message: "Failed to persist legal documents.", error: error.message });
  }
};

// ⚡ POST: Execute Operational Infrastructure Checks
export const handleSecurityAction = async (req, res) => {
  try {
    const { actionType } = req.params;
    const settings = await getOrCreateSettings();

    if (actionType === "toggle-mfa") {
      settings.securitySettings.mfaRequired = !settings.securitySettings.mfaRequired;
      await settings.save();
      
      return res.status(200).json({ 
        success: true, 
        message: `Dynamic MFA requirement set to: ${settings.securitySettings.mfaRequired}` 
      });
    }

    if (actionType === "flush-cache") {
      settings.securitySettings.lastCacheFlush = Date.now();
      await settings.save();
      
      // Implement specific cache purge commands here (e.g., Redis clear, file unlink)
      return res.status(200).json({ success: true, message: "Runtime memory buffer cleared successfully." });
    }

    res.status(400).json({ message: "Invalid security script command directive." });
  } catch (error) {
    res.status(500).json({ message: "Security operation transaction rejected.", error: error.message });
  }
};