const express = require('express');
const binCodeController = require('./bin-code.controller');
const authMiddleware = require('../../middlewares/authMiddleware');
const { checkPermission } = require('../../middlewares/rbacMiddleware');
const { cacheMiddleware } = require('../../middlewares/cacheMiddleware');
const router = express.Router();

// ========== PUBLIC ROUTES (Auth NOT Required) ==========

/**
 * @swagger
 * /api/bin-codes/public/{binCode}:
 *   get:
 *     summary: Get BIN code information (Public)
 *     description: Retrieve bank information for a given BIN code for card validation
 *     tags: [BinCodes - Public]
 *     parameters:
 *       - in: path
 *         name: binCode
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^\d{6}$'
 *         description: 6-digit BIN code
 *         example: "450803"
 *     responses:
 *       200:
 *         description: BIN code information retrieved successfully
 *       400:
 *         description: Invalid BIN code format
 *       404:
 *         description: BIN code not found
 */
router.get('/public/:binCode', cacheMiddleware(3600), binCodeController.getBinCodeInfo);

// ========== PROTECTED ROUTES (Auth Required) ==========

/**
 * @swagger
 * /api/bin-codes:
 *   get:
 *     summary: Get all BIN codes
 *     description: Retrieve a paginated list of BIN codes with optional filters
 *     tags: [BinCodes]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: bankId
 *         schema:
 *           type: integer
 *         description: Filter by bank ID
 *     responses:
 *       200:
 *         description: Successfully retrieved BIN codes
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.get('/', authMiddleware, checkPermission('bin-codes', 'read'), binCodeController.getAllBinCodes);

/**
 * @swagger
 * /api/bin-codes/{id}:
 *   get:
 *     summary: Get BIN code by ID
 *     description: Retrieve detailed information about a specific BIN code
 *     tags: [BinCodes]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: BIN code ID
 *     responses:
 *       200:
 *         description: Successfully retrieved BIN code
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: BIN code not found
 */
router.get('/:id', authMiddleware, checkPermission('bin-codes', 'read'), binCodeController.getBinCodeById);

/**
 * @swagger
 * /api/bin-codes:
 *   post:
 *     summary: Create new BIN code
 *     description: Create a new BIN code for a bank
 *     tags: [BinCodes]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [binCode, bankId]
 *             properties:
 *               binCode:
 *                 type: string
 *                 pattern: '^\d{6}$'
 *                 example: "450803"
 *                 description: 6-digit BIN code
 *               bankId:
 *                 type: integer
 *                 example: 1
 *                 description: ID of the bank this BIN belongs to
 *               isActive:
 *                 type: boolean
 *                 default: true
 *                 example: true
 *     responses:
 *       201:
 *         description: BIN code successfully created
 *       400:
 *         description: Validation error or BIN code already exists
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Bank not found
 */
router.post('/', authMiddleware, checkPermission('bin-codes', 'create'), binCodeController.createBinCode);

/**
 * @swagger
 * /api/bin-codes/{id}:
 *   put:
 *     summary: Update BIN code
 *     description: Update BIN code information
 *     tags: [BinCodes]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: BIN code ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               binCode:
 *                 type: string
 *                 pattern: '^\d{6}$'
 *                 example: "450803"
 *               bankId:
 *                 type: integer
 *                 example: 1
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: BIN code successfully updated
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: BIN code or bank not found
 */
router.put('/:id', authMiddleware, checkPermission('bin-codes', 'update'), binCodeController.updateBinCode);

/**
 * @swagger
 * /api/bin-codes/{id}:
 *   delete:
 *     summary: Delete BIN code
 *     description: Permanently delete a BIN code
 *     tags: [BinCodes]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: BIN code ID
 *     responses:
 *       200:
 *         description: BIN code successfully deleted
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: BIN code not found
 */
router.delete('/:id', authMiddleware, checkPermission('bin-codes', 'delete'), binCodeController.deleteBinCode);

module.exports = router;
