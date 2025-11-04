const express = require('express');
const router = express.Router();
const activityAreaController = require('./activity-area.controller');
const authMiddleware = require('../../middlewares/authMiddleware');
const { checkPermission } = require('../../middlewares/rbacMiddleware');
const { cacheMiddleware } = require('../../middlewares/cacheMiddleware');
const { validationMiddleware } = require('../../validators/dynamicValidator');

/**
 * @swagger
 * /activity-areas/active:
 *   get:
 *     summary: Get all active activity areas (Public)
 *     description: Retrieve all active activity areas with pagination (cached for 10 minutes)
 *     tags: [Activity Areas]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 100
 *         description: Items per page
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *           enum: [tr, en, ar]
 *           default: tr
 *         description: Language code
 *     responses:
 *       200:
 *         description: Active activity areas retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ActivityArea'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationInfo'
 */
router.get('/active', cacheMiddleware(600), activityAreaController.getActiveActivityAreas);

/**
 * @swagger
 * /activity-areas/slug/{slug}:
 *   get:
 *     summary: Get activity area by slug (Public)
 *     description: Retrieve a single activity area by its slug (cached for 10 minutes)
 *     tags: [Activity Areas]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Activity area slug
 *         example: beslenme-ve-sagligi
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *           enum: [tr, en, ar]
 *           default: tr
 *         description: Language code
 *     responses:
 *       200:
 *         description: Activity area retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ActivityArea'
 *       404:
 *         description: Activity area not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/slug/:slug', cacheMiddleware(600), activityAreaController.getActivityAreaBySlug);

// Protected routes (require authentication)
router.use(authMiddleware);

// Admin routes with permission checks
router.get(
  '/',
  checkPermission('activity-areas', 'read'),
  activityAreaController.getAllActivityAreas
);

router.get(
  '/:id',
  checkPermission('activity-areas', 'read'),
  activityAreaController.getActivityAreaById
);

router.post(
  '/',
  checkPermission('activity-areas', 'create'),
  validationMiddleware('activity-areas'),
  activityAreaController.createActivityArea
);

router.put(
  '/:id',
  checkPermission('activity-areas', 'update'),
  validationMiddleware('activity-areas'),
  activityAreaController.updateActivityArea
);

router.delete(
  '/:id',
  checkPermission('activity-areas', 'delete'),
  activityAreaController.deleteActivityArea
);

module.exports = router;
