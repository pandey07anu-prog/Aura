const recurringService = require('../services/recurringService');
const { success } = require('../utils/apiResponse');

async function getRecurring(req, res, next) {
  try {
    const list = await recurringService.getRecurringForUser(req.user._id);
    res.json(success(list));
  } catch (err) {
    next(err);
  }
}

async function getRecurringById(req, res, next) {
  try {
    const response = await recurringService.getRecurringById(req.params.id, req.user._id);
    res.json(success(response));
  } catch (err) {
    next(err);
  }
}

async function createRecurring(req, res, next) {
  try {
    const response = await recurringService.createRecurring(req.user._id, req.body);
    res.status(201).json(success(response, 'Recurring transaction rule scheduled successfully'));
  } catch (err) {
    next(err);
  }
}

async function updateRecurring(req, res, next) {
  try {
    const response = await recurringService.updateRecurring(req.params.id, req.user._id, req.body);
    res.json(success(response, 'Recurring transaction rule updated successfully'));
  } catch (err) {
    next(err);
  }
}

async function updateStatus(req, res, next) {
  try {
    const { status } = req.body;
    const response = await recurringService.updateStatus(req.params.id, req.user._id, status);
    res.json(success(response, `Recurring rule status set to ${status.toUpperCase()}`));
  } catch (err) {
    next(err);
  }
}

async function deleteRecurring(req, res, next) {
  try {
    await recurringService.deleteRecurring(req.params.id, req.user._id);
    res.json(success(null, 'Recurring rule cancelled and removed'));
  } catch (err) {
    next(err);
  }
}

async function processNow(req, res, next) {
  try {
    const processed = await recurringService.processDueRecurringTransactions();
    res.json(success({ processedCount: processed, message: 'Recurring execution batch finished' }));
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getRecurring,
  getRecurringById,
  createRecurring,
  updateRecurring,
  updateStatus,
  deleteRecurring,
  processNow
};
