const cron = require('node-cron');
const Announcement = require('../models/Announcement');

// Run every minute: check for expired announcements
const startExpiryJob = () => {
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const result = await Announcement.updateMany(
        { expiresAt: { $lte: now }, status: { $ne: 'expired' } },
        { status: 'expired', isPublished: false }
      );
      if (result.modifiedCount > 0) {
        console.log(`⏰ Expired ${result.modifiedCount} announcements`);
      }
    } catch (error) {
      console.error('Expiry job error:', error.message);
    }
  });
  console.log('📅 Expiry cron job started (every minute)');
};

module.exports = startExpiryJob;
