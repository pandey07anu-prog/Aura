const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ['INCOME', 'EXPENSE'],
      default: 'EXPENSE',
      required: true
    },
    amount: {
      type: mongoose.Schema.Types.Decimal128,
      required: true
    },
    category: {
      type: String,
      required: true,
      index: true
    },
    date: {
      type: Date,
      required: true,
      index: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    paymentMethod: {
      type: String,
      enum: ['CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'UPI', 'OTHER'],
      default: 'CREDIT_CARD',
      required: true
    },
    notes: {
      type: String,
      default: null
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
      default: 'com.expensetracker.model.Transaction'
    }
  },
  {
    collection: 'transactions',
    timestamps: false
  }
);

transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, type: 1 });
transactionSchema.index({ userId: 1, category: 1 });

function formatDate(d) {
  if (!d) return null;
  const dateObj = new Date(d);
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

transactionSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    if (ret.amount != null) {
      ret.amount = parseFloat(ret.amount.toString());
    }
    if (ret.date) {
      ret.date = formatDate(ret.date);
    }
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Transaction', transactionSchema);
