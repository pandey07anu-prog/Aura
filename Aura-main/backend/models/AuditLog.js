const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: String,
      required: true,
      index: true
    },
    adminEmail: {
      type: String,
      required: true
    },
    action: {
      type: String,
      required: true
    },
    targetUserId: {
      type: String,
      required: true,
      index: true
    },
    details: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    },
    ipAddress: {
      type: String,
      default: null
    },
    _class: {
      type: String,
      default: 'com.expensetracker.model.AuditLog'
    }
  },
  {
    collection: 'audit_logs',
    timestamps: false
  }
);

auditLogSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
