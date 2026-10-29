const transactionService = require('../services/transactionService');
const { success } = require('../utils/apiResponse');

async function createTransaction(req, res, next) {
  try {
    const response = await transactionService.createTransaction(req.user._id, req.body);
    res.status(201).json(success(response, 'Transaction created successfully'));
  } catch (err) {
    next(err);
  }
}

async function getTransactions(req, res, next) {
  try {
    const {
      type,
      category,
      startDate,
      endDate,
      search,
      page = 0,
      size = 15,
      sortBy = 'date',
      direction = 'desc'
    } = req.query;

    const result = await transactionService.getTransactions(
      req.user._id,
      type,
      category,
      startDate,
      endDate,
      search,
      page,
      size,
      sortBy,
      direction
    );

    res.json(success(result));
  } catch (err) {
    next(err);
  }
}

async function getRecentTransactions(req, res, next) {
  try {
    const recent = await transactionService.getRecentTransactions(req.user._id);
    res.json(success(recent));
  } catch (err) {
    next(err);
  }
}

async function getTransactionById(req, res, next) {
  try {
    const response = await transactionService.getTransactionById(req.params.id, req.user._id);
    res.json(success(response));
  } catch (err) {
    next(err);
  }
}

async function updateTransaction(req, res, next) {
  try {
    const response = await transactionService.updateTransaction(req.params.id, req.user._id, req.body);
    res.json(success(response, 'Transaction updated successfully'));
  } catch (err) {
    next(err);
  }
}

async function deleteTransaction(req, res, next) {
  try {
    await transactionService.deleteTransaction(req.params.id, req.user._id);
    res.json(success(null, 'Transaction deleted successfully'));
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createTransaction,
  getTransactions,
  getRecentTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction
};
