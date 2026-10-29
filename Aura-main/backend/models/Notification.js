const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['BUDGET_WARNING', 'BUDGET_EXCEEDED', 'RECURRING_EXECUTED', 'SYSTEM'],
      default: 'SYSTEM'
    },
    isRead: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    _class: {
      type: String,
      default: 'com.expensetracker.model.Notification'
    }
  },
  {
    collection: 'notifications',
    timestamps: false
  }
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

notificationSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Notification', notificationSchema);
