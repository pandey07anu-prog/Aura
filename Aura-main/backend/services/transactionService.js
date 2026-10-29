const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Category = require('../models/Category');
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

function buildTransactionResponse(t) {
  const amount = t.amount != null ? parseFloat(t.amount.toString()) : 0;
  return {
    id: t._id.toString(),
    userId: t.userId,
    type: t.type,
    amount,
    category: t.category,
    date: formatDate(t.date),
    description: t.description,
    paymentMethod: t.paymentMethod,
    notes: t.notes || null,
    createdAt: t.createdAt ? t.createdAt.toISOString() : new Date().toISOString(),
    updatedAt: t.updatedAt ? t.updatedAt.toISOString() : new Date().toISOString()
  };
}

async function validateTransactionRequest(userId, request) {
  const amount = parseFloat(request.amount);
  if (isNaN(amount) || amount <= 0) {
    throw new BadRequestError('Amount must be strictly greater than zero');
  }

  if (!request.date) {
    throw new BadRequestError('Transaction date is required');
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

async function createTransaction(userId, request) {
  await validateTransactionRequest(userId, request);

  const amount = parseFloat(request.amount);
  const parsedDate = parseDateInput(request.date);

  const transaction = await Transaction.create({
    userId: userId.toString(),
    type: (request.type || 'EXPENSE').toUpperCase(),
    amount: mongoose.Types.Decimal128.fromString(amount.toFixed(2)),
    category: request.category.trim(),
    date: parsedDate,
    description: (request.description || '').trim(),
    paymentMethod: request.paymentMethod || 'CREDIT_CARD',
    notes: request.notes && request.notes.trim() ? request.notes.trim() : null,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  if (transaction.type === 'EXPENSE') {
    await budgetService.checkBudgetAlertsForTransaction(userId, transaction.category, transaction.date);
  }

  return buildTransactionResponse(transaction);
}

async function getTransactionById(id, userId) {
  const transaction = await Transaction.findOne({ _id: id, userId: userId.toString() });
  if (!transaction) {
    throw new NotFoundError(`Transaction not found with id: ${id}`);
  }
  return buildTransactionResponse(transaction);
}

async function updateTransaction(id, userId, request) {
  const transaction = await Transaction.findOne({ _id: id, userId: userId.toString() });
  if (!transaction) {
    throw new NotFoundError(`Transaction not found with id: ${id}`);
  }

  await validateTransactionRequest(userId, request);

  const amount = parseFloat(request.amount);
  const parsedDate = parseDateInput(request.date);

  transaction.type = (request.type || 'EXPENSE').toUpperCase();
  transaction.amount = mongoose.Types.Decimal128.fromString(amount.toFixed(2));
  transaction.category = request.category.trim();
  transaction.date = parsedDate;
  transaction.description = (request.description || '').trim();
  transaction.paymentMethod = request.paymentMethod || 'CREDIT_CARD';
  transaction.notes = request.notes && request.notes.trim() ? request.notes.trim() : null;
  transaction.updatedAt = new Date();

  await transaction.save();

  if (transaction.type === 'EXPENSE') {
    await budgetService.checkBudgetAlertsForTransaction(userId, transaction.category, transaction.date);
  }

  return buildTransactionResponse(transaction);
}

async function deleteTransaction(id, userId) {
  const transaction = await Transaction.findOne({ _id: id, userId: userId.toString() });
  if (!transaction) {
    throw new NotFoundError(`Transaction not found with id: ${id}`);
  }
  await Transaction.deleteOne({ _id: id });
}

async function getTransactions(
  userId,
  type = null,
  category = null,
  startDate = null,
  endDate = null,
  search = null,
  page = 0,
  size = 15,
  sortBy = 'date',
  direction = 'desc'
) {
  const query = { userId: userId.toString() };

  if (type) {
    query.type = type.toUpperCase();
  }

  if (category && category.trim()) {
    query.category = category.trim();
  }

  if (startDate && endDate) {
    const [sy, sm, sd] = startDate.split('-').map(Number);
    const [ey, em, ed] = endDate.split('-').map(Number);
    const start = new Date(sy, sm - 1, sd, 0, 0, 0, 0);
    const end = new Date(ey, em - 1, ed, 23, 59, 59, 999);
    query.date = { $gte: start, $lte: end };
  } else if (startDate) {
    const [sy, sm, sd] = startDate.split('-').map(Number);
    const start = new Date(sy, sm - 1, sd, 0, 0, 0, 0);
    query.date = { $gte: start };
  } else if (endDate) {
    const [ey, em, ed] = endDate.split('-').map(Number);
    const end = new Date(ey, em - 1, ed, 23, 59, 59, 999);
    query.date = { $lte: end };
  }

  if (search && search.trim()) {
    const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'i');
    query.$or = [{ description: regex }, { notes: regex }];
  }

  const pageNum = parseInt(page, 10) >= 0 ? parseInt(page, 10) : 0;
  const pageSize = parseInt(size, 10) > 0 ? parseInt(size, 10) : 15;

  const total = await Transaction.countDocuments(query);

  const sortOrder = direction && direction.toLowerCase() === 'asc' ? 1 : -1;
  const sortField = sortBy && sortBy.trim() ? sortBy.trim() : 'date';

  const sortObj = {};
  sortObj[sortField] = sortOrder;
  if (sortField === 'date') {
    sortObj.createdAt = -1;
  }

  const transactions = await Transaction.find(query)
    .sort(sortObj)
    .skip(pageNum * pageSize)
    .limit(pageSize);

  const content = transactions.map(buildTransactionResponse);
  const totalPages = Math.ceil(total / pageSize);

  return {
    content,
    pageable: {
      pageNumber: pageNum,
      pageSize: pageSize,
      sort: {
        sorted: true,
        unsorted: false,
        empty: false
      },
      offset: pageNum * pageSize,
      paged: true,
      unpaged: false
    },
    totalPages,
    totalElements: total,
    last: pageNum + 1 >= totalPages,
    size: pageSize,
    number: pageNum,
    sort: {
      sorted: true,
      unsorted: false,
      empty: false
    },
    numberOfElements: content.length,
    first: pageNum === 0,
    empty: content.length === 0
  };
}

async function getRecentTransactions(userId) {
  const transactions = await Transaction.find({ userId: userId.toString() })
    .sort({ date: -1, createdAt: -1 })
    .limit(10);

  return transactions.map(buildTransactionResponse);
}

module.exports = {
  createTransaction,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getTransactions,
  getRecentTransactions,
  parseDateInput,
  formatDate
};
