const express = require('express');
const validationRuleController = require('./validation-rule.controller');
const authMiddleware = require('../../middlewares/authMiddleware');
const { checkPermission } = require('../../middlewares/rbacMiddleware');
const router = express.Router();

// Tüm route'lar admin authentication gerektirir
router.use(authMiddleware);

/**
 * @swagger
 * /api/validation-rules:
 *   get:
 *     summary: Get all validation rules (Admin)
 *     description: Retrieve all validation rules with optional filters
 *     tags: [Validation Rules]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: entityType
 *         schema:
 *           type: string
 *         description: Filter by entity type (donation, donor, campaign, etc.)
 *       - in: query
 *         name: fieldName
 *         schema:
 *           type: string
 *         description: Filter by field name
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: Successfully retrieved validation rules
 */
router.get('/', checkPermission('settings', 'read'), validationRuleController.getAllRules);

/**
 * @swagger
 * /api/validation-rules/templates:
 *   get:
 *     summary: Get validation rule templates (Admin)
 *     description: Get predefined validation rule templates for quick setup
 *     tags: [Validation Rules]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved templates
 */
router.get('/templates', checkPermission('settings', 'read'), validationRuleController.getTemplates);

/**
 * @swagger
 * /api/validation-rules/templates/apply:
 *   post:
 *     summary: Apply validation template (Admin)
 *     description: Apply predefined validation rules for a specific entity and field
 *     tags: [Validation Rules]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [entityType, fieldName]
 *             properties:
 *               entityType:
 *                 type: string
 *                 example: donation
 *               fieldName:
 *                 type: string
 *                 example: donorName
 *     responses:
 *       201:
 *         description: Template rules created successfully
 */
router.post('/templates/apply', checkPermission('settings', 'create'), validationRuleController.applyTemplate);

/**
 * @swagger
 * /api/validation-rules/entity/{entityType}:
 *   get:
 *     summary: Get rules by entity type (Admin)
 *     description: Get all active validation rules for a specific entity type
 *     tags: [Validation Rules]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: entityType
 *         required: true
 *         schema:
 *           type: string
 *         description: Entity type (donation, donor, campaign, etc.)
 *     responses:
 *       200:
 *         description: Successfully retrieved rules
 */
router.get('/entity/:entityType', checkPermission('settings', 'read'), validationRuleController.getRulesByEntity);

/**
 * @swagger
 * /api/validation-rules/{id}:
 *   get:
 *     summary: Get validation rule by ID (Admin)
 *     description: Retrieve a specific validation rule
 *     tags: [Validation Rules]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully retrieved rule
 *       404:
 *         description: Rule not found
 */
router.get('/:id', checkPermission('settings', 'read'), validationRuleController.getRuleById);

/**
 * @swagger
 * /api/validation-rules:
 *   post:
 *     summary: Create validation rule (Admin)
 *     description: Create a new validation rule
 *     tags: [Validation Rules]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [entityType, fieldName, ruleType, errorMessage]
 *             properties:
 *               entityType:
 *                 type: string
 *                 example: donation
 *               fieldName:
 *                 type: string
 *                 example: donorName
 *               ruleType:
 *                 type: string
 *                 enum: [required, minLength, maxLength, regex, custom, enum, min, max]
 *                 example: minLength
 *               ruleValue:
 *                 type: string
 *                 example: "3"
 *               errorMessage:
 *                 type: object
 *                 example: { "tr": "İsim en az 3 karakter olmalıdır", "en": "Name must be at least 3 characters" }
 *               priority:
 *                 type: integer
 *                 example: 1
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Rule created successfully
 */
router.post('/', checkPermission('settings', 'create'), validationRuleController.createRule);

/**
 * @swagger
 * /api/validation-rules/{id}:
 *   put:
 *     summary: Update validation rule (Admin)
 *     description: Update an existing validation rule
 *     tags: [Validation Rules]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ruleValue:
 *                 type: string
 *               errorMessage:
 *                 type: object
 *               priority:
 *                 type: integer
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Rule updated successfully
 */
router.put('/:id', checkPermission('settings', 'update'), validationRuleController.updateRule);

/**
 * @swagger
 * /api/validation-rules/{id}/toggle:
 *   patch:
 *     summary: Toggle validation rule active status (Admin)
 *     description: Activate or deactivate a validation rule
 *     tags: [Validation Rules]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [isActive]
 *             properties:
 *               isActive:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Rule toggled successfully
 */
router.patch('/:id/toggle', checkPermission('settings', 'update'), validationRuleController.toggleRuleActive);

/**
 * @swagger
 * /api/validation-rules/{id}:
 *   delete:
 *     summary: Delete validation rule (Admin)
 *     description: Permanently delete a validation rule
 *     tags: [Validation Rules]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Rule deleted successfully
 */
router.delete('/:id', checkPermission('settings', 'delete'), validationRuleController.deleteRule);

module.exports = router;
