const express = require('express');
const userController = require('../controllers/user.controller');
const validate = require('../middleware/validate.middleware');
const { authenticate } = require('../middleware/auth.middleware');
const {
  updateProfileSchema,
  changePasswordSchema,
  notificationIdSchema
} = require('../validators/user.validator');

const router = express.Router();

router.use(authenticate);

router.get('/profile', userController.getProfile);
router.put('/profile', validate(updateProfileSchema), userController.updateProfile);
router.put('/password', validate(changePasswordSchema), userController.changePassword);
router.get('/notifications', userController.listNotifications);
router.put('/notifications/read-all', userController.markAllNotificationsRead);
router.put('/notifications/:id', validate(notificationIdSchema), userController.markNotificationRead);

module.exports = router;
