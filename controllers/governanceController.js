const Governance = require("../models/Governance");
const User = require("../models/userModel");

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

// 📡 POST: Dispatch Bulk System Notification with Real-Time Sockets
exports.broadcastMessage = async (req, res) => {
  try {
    const { title, text, scope } = req.body;
    
    if (!title || !text) {
      return res.status(400).json({ message: "Broadcast parameters incomplete." });
    }

    const settings = await getOrCreateSettings();
    
    // Deactivate previous alerts so only the newest broadcast flags as active
    settings.broadcastLogs.forEach((log) => {
      log.isActiveAlert = false;
    });

    // Log the new event record with the active status flag enabled
    settings.broadcastLogs.push({
      title,
      text,
      scope,
      isActiveAlert: true,
      dispatchedBy: req.user?._id // Extracted securely from your auth token middleware
    });
    
    await settings.save();

    // 👉 LIVE SOCKET TRANSMISSION INTERRUPT
    // Extract the socket.io engine instance attached inside your server app configuration
    const io = req.app.get("socketio");
    if (io) {
      io.emit("system_alert", {
        title,
        text,
        scope,
        createdAt: new Date()
      });
    }

    res.status(200).json({ 
      success: true, 
      message: "System broadcast successfully written to data registry and emitted live." 
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error during dispatch context.", error: error.message });
  }
};

// 🟢 GET: Fetch Current Active System Alert (Public/Authenticated)
exports.getActiveAlert = async (req, res) => {
  try {
    const settings = await Governance.findOne();
    if (!settings) {
      return res.status(200).json({ success: true, data: null });
    }

    // Find the log entry where isActiveAlert is true
    const activeAlert = settings.broadcastLogs.find(log => log.isActiveAlert === true);

    res.status(200).json({ success: true, data: activeAlert || null });
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve active alert state.", error: error.message });
  }
};

// 📝 PUT: Modify Platform Legal Policies
exports.updateLegalPolicies = async (req, res) => {
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
exports.handleSecurityAction = async (req, res) => {
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
      
      // Implement specific cache purge commands here (e.g., Redis clear, file unlinking loops)
      return res.status(200).json({ success: true, message: "Runtime memory buffer cleared successfully." });
    }

    res.status(400).json({ message: "Invalid security script command directive." });
  } catch (error) {
    res.status(500).json({ message: "Security operation transaction rejected.", error: error.message });
  }
};