const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    summary: {
      type: String,
      default: '',
      maxlength: 500,
    },
    priority: {
      type: String,
      enum: ['urgent', 'normal', 'low'],
      default: 'normal',
    },
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'active', 'expired'],
      default: 'draft',
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    departmentIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
      },
    ],
    publishAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      required: [true, 'Expiry date is required'],
    },
    attachments: [
      {
        filename: String,
        originalName: String,
        mimetype: String,
        size: Number,
        url: String,
      },
    ],
    viewCount: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    category: {
      type: String,
      default: 'general',
      trim: true,
    },
    requiresAcknowledgement: {
      type: Boolean,
      default: false,
    },
    requiresCompletion: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for fast queries
announcementSchema.index({ organizationId: 1, status: 1, expiresAt: 1 });
announcementSchema.index({ organizationId: 1, createdAt: -1 });
announcementSchema.index({ title: 'text', content: 'text' });

// Virtual: check if expired
announcementSchema.virtual('isExpired').get(function () {
  return this.expiresAt && new Date() > this.expiresAt;
});

// Pre-save: auto-set status based on dates
announcementSchema.pre('save', function (next) {
  const now = new Date();

  if (this.expiresAt && now > this.expiresAt) {
    this.status = 'expired';
    this.isPublished = false;
  } else if (this.isPublished && this.publishAt && now < this.publishAt) {
    this.status = 'scheduled';
  } else if (this.isPublished) {
    this.status = 'active';
  }

  next();
});

module.exports = mongoose.model('Announcement', announcementSchema);
