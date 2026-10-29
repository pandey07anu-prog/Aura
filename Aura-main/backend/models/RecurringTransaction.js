const mongoose = require('mongoose');

const recurringTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ['EXPENSE', 'INCOME'],
      default: 'EXPENSE',
      required: true
    },
    amount: {
      type: mongoose.Schema.Types.Decimal128,
      required: true
    },
    category: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    paymentMethod: {
      type: String,
      enum: ['CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'UPI', 'OTHER'],
      default: 'BANK_TRANSFER',
      required: true
    },
    frequency: {
      type: String,
      enum: ['WEEKLY', 'MONTHLY', 'YEARLY'],
      default: 'MONTHLY',
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      default: null
    },
    nextExecutionDate: {
      type: Date,
      required: true,
      index: true
    },
    lastExecutedDate: {
      type: Date,
      default: null
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'PAUSED', 'CANCELLED'],
      default: 'ACTIVE'
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
      default: 'com.expensetracker.model.RecurringTransaction'
    }
  },
  {
    collection: 'recurring_transactions',
    timestamps: false
  }
);

recurringTransactionSchema.index({ status: 1, nextExecutionDate: 1 });
recurringTransactionSchema.index({ userId: 1, status: 1 });

function formatDate(d) {
  if (!d) return null;
  const dateObj = new Date(d);
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

recurringTransactionSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    if (ret.amount != null) {
      ret.amount = parseFloat(ret.amount.toString());
    }
    if (ret.startDate) ret.startDate = formatDate(ret.startDate);
    if (ret.endDate) ret.endDate = formatDate(ret.endDate);
    if (ret.nextExecutionDate) ret.nextExecutionDate = formatDate(ret.nextExecutionDate);
    if (ret.lastExecutedDate) ret.lastExecutedDate = formatDate(ret.lastExecutedDate);
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('RecurringTransaction', recurringTransactionSchema);
