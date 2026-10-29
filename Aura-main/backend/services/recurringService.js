const mongoose = require('mongoose');
const RecurringTransaction = require('../models/RecurringTransaction');
const Transaction = require('../models/Transaction');
const Category = require('../models/Category');
const notificationService = require('./notificationService');
const budgetService = require('./budgetService');
const { BadRequestError, NotFoundError } = require('../middleware/errorHandler');

function formatDate(d) {
  if (!d) return null;
  const dateObj = new Date(d);
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseDateInput(dateInput) {
  if (!dateInput) return null;
  if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    const [y, m, d] = dateInput.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  return new Date(dateInput);
}

function buildRecurringResponse(r) {
  const amount = r.amount != null ? parseFloat(r.amount.toString()) : 0;
  return {
    id: r._id.toString(),
    userId: r.userId,
    type: r.type,
    amount,
    category: r.category,
    description: r.description,
    paymentMethod: r.paymentMethod,
    frequency: r.frequency,
    startDate: formatDate(r.startDate),
    endDate: r.endDate ? formatDate(r.endDate) : null,
    nextExecutionDate: formatDate(r.nextExecutionDate),
    lastExecutedDate: r.lastExecutedDate ? formatDate(r.lastExecutedDate) : null,
    status: r.status,
    createdAt: r.createdAt ? r.createdAt.toISOString() : new Date().toISOString(),
    updatedAt: r.updatedAt ? r.updatedAt.toISOString() : new Date().toISOString()
  };
}

async function validateRecurringRequest(userId, request) {
  const amount = parseFloat(request.amount);
  if (isNaN(amount) || amount <= 0) {
    throw new BadRequestError('Amount must be greater than zero');
  }

  if (!request.startDate) {
    throw new BadRequestError('Start date is required');
  }

  const startDate = parseDateInput(request.startDate);
  const endDate = request.endDate ? parseDateInput(request.endDate) : null;

  if (endDate && endDate < startDate) {
    throw new BadRequestError('End date cannot be earlier than start date');
  }

  const categoryName = (request.category || '').trim();
  if (!categoryName) {
    throw new BadRequestError('Category is required');
  }

  const exists = await Category.findOne({
    name: { $regex: new RegExp(`^${categoryName}$`, 'i') },
    $or: [{ userId: userId.toString() }, { isSystem: true }]
  });

  if (!exists) {
    throw new BadRequestError(`Category '${categoryName}' does not exist`);
  }
}

async function getRecurringForUser(userId) {
  const list = await RecurringTransaction.find({ userId: userId.toString() });
  return list.map(buildRecurringResponse);
}

async function getRecurringById(id, userId) {
  const recurring = await RecurringTransaction.findOne({ _id: id, userId: userId.toString() });
  if (!recurring) {
    throw new NotFoundError(`Recurring rule not found with id: ${id}`);
  }
  return buildRecurringResponse(recurring);
}

async function createRecurring(userId, request) {
  await validateRecurringRequest(userId, request);

  const startDate = parseDateInput(request.startDate);
  const endDate = request.endDate ? parseDateInput(request.endDate) : null;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const nextExecutionDate = startDate < today ? today : startDate;
  const amount = parseFloat(request.amount);

  const recurring = await RecurringTransaction.create({
    userId: userId.toString(),
    type: (request.type || 'EXPENSE').toUpperCase(),
    amount: mongoose.Types.Decimal128.fromString(amount.toFixed(2)),
    category: request.category.trim(),
    description: (request.description || '').trim(),
    paymentMethod: request.paymentMethod || 'BANK_TRANSFER',
    frequency: (request.frequency || 'MONTHLY').toUpperCase(),
    startDate,
    endDate,
    nextExecutionDate,
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date()
  });

  return buildRecurringResponse(recurring);
}

async function updateRecurring(id, userId, request) {
  const recurring = await RecurringTransaction.findOne({ _id: id, userId: userId.toString() });
  if (!recurring) {
    throw new NotFoundError(`Recurring rule not found with id: ${id}`);
  }

  await validateRecurringRequest(userId, request);

  const amount = parseFloat(request.amount);
  const startDate = parseDateInput(request.startDate);
  const endDate = request.endDate ? parseDateInput(request.endDate) : null;

  recurring.type = (request.type || 'EXPENSE').toUpperCase();
  recurring.amount = mongoose.Types.Decimal128.fromString(amount.toFixed(2));
  recurring.category = request.category.trim();
  recurring.description = (request.description || '').trim();
  recurring.paymentMethod = request.paymentMethod || 'BANK_TRANSFER';
  recurring.frequency = (request.frequency || 'MONTHLY').toUpperCase();
  recurring.startDate = startDate;
  recurring.endDate = endDate;
  recurring.updatedAt = new Date();

  await recurring.save();

  return buildRecurringResponse(recurring);
}

async function updateStatus(id, userId, status) {
  const recurring = await RecurringTransaction.findOne({ _id: id, userId: userId.toString() });
  if (!recurring) {
    throw new NotFoundError(`Recurring rule not found with id: ${id}`);
  }

  recurring.status = status.toUpperCase();
  recurring.updatedAt = new Date();
  await recurring.save();

  return buildRecurringResponse(recurring);
}

async function deleteRecurring(id, userId) {
  const recurring = await RecurringTransaction.findOne({ _id: id, userId: userId.toString() });
  if (!recurring) {
    throw new NotFoundError(`Recurring rule not found with id: ${id}`);
  }
  await RecurringTransaction.deleteOne({ _id: id });
}

function computeNextExecutionDate(currentDate, frequency) {
  const d = new Date(currentDate);
  if (frequency === 'WEEKLY') {
    d.setDate(d.getDate() + 7);
  } else if (frequency === 'YEARLY') {
    d.setFullYear(d.getFullYear() + 1);
  } else {
    // MONTHLY
    d.setMonth(d.getMonth() + 1);
  }
  return d;
}

async function processDueRecurringTransactions() {
  const now = new Date();
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const dueRules = await RecurringTransaction.find({
    status: 'ACTIVE',
    nextExecutionDate: { $lte: endOfToday }
  });

  let processedCount = 0;

  for (const rule of dueRules) {
    try {
      if (rule.endDate && endOfToday > rule.endDate) {
        rule.status = 'CANCELLED';
        rule.updatedAt = new Date();
        await rule.save();
        continue;
      }

      const executionDate = rule.nextExecutionDate;
      const startOfDay = new Date(executionDate.getFullYear(), executionDate.getMonth(), executionDate.getDate(), 0, 0, 0, 0);
      const endOfDay = new Date(executionDate.getFullYear(), executionDate.getMonth(), executionDate.getDate(), 23, 59, 59, 999);

      const existingTx = await Transaction.find({
        userId: rule.userId,
        category: rule.category,
        date: { $gte: startOfDay, $lte: endOfDay }
      });

      const ruleAmount = parseFloat(rule.amount.toString());
      const alreadyExecuted = existingTx.some(
        (t) =>
          parseFloat(t.amount.toString()) === ruleAmount &&
          t.description.includes(rule.description)
      );

      if (!alreadyExecuted) {
        const transaction = await Transaction.create({
          userId: rule.userId,
          type: rule.type,
          amount: rule.amount,
          category: rule.category,
          date: executionDate,
          description: `[Recurring] ${rule.description}`,
          paymentMethod: rule.paymentMethod,
          notes: `Automatically posted by AURA Recurring Scheduler (${rule.frequency})`,
          createdAt: new Date(),
          updatedAt: new Date()
        });

        processedCount++;

        if (transaction.type === 'EXPENSE') {
          await budgetService.checkBudgetAlertsForTransaction(rule.userId, transaction.category, transaction.date);
        }

        await notificationService.createNotification(
          rule.userId,
          `Recurring ${rule.type} Posted`,
          `Recurring transaction '${rule.description}' for $${ruleAmount.toFixed(2)} was automatically executed on ${formatDate(executionDate)}.`,
          'RECURRING_EXECUTED'
        );
      }

      rule.lastExecutedDate = executionDate;
      const nextDate = computeNextExecutionDate(executionDate, rule.frequency);
      rule.nextExecutionDate = nextDate;

      if (rule.endDate && nextDate > rule.endDate) {
        rule.status = 'CANCELLED';
      }

      rule.updatedAt = new Date();
      await rule.save();
    } catch (err) {
      console.error(`Error processing recurring transaction rule id: ${rule._id}`, err);
    }
  }

  return processedCount;
}

module.exports = {
  getRecurringForUser,
  getRecurringById,
  createRecurring,
  updateRecurring,
  updateStatus,
  deleteRecurring,
  processDueRecurringTransactions
};
