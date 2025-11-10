const express = require('express');
const router = express.Router();
const homepageController = require('./homepage.controller');
const authMiddleware = require('../../middlewares/authMiddleware');
const { checkPermission } = require('../../middlewares/rbacMiddleware');

// ========== HOME SLIDER ROUTES ==========

// Public route - Get all active sliders
router.get('/sliders/public', homepageController.getAllSliders);

// Admin routes - Sliders
router.get(
  '/sliders',
  authMiddleware,
  checkPermission('homepage', 'read'),
  homepageController.getAllSliders
);

router.get(
  '/sliders/:id',
  authMiddleware,
  checkPermission('homepage', 'read'),
  homepageController.getSliderById
);

router.post(
  '/sliders',
  authMiddleware,
  checkPermission('homepage', 'create'),
  homepageController.createSlider
);

router.put(
  '/sliders/:id',
  authMiddleware,
  checkPermission('homepage', 'update'),
  homepageController.updateSlider
);

router.delete(
  '/sliders/:id',
  authMiddleware,
  checkPermission('homepage', 'delete'),
  homepageController.deleteSlider
);

// ========== SITE STATISTICS ROUTES ==========

// Public route - Get statistics
router.get('/statistics/public', homepageController.getStatistics);

// Admin routes - Statistics
router.get(
  '/statistics',
  authMiddleware,
  checkPermission('homepage', 'read'),
  homepageController.getStatistics
);

router.put(
  '/statistics/:id',
  authMiddleware,
  checkPermission('homepage', 'update'),
  homepageController.updateStatistics
);

router.post(
  '/statistics',
  authMiddleware,
  checkPermission('homepage', 'update'),
  homepageController.createOrUpdateStatistics
);

module.exports = router;
