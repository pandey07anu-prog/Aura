const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true
    },
    name: {
      type: String,
      default: null
    },
    category: {
      type: String,
      required: true
    },
    monthlyLimit: {
      type: mongoose.Schema.Types.Decimal128,
      required: true
    },
    month: {
      type: Number,
      required: true
    },
    year: {
      type: Number,
      required: true
    },
    alertThreshold: {
      type: Number,
      default: 80.0
    },
    lastAlertSentAt: {
      type: Date,
      default: null
    },
    alertSentForThreshold: {
      type: Boolean,
      default: false
    },
    alertSentForExceeded: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    _class: {
      type: String,
      default: 'com.expensetracker.model.Budget'
    }
  },
  {
    collection: 'budgets',
    timestamps: false
  }
);

budgetSchema.index({ userId: 1, category: 1, month: 1, year: 1 }, { unique: true });

budgetSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    if (ret.monthlyLimit != null) {
      ret.monthlyLimit = parseFloat(ret.monthlyLimit.toString());
    }
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Budget', budgetSchema);
