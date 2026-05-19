const mongoose = require('mongoose');

const GovernanceSchema = new mongoose.Schema(
  {
    legal: {
      terms: { type: String, default: "" },
      privacy: { type: String, default: "" },
      updatedAt: { type: Date, default: Date.now }
    },
    securitySettings: {
      mfaRequired: { type: Boolean, default: false },
      lastCacheFlush: { type: Date }
    },
    broadcastLogs: [
      {
        title: { type: String, required: true },
        text: { type: String, required: true },
        scope: { type: String, enum: ["all", "clients", "admins"], default: "all" },
        isActiveAlert: { type: Boolean, default: true }, // 👉 Track current live status for widgets
        dispatchedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        createdAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Governance", GovernanceSchema);