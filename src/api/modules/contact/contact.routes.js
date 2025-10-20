const express = require('express');
const router = express.Router();
const contactController = require('./contact.controller');
const authMiddleware = require('../../middlewares/authMiddleware');
const { checkPermission } = require('../../middlewares/rbacMiddleware');

// Public route - anyone can submit a contact message
router.post('/', contactController.createMessage);

// Protected routes (require authentication)
router.use(authMiddleware);

// Admin routes with permission checks
router.get(
  '/',
  checkPermission('contact', 'read'),
  contactController.getAllMessages
);

router.get(
  '/unread-count',
  checkPermission('contact', 'read'),
  contactController.getUnreadCount
);

router.get(
  '/:id',
  checkPermission('contact', 'read'),
  contactController.getMessageById
);

router.put(
  '/:id',
  checkPermission('contact', 'update'),
  contactController.updateMessage
);

router.put(
  '/:id/read',
  checkPermission('contact', 'update'),
  contactController.markAsRead
);

router.delete(
  '/:id',
  checkPermission('contact', 'delete'),
  contactController.deleteMessage
);

module.exports = router;
