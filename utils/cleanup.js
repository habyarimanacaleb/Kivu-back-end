const cron = require("node-cron");
const User = require("../models/userModel");

// Run every day at midnight
cron.schedule("0 0 * * *", async () => {
  try {
    const result = await User.deleteMany({
      isConfirmed: false,
      confirmationExpires: { $lt: new Date() },
    });
    console.log(`🧹 Cleaned up ${result.deletedCount} unconfirmed expired users`);
  } catch (error) {
    console.error("Cleanup error:", error);
  }
});
