const cron = require('node-cron');
const Announcement = require('../models/Announcement');

// Run every minute: publish scheduled announcements
const startSchedulerJob = () => {
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const result = await Announcement.updateMany(
        { status: 'scheduled', publishAt: { $lte: now }, expiresAt: { $gt: now }, isPublished: true },
        { status: 'active' }
      );
      if (result.modifiedCount > 0) {
        console.log(`🚀 Published ${result.modifiedCount} scheduled announcements`);
      }
    } catch (error) {
      console.error('Scheduler job error:', error.message);
    }
  });
  console.log('📅 Scheduler cron job started (every minute)');
};

module.exports = startSchedulerJob;
