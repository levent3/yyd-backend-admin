const express = require('express');
const projectSettingsController = require('./project-settings.controller');
const authMiddleware = require('../../middlewares/authMiddleware');
const { checkPermission } = require('../../middlewares/rbacMiddleware');
const router = express.Router();

/**
 * @swagger
 * /api/project-settings/{projectId}:
 *   get:
 *     summary: Get campaign settings by campaign ID (Public)
 *     description: Retrieve settings for a specific campaign (returns defaults if not configured)
 *     tags: [Campaign Settings]
 *     parameters:
 *       - in: path
 *         name: projectId
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
router.get('/:projectId', projectSettingsController.getSettingsByProject);

// Admin routes - require authentication
router.use(authMiddleware);

/**
 * @swagger
 * /api/project-settings:
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
 *             required: [projectId]
 *             properties:
 *               projectId:
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
router.post('/', checkPermission('donations', 'create'), projectSettingsController.createSettings);

/**
 * @swagger
 * /api/project-settings/{projectId}:
 *   put:
 *     summary: Update campaign settings (Admin)
 *     description: Update existing campaign settings
 *     tags: [Campaign Settings]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
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
router.put('/:projectId', checkPermission('donations', 'update'), projectSettingsController.updateSettings);

/**
 * @swagger
 * /api/project-settings/{projectId}/upsert:
 *   post:
 *     summary: Create or update campaign settings (Admin)
 *     description: Create settings if not exist, update if exists
 *     tags: [Campaign Settings]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
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
router.post('/:projectId/upsert', checkPermission('donations', 'update'), projectSettingsController.upsertSettings);

/**
 * @swagger
 * /api/project-settings/bulk-update:
 *   post:
 *     summary: Bulk update preset amounts (Admin)
 *     description: Update preset amounts for multiple projects at once
 *     tags: [Project Settings]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [projectIds, presetAmounts]
 *             properties:
 *               projectIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2, 3]
 *                 description: List of project IDs to update
 *               presetAmounts:
 *                 type: array
 *                 items:
 *                   type: number
 *                 example: [1000, 2000, 3000, 5000]
 *                 description: Preset donation amounts
 *     responses:
 *       200:
 *         description: Bulk update successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     success:
 *                       type: integer
 *                     failed:
 *                       type: integer
 *                     total:
 *                       type: integer
 *       400:
 *         description: Validation error
 */
router.post('/bulk-update', checkPermission('projects', 'update'), projectSettingsController.bulkUpdatePresetAmounts);

/**
 * @swagger
 * /api/project-settings/{projectId}:
 *   delete:
 *     summary: Delete project settings (Admin)
 *     description: Delete custom settings for a project (will revert to defaults)
 *     tags: [Project Settings]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Settings deleted successfully
 */
router.delete('/:projectId', checkPermission('donations', 'delete'), projectSettingsController.deleteSettings);

module.exports = router;
