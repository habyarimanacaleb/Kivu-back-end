import mongoose from "mongoose";

const GovernanceSchema = new mongoose.Schema(
  {
    // Holds the global terms & privacy policies
    legal: {
      terms: { type: String, default: "" },
      privacy: { type: String, default: "" },
      updatedAt: { type: Date, default: Date.now }
    },
    // Monitors dynamic server feature flags
    securitySettings: {
      mfaRequired: { type: Boolean, default: false },
      lastCacheFlush: { type: Date }
    },
    // Historical record log of all admin bulk dispatches
    broadcastLogs: [
      {
        title: { type: String, required: true },
        text: { type: String, required: true },
        scope: { type: String, enum: ["all", "clients", "admins"], default: "all" },
        dispatchedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        createdAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("Governance", GovernanceSchema);