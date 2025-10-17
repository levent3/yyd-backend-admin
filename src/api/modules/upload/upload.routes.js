const express = require('express');
const router = express.Router();
const uploadController = require('./upload.controller');
const uploadMiddleware = require('../../middlewares/uploadMiddleware');
const authMiddleware = require('../../middlewares/authMiddleware');
const { checkPermission } = require('../../middlewares/permissionMiddleware');

// Tüm upload işlemleri için auth gerekli
router.use(authMiddleware);

// Single image upload
router.post(
  '/image',
  uploadMiddleware.single('image'),
  uploadController.uploadImage
);

// Multiple images upload (max 10)
router.post(
  '/images',
  uploadMiddleware.multiple('images', 10),
  uploadController.uploadImages
);

// Delete file
router.delete(
  '/:filename',
  checkPermission('gallery', 'delete'),
  uploadController.deleteFile
);

module.exports = router;
