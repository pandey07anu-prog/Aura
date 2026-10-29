const Transaction = require('../models/Transaction');
const Category = require('../models/Category');
const Budget = require('../models/Budget');
const budgetService = require('./budgetService');
const { BadRequestError } = require('../middleware/errorHandler');

function formatDate(d) {
  if (!d) return '';
  const dateObj = new Date(d);
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

async function calculateSummary(userId, transactions, start, end) {
  let income = 0;
  let expense = 0;

  for (const t of transactions) {
    if (t.amount == null) continue;
    const amt = parseFloat(t.amount.toString());
    if (t.type === 'INCOME') {
      income += amt;
    } else if (t.type === 'EXPENSE') {
      expense += amt;
    }
  }

  income = parseFloat(income.toFixed(2));
  expense = parseFloat(expense.toFixed(2));
  const currentBalance = parseFloat((income - expense).toFixed(2));
  const savingsRate = income > 0 ? Math.max(0, parseFloat(((income - expense) / income * 100).toFixed(2))) : 0.0;

  // Prior period of equal duration
  const oneDayMs = 24 * 60 * 60 * 1000;
  const days = Math.round((end.getTime() - start.getTime()) / oneDayMs) + 1;
  const prevEnd = new Date(start.getTime() - oneDayMs);
  prevEnd.setHours(23, 59, 59, 999);
  const prevStart = new Date(prevEnd.getTime() - (days - 1) * oneDayMs);
  prevStart.setHours(0, 0, 0, 0);

  const prevTransactions = await Transaction.find({
    userId: userId.toString(),
    date: { $gte: prevStart, $lte: prevEnd }
  });

  let prevIncome = 0;
  let prevExpense = 0;
  for (const t of prevTransactions) {
    if (t.amount == null) continue;
    const amt = parseFloat(t.amount.toString());
    if (t.type === 'INCOME') {
      prevIncome += amt;
    } else if (t.type === 'EXPENSE') {
      prevExpense += amt;
    }
  }

  let incomeChangePercent = null;
  if (prevIncome > 0) {
    incomeChangePercent = parseFloat(((income - prevIncome) / prevIncome * 100).toFixed(2));
  }

  let expenseChangePercent = null;
  if (prevExpense > 0) {
    expenseChangePercent = parseFloat(((expense - prevExpense) / prevExpense * 100).toFixed(2));
  }

  return {
    totalIncome: income,
    totalExpenses: expense,
    currentBalance,
    remainingMonthlyBudget: 0.0,
    savingsRate,
    totalTransactions: transactions.length,
    incomeChangePercent,
    expenseChangePercent,
    hasData: transactions.length > 0
  };
}

async function calculateCategoryDistribution(userId, transactions) {
  const categories = await Category.find({
    $or: [{ userId: userId.toString() }, { isSystem: true }]
  });

  const categoryMap = new Map();
  for (const c of categories) {
    categoryMap.set(c.name.toLowerCase(), c);
  }

  const amounts = new Map();
  const counts = new Map();
  let totalExpense = 0;

  for (const t of transactions) {
    if (t.type === 'EXPENSE' && t.amount != null) {
      const amt = parseFloat(t.amount.toString());
      const catName = t.category;
      amounts.set(catName, (amounts.get(catName) || 0) + amt);
      counts.set(catName, (counts.get(catName) || 0) + 1);
      totalExpense += amt;
    }
  }

  const distribution = [];
  for (const [name, amount] of amounts.entries()) {
    const roundAmount = parseFloat(amount.toFixed(2));
    const percentage = totalExpense > 0 ? parseFloat(((roundAmount / totalExpense) * 100).toFixed(2)) : 0.0;
    const cat = categoryMap.get(name.toLowerCase());

    distribution.push({
      category: name,
      type: 'EXPENSE',
      amount: roundAmount,
      percentage,
      count: counts.get(name) || 0,
      icon: cat ? cat.icon : 'tag',
      color: cat ? cat.color : '#FFFFFF'
    });
  }

  distribution.sort((a, b) => b.amount - a.amount);
  return distribution;
}

async function calculateMonthlyTrends(userId, endDate, monthCount = 6) {
  const trends = [];
  const currentYear = endDate.getFullYear();
  const currentMonth = endDate.getMonth(); // 0-indexed

  for (let i = monthCount - 1; i >= 0; i--) {
    const targetDate = new Date(currentYear, currentMonth - i, 1);
    const targetY = targetDate.getFullYear();
    const targetM = targetDate.getMonth() + 1; // 1-12
    const start = new Date(targetY, targetM - 1, 1, 0, 0, 0, 0);
    const end = new Date(targetY, targetM, 0, 23, 59, 59, 999);

    const monthTx = await Transaction.find({
      userId: userId.toString(),
      date: { $gte: start, $lte: end }
    });

    let inc = 0;
    let exp = 0;
    for (const t of monthTx) {
      if (t.amount == null) continue;
      const amt = parseFloat(t.amount.toString());
      if (t.type === 'INCOME') inc += amt;
      else if (t.type === 'EXPENSE') exp += amt;
    }

    inc = parseFloat(inc.toFixed(2));
    exp = parseFloat(exp.toFixed(2));
    const netSavings = parseFloat((inc - exp).toFixed(2));
    const monthLabel = `${monthNames[targetM - 1]} ${targetY}`;

    trends.push({
      month: targetM,
      year: targetY,
      monthLabel,
      income: inc,
      expense: exp,
      netSavings
    });
  }

  return trends;
}

async function getReports(userId, startDateStr = null, endDateStr = null) {
  const now = new Date();
  let end;
  if (endDateStr) {
    const [ey, em, ed] = endDateStr.split('-').map(Number);
    end = new Date(ey, em - 1, ed, 23, 59, 59, 999);
  } else {
    end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  }

  let start;
  if (startDateStr) {
    const [sy, sm, sd] = startDateStr.split('-').map(Number);
    start = new Date(sy, sm - 1, sd, 0, 0, 0, 0);
  } else {
    // 1 month prior + 1 day
    const prevM = new Date(end.getTime());
    prevM.setMonth(prevM.getMonth() - 1);
    prevM.setDate(prevM.getDate() + 1);
    start = new Date(prevM.getFullYear(), prevM.getMonth(), prevM.getDate(), 0, 0, 0, 0);
  }

  if (start > end) {
    throw new BadRequestError('Start date cannot be after end date');
  }

  const transactions = await Transaction.find({
    userId: userId.toString(),
    date: { $gte: start, $lte: end }
  });

  const summary = await calculateSummary(userId, transactions, start, end);
  const categoryDistribution = await calculateCategoryDistribution(userId, transactions);
  const highestSpendingCategory = categoryDistribution.length > 0 ? categoryDistribution[0] : null;
  const monthlyTrends = await calculateMonthlyTrends(userId, end, 6);

  return {
    summary,
    categoryDistribution,
    monthlyTrends,
    highestSpendingCategory
  };
}

async function getDashboardSummary(userId) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const currentMonthTransactions = await Transaction.find({
    userId: userId.toString(),
    date: { $gte: startOfMonth, $lte: endOfMonth }
  });

  const summary = await calculateSummary(userId, currentMonthTransactions, startOfMonth, endOfMonth);

  // Budget remaining for current month
  const budgets = await budgetService.getBudgetsForUser(userId, now.getMonth() + 1, now.getFullYear());
  let totalBudgetLimit = 0;
  let totalBudgetSpent = 0;
  for (const b of budgets) {
    totalBudgetLimit += b.monthlyLimit;
    totalBudgetSpent += b.spent;
  }
  const remainingBudget = parseFloat(Math.max(0, totalBudgetLimit - totalBudgetSpent).toFixed(2));
  summary.remainingMonthlyBudget = remainingBudget;

  return summary;
}

function escapeCsvField(field) {
  if (field == null) return '""';
  const str = String(field);
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

async function exportToCsv(userId, startDateStr = null, endDateStr = null) {
  const now = new Date();
  let end;
  if (endDateStr) {
    const [ey, em, ed] = endDateStr.split('-').map(Number);
    end = new Date(ey, em - 1, ed, 23, 59, 59, 999);
  } else {
    end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  }

  let start;
  if (startDateStr) {
    const [sy, sm, sd] = startDateStr.split('-').map(Number);
    start = new Date(sy, sm - 1, sd, 0, 0, 0, 0);
  } else {
    const prevY = new Date(end.getTime());
    prevY.setFullYear(prevY.getFullYear() - 1);
    start = new Date(prevY.getFullYear(), prevY.getMonth(), prevY.getDate(), 0, 0, 0, 0);
  }

  if (start > end) {
    throw new BadRequestError('Start date cannot be after end date');
  }

  const transactions = await Transaction.find({
    userId: userId.toString(),
    date: { $gte: start, $lte: end }
  }).sort({ date: -1, createdAt: -1 });

  const headers = ['Transaction ID', 'Date', 'Type', 'Category', 'Amount', 'Description', 'Payment Method', 'Notes'];
  const lines = [headers.map(escapeCsvField).join(',')];

  for (const t of transactions) {
    const amt = t.amount != null ? parseFloat(t.amount.toString()).toFixed(2) : '0.00';
    lines.push(
      [
        escapeCsvField(t._id.toString()),
        escapeCsvField(formatDate(t.date)),
        escapeCsvField(t.type || ''),
        escapeCsvField(t.category || ''),
        escapeCsvField(amt),
        escapeCsvField(t.description || ''),
        escapeCsvField(t.paymentMethod || ''),
        escapeCsvField(t.notes || '')
      ].join(',')
    );
  }

  return Buffer.from(lines.join('\r\n'), 'utf-8');
}

module.exports = {
  getReports,
  getDashboardSummary,
  exportToCsv
};
