const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      default: null,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['EXPENSE', 'INCOME'],
      default: 'EXPENSE',
      required: true
    },
    icon: {
      type: String,
      default: 'tag'
    },
    color: {
      type: String,
      default: '#FFFFFF'
    },
    isSystem: {
      type: Boolean,
      default: false
    },
    isArchived: {
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
      default: 'com.expensetracker.model.Category'
    }
  },
  {
    collection: 'categories',
    timestamps: false
  }
);

categorySchema.index({ userId: 1, name: 1 });
categorySchema.index({ userId: 1, type: 1 });

categorySchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Category', categorySchema);
