const notificationService = require('../services/notificationService');
const { success } = require('../utils/apiResponse');

async function getNotifications(req, res, next) {
  try {
    const list = await notificationService.getRecentNotifications(req.user._id);
    res.json(success(list));
  } catch (err) {
    next(err);
  }
}

async function getUnreadCount(req, res, next) {
  try {
    const count = await notificationService.getUnreadCount(req.user._id);
    res.json(success({ unreadCount: count }));
  } catch (err) {
    next(err);
  }
}

async function markAsRead(req, res, next) {
  try {
    await notificationService.markAsRead(req.params.id, req.user._id);
    res.json(success(null, 'Notification marked as read'));
  } catch (err) {
    next(err);
  }
}

async function markAllAsRead(req, res, next) {
  try {
    await notificationService.markAllAsRead(req.user._id);
    res.json(success(null, 'All notifications marked as read'));
  } catch (err) {
    next(err);
  }
}

async function clearAll(req, res, next) {
  try {
    await notificationService.clearAll(req.user._id);
    res.json(success(null, 'All notifications cleared'));
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  clearAll
};
