const budgetService = require('../services/budgetService');
const { success } = require('../utils/apiResponse');

async function getBudgets(req, res, next) {
  try {
    const { month, year } = req.query;
    const list = await budgetService.getBudgetsForUser(req.user._id, month, year);
    res.json(success(list));
  } catch (err) {
    next(err);
  }
}

async function getBudgetById(req, res, next) {
  try {
    const response = await budgetService.getBudgetById(req.params.id, req.user._id);
    res.json(success(response));
  } catch (err) {
    next(err);
  }
}

async function createBudget(req, res, next) {
  try {
    const response = await budgetService.createBudget(req.user._id, req.body);
    res.status(201).json(success(response, 'Monthly budget created successfully'));
  } catch (err) {
    next(err);
  }
}

async function updateBudget(req, res, next) {
  try {
    const response = await budgetService.updateBudget(req.params.id, req.user._id, req.body);
    res.json(success(response, 'Budget updated successfully'));
  } catch (err) {
    next(err);
  }
}

async function deleteBudget(req, res, next) {
  try {
    await budgetService.deleteBudget(req.params.id, req.user._id);
    res.json(success(null, 'Budget deleted successfully'));
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getBudgets,
  getBudgetById,
  createBudget,
  updateBudget,
  deleteBudget
};
