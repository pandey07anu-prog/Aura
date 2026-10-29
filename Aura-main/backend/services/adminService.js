const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Category = require('../models/Category');
const RecurringTransaction = require('../models/RecurringTransaction');
const AuditLog = require('../models/AuditLog');
const notificationService = require('./notificationService');
const { buildUserSummary } = require('./authService');
const { BadRequestError, NotFoundError } = require('../middleware/errorHandler');

function formatDate(d) {
  if (!d) return null;
  const dateObj = new Date(d);
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

async function getDashboardSummary() {
  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({ status: 'ACTIVE' });
  const suspendedUsers = await User.countDocuments({ status: 'SUSPENDED' });

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const newUsersThisMonth = await User.countDocuments({ createdAt: { $gte: startOfMonth } });

  const totalTransactions = await Transaction.countDocuments();
  const totalCategoriesCount = await Category.countDocuments();
  const totalActiveRecurringRules = await RecurringTransaction.countDocuments({ status: 'ACTIVE' });

  const allTransactions = await Transaction.find({}, 'type amount');
  let aggregateIncomeVolume = 0;
  let aggregateExpenseVolume = 0;

  for (const t of allTransactions) {
    if (t.amount == null) continue;
    const amt = parseFloat(t.amount.toString());
    if (t.type === 'INCOME') aggregateIncomeVolume += amt;
    else if (t.type === 'EXPENSE') aggregateExpenseVolume += amt;
  }

  return {
    totalUsers,
    activeUsers,
    suspendedUsers,
    newUsersThisMonth,
    totalTransactions,
    aggregateIncomeVolume: parseFloat(aggregateIncomeVolume.toFixed(2)),
    aggregateExpenseVolume: parseFloat(aggregateExpenseVolume.toFixed(2)),
    totalCategoriesCount,
    totalActiveRecurringRules
  };
}

async function getAllUsers(role = null, status = null, search = null, page = 0, size = 15, sortBy = 'createdAt', direction = 'desc') {
  const query = {};

  if (role) {
    query.role = role.toUpperCase();
  }

  if (status) {
    query.status = status.toUpperCase();
  }

  if (search && search.trim()) {
    const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'i');
    query.$or = [{ fullName: regex }, { email: regex }];
  }

  const pageNum = parseInt(page, 10) >= 0 ? parseInt(page, 10) : 0;
  const pageSize = parseInt(size, 10) > 0 ? parseInt(size, 10) : 15;

  const total = await User.countDocuments(query);

  const sortOrder = direction && direction.toLowerCase() === 'asc' ? 1 : -1;
  const sortField = sortBy && sortBy.trim() ? sortBy.trim() : 'createdAt';
  const sortObj = {};
  sortObj[sortField] = sortOrder;

  const users = await User.find(query)
    .sort(sortObj)
    .skip(pageNum * pageSize)
    .limit(pageSize);

  const content = users.map(buildUserSummary);
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

async function getUserDetails(userId) {
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError(`User not found with id: ${userId}`);
  }

  const transactions = await Transaction.find({ userId: userId.toString() });

  let totalIncome = 0;
  let totalExpenses = 0;
  const categoryExpenses = new Map();

  for (const t of transactions) {
    if (t.amount == null) continue;
    const amt = parseFloat(t.amount.toString());
    if (t.type === 'INCOME') {
      totalIncome += amt;
    } else if (t.type === 'EXPENSE') {
      totalExpenses += amt;
      const cat = t.category;
      categoryExpenses.set(cat, (categoryExpenses.get(cat) || 0) + amt);
    }
  }

  totalIncome = parseFloat(totalIncome.toFixed(2));
  totalExpenses = parseFloat(totalExpenses.toFixed(2));
  const currentBalance = parseFloat((totalIncome - totalExpenses).toFixed(2));

  // Top categories
  const topCategories = [];
  for (const [catName, amt] of categoryExpenses.entries()) {
    const roundAmt = parseFloat(amt.toFixed(2));
    const pct = totalExpenses > 0 ? parseFloat(((roundAmt / totalExpenses) * 100).toFixed(2)) : 0.0;
    topCategories.push({
      category: catName,
      type: 'EXPENSE',
      amount: roundAmt,
      percentage: pct,
      count: 0,
      icon: 'tag',
      color: '#FFFFFF'
    });
  }
  topCategories.sort((a, b) => b.amount - a.amount);

  // Recent transactions
  const recent = await Transaction.find({ userId: userId.toString() })
    .sort({ date: -1, createdAt: -1 })
    .limit(10);

  const recentTransactions = recent.map((t) => ({
    id: t._id.toString(),
    userId: t.userId,
    type: t.type,
    amount: parseFloat(t.amount.toString()),
    category: t.category,
    date: formatDate(t.date),
    description: t.description,
    paymentMethod: t.paymentMethod,
    notes: t.notes || null,
    createdAt: t.createdAt ? t.createdAt.toISOString() : null,
    updatedAt: t.updatedAt ? t.updatedAt.toISOString() : null
  }));

  const auditLogs = await AuditLog.find({ targetUserId: userId.toString() }).sort({ timestamp: -1 });

  return {
    user: buildUserSummary(user),
    totalIncome,
    totalExpenses,
    currentBalance,
    transactionCount: transactions.length,
    topCategories: topCategories.slice(0, 5),
    recentTransactions,
    auditLogs
  };
}

async function updateUserStatus(targetUserId, request, adminId, adminEmail, ipAddress) {
  const user = await User.findById(targetUserId);
  if (!user) {
    throw new NotFoundError(`User not found with id: ${targetUserId}`);
  }

  const newStatus = (request.status || '').toUpperCase();
  if (!['ACTIVE', 'SUSPENDED'].includes(newStatus)) {
    throw new BadRequestError('Status is required (ACTIVE or SUSPENDED)');
  }

  if (user.role === 'ROLE_ADMIN' && newStatus === 'SUSPENDED') {
    throw new BadRequestError('Administrator accounts cannot be suspended');
  }

  const oldStatus = user.status;
  user.status = newStatus;
  user.updatedAt = new Date();
  await user.save();

  // Audit log
  await AuditLog.create({
    adminId: adminId.toString(),
    adminEmail,
    action: `USER_STATUS_CHANGE_${newStatus}`,
    targetUserId: targetUserId.toString(),
    details: `Changed status from ${oldStatus} to ${newStatus}. Reason: ${request.reason || 'None specified'}`,
    timestamp: new Date(),
    ipAddress: ipAddress || null
  });

  // User notification
  await notificationService.createNotification(
    targetUserId.toString(),
    'Account Status Updated',
    `Your account status has been changed to ${newStatus} by an administrator.`,
    'SYSTEM'
  );

  return buildUserSummary(user);
}

async function getRecentAuditLogs() {
  return await AuditLog.find().sort({ timestamp: -1 }).limit(20);
}

module.exports = {
  getDashboardSummary,
  getAllUsers,
  getUserDetails,
  updateUserStatus,
  getRecentAuditLogs
};
