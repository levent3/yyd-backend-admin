const express = require('express');
const systemSettingsController = require('./system-settings.controller');
const authMiddleware = require('../../middlewares/authMiddleware');
const { checkPermission } = require('../../middlewares/rbacMiddleware');
const router = express.Router();

/**
 * @swagger
 * /api/system-settings/public:
 *   get:
 *     summary: Get public system settings (Public)
 *     description: Retrieve all public system settings
 *     tags: [System Settings]
 *     responses:
 *       200:
 *         description: Successfully retrieved public settings
 */
router.get('/public', systemSettingsController.getPublicSettings);

// Admin routes - require authentication
router.use(authMiddleware);

/**
 * @swagger
 * /api/system-settings:
 *   get:
 *     summary: Get all system settings (Admin)
 *     description: Retrieve all system settings with optional filters
 *     tags: [System Settings]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: isPublic
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Successfully retrieved settings
 */
router.get('/', checkPermission('settings', 'read'), systemSettingsController.getAllSettings);

/**
 * @swagger
 * /api/system-settings/initialize:
 *   post:
 *     summary: Initialize default settings (Admin)
 *     description: Create default system settings if they don't exist
 *     tags: [System Settings]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Default settings initialized
 */
router.post('/initialize', checkPermission('settings', 'create'), systemSettingsController.initializeDefaults);

/**
 * @swagger
 * /api/system-settings/category/{category}:
 *   get:
 *     summary: Get settings by category (Admin)
 *     description: Retrieve all settings for a specific category
 *     tags: [System Settings]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved settings
 */
router.get('/category/:category', checkPermission('settings', 'read'), systemSettingsController.getSettingsByCategory);

/**
 * @swagger
 * /api/system-settings/{key}:
 *   get:
 *     summary: Get setting by key (Admin)
 *     description: Retrieve a specific system setting
 *     tags: [System Settings]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved setting
 *       404:
 *         description: Setting not found
 */
router.get('/:key', checkPermission('settings', 'read'), systemSettingsController.getSettingByKey);

/**
 * @swagger
 * /api/system-settings:
 *   post:
 *     summary: Create system setting (Admin)
 *     description: Create a new system setting
 *     tags: [System Settings]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [settingKey, settingValue]
 *             properties:
 *               settingKey:
 *                 type: string
 *                 example: max_upload_size
 *               settingValue:
 *                 example: 5242880
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               isPublic:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Setting created successfully
 */
router.post('/', checkPermission('settings', 'create'), systemSettingsController.createSetting);

/**
 * @swagger
 * /api/system-settings/{key}:
 *   put:
 *     summary: Update system setting (Admin)
 *     description: Update an existing system setting
 *     tags: [System Settings]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Setting updated successfully
 */
router.put('/:key', checkPermission('settings', 'update'), systemSettingsController.updateSetting);

/**
 * @swagger
 * /api/system-settings/{key}/upsert:
 *   post:
 *     summary: Create or update system setting (Admin)
 *     description: Create setting if not exist, update if exists
 *     tags: [System Settings]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Setting saved successfully
 */
router.post('/:key/upsert', checkPermission('settings', 'update'), systemSettingsController.upsertSetting);

/**
 * @swagger
 * /api/system-settings/{key}:
 *   delete:
 *     summary: Delete system setting (Admin)
 *     description: Permanently delete a system setting
 *     tags: [System Settings]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Setting deleted successfully
 */
router.delete('/:key', checkPermission('settings', 'delete'), systemSettingsController.deleteSetting);

module.exports = router;
