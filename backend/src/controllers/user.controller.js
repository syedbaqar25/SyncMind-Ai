const sanitizeHtml = require('sanitize-html');
const { prisma } = require('../config/database');
const { successResponse, paginatedResponse, errorResponse } = require('../utils/response.utils');
const { hashPassword, comparePassword, stripUserSecrets } = require('../utils/auth.utils');

const sanitizeText = (value) => sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} }).trim();

const getProfile = async (req, res) => {
  return successResponse(res, req.user, 'Profile fetched');
};

const updateProfile = async (req, res, next) => {
  try {
    const data = {};
    if (req.body.name) data.name = sanitizeText(req.body.name);
    if (Object.prototype.hasOwnProperty.call(req.body, 'avatar')) data.avatar = req.body.avatar;

    const user = await prisma.user.update({
      where: { id: req.userId },
      data
    });

    return successResponse(res, stripUserSecrets(user), 'Profile updated');
  } catch (error) {
    return next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user?.password) return errorResponse(res, 'Password login is not enabled for this account', 400);

    const matches = await comparePassword(req.body.currentPassword, user.password);
    if (!matches) return errorResponse(res, 'Current password is incorrect', 401);

    await prisma.user.update({
      where: { id: req.userId },
      data: { password: await hashPassword(req.body.newPassword) }
    });
    await prisma.refreshToken.deleteMany({ where: { userId: req.userId } });

    return successResponse(res, null, 'Password changed');
  } catch (error) {
    return next(error);
  }
};

const listNotifications = async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page || 1), 1);
    const limit = Math.min(Math.max(Number(req.query.limit || 20), 1), 100);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: req.userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.notification.count({ where: { userId: req.userId } })
    ]);

    return paginatedResponse(res, items, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }, 'Notifications fetched');
  } catch (error) {
    return next(error);
  }
};

const markNotificationRead = async (req, res, next) => {
  try {
    const notification = await prisma.notification.findFirst({
      where: { id: req.params.id, userId: req.userId }
    });

    if (!notification) return errorResponse(res, 'Notification not found', 404);

    const updated = await prisma.notification.update({
      where: { id: notification.id },
      data: { isRead: true }
    });

    return successResponse(res, updated, 'Notification marked as read');
  } catch (error) {
    return next(error);
  }
};

const markAllNotificationsRead = async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.userId, isRead: false },
      data: { isRead: true }
    });

    return successResponse(res, null, 'All notifications marked as read');
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead
};
