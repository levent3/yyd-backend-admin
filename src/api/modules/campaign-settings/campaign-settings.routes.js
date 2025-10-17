const express = require('express');
const campaignSettingsController = require('./campaign-settings.controller');
const authMiddleware = require('../../middlewares/authMiddleware');
const { checkPermission } = require('../../middlewares/rbacMiddleware');
const router = express.Router();

/**
 * @swagger
 * /api/campaign-settings/{campaignId}:
 *   get:
 *     summary: Get campaign settings by campaign ID (Public)
 *     description: Retrieve settings for a specific campaign (returns defaults if not configured)
 *     tags: [Campaign Settings]
 *     parameters:
 *       - in: path
 *         name: campaignId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Campaign ID
 *     responses:
 *       200:
 *         description: Successfully retrieved settings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 settings:
 *                   type: object
 *                 isDefault:
 *                   type: boolean
 */
router.get('/:campaignId', campaignSettingsController.getSettingsByCampaign);

// Admin routes - require authentication
router.use(authMiddleware);

/**
 * @swagger
 * /api/campaign-settings:
 *   post:
 *     summary: Create campaign settings (Admin)
 *     description: Create custom settings for a campaign
 *     tags: [Campaign Settings]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [campaignId]
 *             properties:
 *               campaignId:
 *                 type: integer
 *                 example: 1
 *               presetAmounts:
 *                 type: array
 *                 items:
 *                   type: number
 *                 example: [100, 250, 500, 1000]
 *               minAmount:
 *                 type: number
 *                 example: 50
 *               maxAmount:
 *                 type: number
 *                 example: 10000
 *               allowRepeat:
 *                 type: boolean
 *                 example: true
 *               allowDedication:
 *                 type: boolean
 *                 example: true
 *               impactMetrics:
 *                 type: array
 *                 example: [{"type": "people_helped", "value": 1500, "label": "Kişiye Ulaştık"}]
 *     responses:
 *       201:
 *         description: Settings created successfully
 */
router.post('/', checkPermission('donations', 'create'), campaignSettingsController.createSettings);

/**
 * @swagger
 * /api/campaign-settings/{campaignId}:
 *   put:
 *     summary: Update campaign settings (Admin)
 *     description: Update existing campaign settings
 *     tags: [Campaign Settings]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: campaignId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Settings updated successfully
 */
router.put('/:campaignId', checkPermission('donations', 'update'), campaignSettingsController.updateSettings);

/**
 * @swagger
 * /api/campaign-settings/{campaignId}/upsert:
 *   post:
 *     summary: Create or update campaign settings (Admin)
 *     description: Create settings if not exist, update if exists
 *     tags: [Campaign Settings]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: campaignId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Settings saved successfully
 */
router.post('/:campaignId/upsert', checkPermission('donations', 'update'), campaignSettingsController.upsertSettings);

/**
 * @swagger
 * /api/campaign-settings/{campaignId}:
 *   delete:
 *     summary: Delete campaign settings (Admin)
 *     description: Delete custom settings for a campaign (will revert to defaults)
 *     tags: [Campaign Settings]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: campaignId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Settings deleted successfully
 */
router.delete('/:campaignId', checkPermission('donations', 'delete'), campaignSettingsController.deleteSettings);

module.exports = router;
