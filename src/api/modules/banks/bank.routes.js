const express = require('express');
const bankController = require('./bank.controller');
const authMiddleware = require('../../middlewares/authMiddleware');
const { checkPermission } = require('../../middlewares/rbacMiddleware');
const router = express.Router();

/**
 * @swagger
 * /api/banks:
 *   get:
 *     summary: Get all banks
 *     description: Retrieve a paginated list of banks with optional filters
 *     tags: [Banks]
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
 *         name: isOurBank
 *         schema:
 *           type: boolean
 *         description: Filter by our bank status
 *       - in: query
 *         name: isVirtualPosActive
 *         schema:
 *           type: boolean
 *         description: Filter by virtual POS active status
 *     responses:
 *       200:
 *         description: Successfully retrieved banks
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.get('/', authMiddleware, checkPermission('banks', 'read'), bankController.getAllBanks);

/**
 * @swagger
 * /api/banks/{id}:
 *   get:
 *     summary: Get bank by ID
 *     description: Retrieve detailed information about a specific bank
 *     tags: [Banks]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Bank ID
 *     responses:
 *       200:
 *         description: Successfully retrieved bank
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Bank not found
 */
router.get('/:id', authMiddleware, checkPermission('banks', 'read'), bankController.getBankById);

/**
 * @swagger
 * /api/banks:
 *   post:
 *     summary: Create new bank
 *     description: Create a new bank with details
 *     tags: [Banks]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Ziraat Bankası
 *               isOurBank:
 *                 type: boolean
 *                 default: false
 *                 example: true
 *               isVirtualPosActive:
 *                 type: boolean
 *                 default: false
 *                 example: true
 *               isActive:
 *                 type: boolean
 *                 default: true
 *                 example: true
 *               displayOrder:
 *                 type: integer
 *                 default: 0
 *                 example: 1
 *     responses:
 *       201:
 *         description: Bank successfully created
 *       400:
 *         description: Validation error or bank name already exists
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.post('/', authMiddleware, checkPermission('banks', 'create'), bankController.createBank);

/**
 * @swagger
 * /api/banks/{id}:
 *   put:
 *     summary: Update bank
 *     description: Update bank information
 *     tags: [Banks]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Bank ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Ziraat Bankası
 *               isOurBank:
 *                 type: boolean
 *                 example: true
 *               isVirtualPosActive:
 *                 type: boolean
 *                 example: true
 *               isActive:
 *                 type: boolean
 *                 example: true
 *               displayOrder:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Bank successfully updated
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Bank not found
 */
router.put('/:id', authMiddleware, checkPermission('banks', 'update'), bankController.updateBank);

/**
 * @swagger
 * /api/banks/{id}:
 *   delete:
 *     summary: Delete bank
 *     description: Permanently delete a bank (only if no BIN codes exist)
 *     tags: [Banks]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Bank ID
 *     responses:
 *       200:
 *         description: Bank successfully deleted
 *       400:
 *         description: Bank has BIN codes - cannot delete
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Bank not found
 */
router.delete('/:id', authMiddleware, checkPermission('banks', 'delete'), bankController.deleteBank);

module.exports = router;
