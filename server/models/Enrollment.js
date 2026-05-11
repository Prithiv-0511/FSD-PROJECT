const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema(
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
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'acknowledged', 'completed'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Ensure a user can only have one enrollment per announcement
enrollmentSchema.index({ announcementId: 1, userId: 1 }, { unique: true });
enrollmentSchema.index({ organizationId: 1, announcementId: 1 });

module.exports = mongoose.model('Enrollment', enrollmentSchema);
