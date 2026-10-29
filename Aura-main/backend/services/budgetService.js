const mongoose = require('mongoose');
const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const Category = require('../models/Category');
const User = require('../models/User');
const notificationService = require('./notificationService');
const emailService = require('./emailService');
const { BadRequestError, ConflictError, NotFoundError } = require('../middleware/errorHandler');

function buildBudgetResponse(budget, spent) {
  const limit = budget.monthlyLimit ? parseFloat(budget.monthlyLimit.toString()) : 0;
  const spentVal = parseFloat(spent.toFixed(2));
  const remaining = Math.max(0, parseFloat((limit - spentVal).toFixed(2)));
  const percentageUsed = limit > 0 ? parseFloat(((spentVal / limit) * 100).toFixed(2)) : 0.0;
  const alertThreshold = budget.alertThreshold != null ? budget.alertThreshold : 80.0;

  return {
    id: budget._id.toString(),
    name: budget.name,
    category: budget.category,
    monthlyLimit: limit,
    spent: spentVal,
    remaining,
    percentageUsed,
    isOverBudget: spentVal > limit,
    isNearThreshold: percentageUsed >= alertThreshold,
    month: budget.month,
    year: budget.year,
    alertThreshold
  };
}

async function calculateSpentForCategoryAndMonth(userId, category, month, year) {
  const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const end = new Date(year, month, 0, 23, 59, 59, 999);

  const transactions = await Transaction.find({
    userId: userId.toString(),
    category: category.trim(),
    type: 'EXPENSE',
    date: { $gte: start, $lte: end }
  });

  let total = 0;
  for (const t of transactions) {
    if (t.amount != null) {
      total += parseFloat(t.amount.toString());
    }
  }
  return total;
}

async function validateCategoryExists(userId, categoryName) {
  const trimmed = categoryName.trim();
  const exists = await Category.findOne({
    name: { $regex: new RegExp(`^${trimmed}$`, 'i') },
    $or: [{ userId: userId.toString() }, { isSystem: true }]
  });
  if (!exists) {
    throw new BadRequestError(`Category '${trimmed}' does not exist`);
  }
}

async function checkAndNotifyBudget(budget, spent) {
  const limit = budget.monthlyLimit ? parseFloat(budget.monthlyLimit.toString()) : 0;
  if (limit <= 0) return;

  const percent = (spent / limit) * 100;
  let updated = false;

  if (spent > limit && !budget.alertSentForExceeded) {
    budget.alertSentForExceeded = true;
    budget.alertSentForThreshold = true;
    budget.lastAlertSentAt = new Date();
    updated = true;

    await notificationService.createNotification(
      budget.userId,
      `Budget Exceeded: ${budget.category}`,
      `You have exceeded your monthly limit for ${budget.category}. Spent: $${spent.toFixed(2)}, Limit: $${limit.toFixed(2)}.`,
      'BUDGET_EXCEEDED'
    );

    const user = await User.findById(budget.userId);
    if (user) {
      emailService.sendBudgetExceededEmail(
        user.email,
        user.fullName,
        budget.category,
        spent.toFixed(2),
        limit.toFixed(2)
      );
    }
  } else if (percent >= budget.alertThreshold && !budget.alertSentForThreshold && spent <= limit) {
    budget.alertSentForThreshold = true;
    budget.lastAlertSentAt = new Date();
    updated = true;

    await notificationService.createNotification(
      budget.userId,
      `Budget Warning: ${budget.category}`,
      `You have used ${percent.toFixed(1)}% of your budget for ${budget.category} ($${spent.toFixed(2)} / $${limit.toFixed(2)}).`,
      'BUDGET_WARNING'
    );

    const user = await User.findById(budget.userId);
    if (user) {
      emailService.sendBudgetWarningEmail(
        user.email,
        user.fullName,
        budget.category,
        spent.toFixed(2),
        limit.toFixed(2),
        percent
      );
    }
  }

  if (updated) {
    budget.updatedAt = new Date();
    await budget.save();
  }
}

async function getBudgetsForUser(userId, month, year) {
  const now = new Date();
  const targetMonth = month && month >= 1 && month <= 12 ? parseInt(month, 10) : now.getMonth() + 1;
  const targetYear = year && year >= 2000 ? parseInt(year, 10) : now.getFullYear();

  const budgets = await Budget.find({
    userId: userId.toString(),
    month: targetMonth,
    year: targetYear
  });

  const responseList = [];
  for (const b of budgets) {
    const spent = await calculateSpentForCategoryAndMonth(userId, b.category, targetMonth, targetYear);
    responseList.push(buildBudgetResponse(b, spent));
  }

  return responseList;
}

async function getBudgetById(id, userId) {
  const budget = await Budget.findOne({ _id: id, userId: userId.toString() });
  if (!budget) {
    throw new NotFoundError(`Budget not found with id: ${id}`);
  }

  const spent = await calculateSpentForCategoryAndMonth(userId, budget.category, budget.month, budget.year);
  return buildBudgetResponse(budget, spent);
}

async function createBudget(userId, request) {
  const category = (request.category || '').trim();
  if (!category) throw new BadRequestError('Category is required');
  await validateCategoryExists(userId, category);

  const now = new Date();
  const month = request.month >= 1 && request.month <= 12 ? parseInt(request.month, 10) : now.getMonth() + 1;
  const year = request.year >= 2000 ? parseInt(request.year, 10) : now.getFullYear();
  const monthlyLimit = parseFloat(request.monthlyLimit);

  if (isNaN(monthlyLimit) || monthlyLimit <= 0) {
    throw new BadRequestError('Monthly limit must be greater than zero');
  }

  const existing = await Budget.findOne({
    userId: userId.toString(),
    category: { $regex: new RegExp(`^${category}$`, 'i') },
    month,
    year
  });

  if (existing) {
    throw new ConflictError(`A budget for category '${category}' in ${String(month).padStart(2, '0')}/${year} already exists`);
  }

  const alertThreshold = request.alertThreshold && request.alertThreshold > 0 ? parseFloat(request.alertThreshold) : 80.0;
  const name = request.name && request.name.trim() ? request.name.trim() : `${category} Budget`;

  const budget = await Budget.create({
    userId: userId.toString(),
    name,
    category,
    monthlyLimit: mongoose.Types.Decimal128.fromString(monthlyLimit.toFixed(2)),
    month,
    year,
    alertThreshold,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  const spent = await calculateSpentForCategoryAndMonth(userId, category, month, year);
  await checkAndNotifyBudget(budget, spent);

  return buildBudgetResponse(budget, spent);
}

async function updateBudget(id, userId, request) {
  const budget = await Budget.findOne({ _id: id, userId: userId.toString() });
  if (!budget) {
    throw new NotFoundError(`Budget not found with id: ${id}`);
  }

  const category = (request.category || '').trim();
  if (!category) throw new BadRequestError('Category is required');
  await validateCategoryExists(userId, category);

  const month = request.month >= 1 && request.month <= 12 ? parseInt(request.month, 10) : budget.month;
  const year = request.year >= 2000 ? parseInt(request.year, 10) : budget.year;
  const monthlyLimit = parseFloat(request.monthlyLimit);

  if (isNaN(monthlyLimit) || monthlyLimit <= 0) {
    throw new BadRequestError('Monthly limit must be greater than zero');
  }

  if (
    budget.category.toLowerCase() !== category.toLowerCase() ||
    budget.month !== month ||
    budget.year !== year
  ) {
    const existing = await Budget.findOne({
      _id: { $ne: budget._id },
      userId: userId.toString(),
      category: { $regex: new RegExp(`^${category}$`, 'i') },
      month,
      year
    });
    if (existing) {
      throw new ConflictError(`A budget for category '${category}' in ${String(month).padStart(2, '0')}/${year} already exists`);
    }
  }

  budget.name = request.name && request.name.trim() ? request.name.trim() : `${category} Budget`;
  budget.category = category;
  budget.monthlyLimit = mongoose.Types.Decimal128.fromString(monthlyLimit.toFixed(2));
  budget.month = month;
  budget.year = year;
  budget.alertThreshold = request.alertThreshold && request.alertThreshold > 0 ? parseFloat(request.alertThreshold) : 80.0;
  budget.updatedAt = new Date();

  await budget.save();

  const spent = await calculateSpentForCategoryAndMonth(userId, category, month, year);
  await checkAndNotifyBudget(budget, spent);

  return buildBudgetResponse(budget, spent);
}

async function deleteBudget(id, userId) {
  const budget = await Budget.findOne({ _id: id, userId: userId.toString() });
  if (!budget) {
    throw new NotFoundError(`Budget not found with id: ${id}`);
  }
  await Budget.deleteOne({ _id: id });
}

async function checkBudgetAlertsForTransaction(userId, category, date) {
  const dateObj = new Date(date);
  const month = dateObj.getMonth() + 1;
  const year = dateObj.getFullYear();

  const budget = await Budget.findOne({
    userId: userId.toString(),
    category: { $regex: new RegExp(`^${category.trim()}$`, 'i') },
    month,
    year
  });

  if (budget) {
    const spent = await calculateSpentForCategoryAndMonth(userId, category, month, year);
    await checkAndNotifyBudget(budget, spent);
  }
}

module.exports = {
  getBudgetsForUser,
  getBudgetById,
  createBudget,
  updateBudget,
  deleteBudget,
  checkBudgetAlertsForTransaction,
  calculateSpentForCategoryAndMonth
};
