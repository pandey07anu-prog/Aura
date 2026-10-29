const adminService = require('../services/adminService');
const { success } = require('../utils/apiResponse');

async function getDashboardSummary(req, res, next) {
  try {
    const summary = await adminService.getDashboardSummary();
    res.json(success(summary));
  } catch (err) {
    next(err);
  }
}

async function getAllUsers(req, res, next) {
  try {
    const {
      role,
      status,
      search,
      page = 0,
      size = 15,
      sortBy = 'createdAt',
      direction = 'desc'
    } = req.query;

    const users = await adminService.getAllUsers(role, status, search, page, size, sortBy, direction);
    res.json(success(users));
  } catch (err) {
    next(err);
  }
}

async function getUserDetails(req, res, next) {
  try {
    const userDetails = await adminService.getUserDetails(req.params.id);
    res.json(success(userDetails));
  } catch (err) {
    next(err);
  }
}

async function updateUserStatus(req, res, next) {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const updated = await adminService.updateUserStatus(
      req.params.id,
      req.body,
      req.user._id,
      req.user.email,
      ipAddress
    );
    res.json(success(updated, 'User account status updated successfully'));
  } catch (err) {
    next(err);
  }
}

async function getAuditLogs(req, res, next) {
  try {
    const logs = await adminService.getRecentAuditLogs();
    res.json(success(logs));
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getDashboardSummary,
  getAllUsers,
  getUserDetails,
  updateUserStatus,
  getAuditLogs
};
