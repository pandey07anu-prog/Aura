const Notification = require('../models/Notification');

async function createNotification(userId, title, message, type = 'SYSTEM') {
  return await Notification.create({
    userId: userId.toString(),
    title,
    message,
    type,
    isRead: false,
    createdAt: new Date()
  });
}

async function getRecentNotifications(userId) {
  return await Notification.find({ userId: userId.toString() })
    .sort({ createdAt: -1 })
    .limit(20);
}

async function getUnreadCount(userId) {
  return await Notification.countDocuments({
    userId: userId.toString(),
    isRead: false
  });
}

async function markAsRead(id, userId) {
  const notification = await Notification.findById(id);
  if (notification && notification.userId === userId.toString()) {
    notification.isRead = true;
    await notification.save();
  }
}

async function markAllAsRead(userId) {
  await Notification.updateMany(
    { userId: userId.toString(), isRead: false },
    { $set: { isRead: true } }
  );
}

async function clearAll(userId) {
  await Notification.deleteMany({ userId: userId.toString() });
}

module.exports = {
  createNotification,
  getRecentNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  clearAll
};
