const express = require('express');
const router = express.Router();
const dashboardController = require('./dashboard.controller');
const authMiddleware = require('../../middlewares/authMiddleware');
const { checkPermission } = require('../../middlewares/rbacMiddleware');
const { cacheMiddleware } = require('../../middlewares/cacheMiddleware');

// Tüm dashboard endpoint'leri auth gerektirir
router.use(authMiddleware);

/**
 * @swagger
 * /api/dashboard/statistics:
 *   get:
 *     summary: Get global dashboard statistics
 *     description: Total donations, campaigns, donors, amount, etc.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 */
router.get(
  '/statistics',
  checkPermission('dashboard', 'read'),
  cacheMiddleware(300), // 5 dakika cache
  dashboardController.getStatistics
);

/**
 * @swagger
 * /api/dashboard/chart/donations:
 *   get:
 *     summary: Get donation chart data
 *     description: Daily/monthly donation statistics for charts
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly, yearly]
 *           default: monthly
 *         description: Time period for chart
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Number of data points
 *     responses:
 *       200:
 *         description: Chart data
 */
router.get(
  '/chart/donations',
  checkPermission('dashboard', 'read'),
  cacheMiddleware(600), // 10 dakika cache
  dashboardController.getDonationChart
);

/**
 * @swagger
 * /api/dashboard/recent-activities:
 *   get:
 *     summary: Get recent activities
 *     description: Latest donations, volunteers, contacts for dashboard feed
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of activities
 *     responses:
 *       200:
 *         description: Recent activities
 */
router.get(
  '/recent-activities',
  checkPermission('dashboard', 'read'),
  cacheMiddleware(120), // 2 dakika cache
  dashboardController.getRecentActivities
);

/**
 * @swagger
 * /api/dashboard/top-campaigns:
 *   get:
 *     summary: Get top performing campaigns
 *     description: Campaigns with highest donations
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Number of campaigns
 *     responses:
 *       200:
 *         description: Top campaigns
 */
router.get(
  '/top-campaigns',
  checkPermission('dashboard', 'read'),
  cacheMiddleware(600),
  dashboardController.getTopCampaigns
);

/**
 * @swagger
 * /api/dashboard/top-donors:
 *   get:
 *     summary: Get top donors
 *     description: Donors with highest total donations
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of donors
 *     responses:
 *       200:
 *         description: Top donors
 */
router.get(
  '/top-donors',
  checkPermission('dashboard', 'read'),
  cacheMiddleware(600),
  dashboardController.getTopDonors
);

module.exports = router;
