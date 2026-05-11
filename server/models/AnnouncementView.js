const mongoose = require('mongoose');

const announcementViewSchema = new mongoose.Schema(
  {
    announcementId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Announcement',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    viewedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

// Each user can only have one view record per announcement
announcementViewSchema.index({ announcementId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('AnnouncementView', announcementViewSchema);
