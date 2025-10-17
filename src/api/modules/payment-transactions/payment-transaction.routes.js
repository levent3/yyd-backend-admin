const express = require('express');
const paymentTransactionController = require('./payment-transaction.controller');
const authMiddleware = require('../../middlewares/authMiddleware');
const { checkPermission } = require('../../middlewares/rbacMiddleware');
const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * @swagger
 * /api/payment-transactions:
 *   get:
 *     summary: Get all payment transactions (Admin)
 *     description: Retrieve paginated list of all payment transactions with filters
 *     tags: [Payment Transactions]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, success, failed]
 *       - in: query
 *         name: paymentGateway
 *         schema:
 *           type: string
 *           example: iyzico
 *       - in: query
 *         name: donationId
 *         schema:
 *           type: string
 *       - in: query
 *         name: recurringDonationId
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully retrieved transactions
 */
router.get('/', checkPermission('donations', 'read'), paymentTransactionController.getAllTransactions);

/**
 * @swagger
 * /api/payment-transactions/statistics:
 *   get:
 *     summary: Get payment statistics (Admin)
 *     description: Get overall payment statistics with optional date range
 *     tags: [Payment Transactions]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Successfully retrieved statistics
 */
router.get('/statistics', checkPermission('donations', 'read'), paymentTransactionController.getStatistics);

/**
 * @swagger
 * /api/payment-transactions/statistics/by-gateway:
 *   get:
 *     summary: Get statistics by payment gateway (Admin)
 *     description: Get payment statistics grouped by payment gateway
 *     tags: [Payment Transactions]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved gateway statistics
 */
router.get('/statistics/by-gateway', checkPermission('donations', 'read'), paymentTransactionController.getStatisticsByGateway);

/**
 * @swagger
 * /api/payment-transactions/failed:
 *   get:
 *     summary: Get failed transactions (Admin)
 *     description: Get list of failed payment transactions
 *     tags: [Payment Transactions]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: Successfully retrieved failed transactions
 */
router.get('/failed', checkPermission('donations', 'read'), paymentTransactionController.getFailedTransactions);

/**
 * @swagger
 * /api/payment-transactions/pending:
 *   get:
 *     summary: Get pending transactions (Admin)
 *     description: Get list of pending payment transactions
 *     tags: [Payment Transactions]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved pending transactions
 */
router.get('/pending', checkPermission('donations', 'read'), paymentTransactionController.getPendingTransactions);

/**
 * @swagger
 * /api/payment-transactions/donation/{donationId}:
 *   get:
 *     summary: Get transactions by donation (Admin)
 *     description: Get all payment transactions for a specific donation
 *     tags: [Payment Transactions]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: donationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved transactions
 */
router.get('/donation/:donationId', checkPermission('donations', 'read'), paymentTransactionController.getByDonation);

/**
 * @swagger
 * /api/payment-transactions/recurring-donation/{recurringDonationId}:
 *   get:
 *     summary: Get transactions by recurring donation (Admin)
 *     description: Get all payment transactions for a specific recurring donation
 *     tags: [Payment Transactions]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: recurringDonationId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully retrieved transactions
 */
router.get('/recurring-donation/:recurringDonationId', checkPermission('donations', 'read'), paymentTransactionController.getByRecurringDonation);

/**
 * @swagger
 * /api/payment-transactions/gateway/{gateway}:
 *   get:
 *     summary: Get transactions by gateway (Admin)
 *     description: Get payment transactions for a specific payment gateway
 *     tags: [Payment Transactions]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: gateway
 *         required: true
 *         schema:
 *           type: string
 *           example: iyzico
 *     responses:
 *       200:
 *         description: Successfully retrieved transactions
 */
router.get('/gateway/:gateway', checkPermission('donations', 'read'), paymentTransactionController.getByGateway);

/**
 * @swagger
 * /api/payment-transactions/{id}:
 *   get:
 *     summary: Get transaction by ID (Admin)
 *     description: Retrieve detailed information about a specific payment transaction
 *     tags: [Payment Transactions]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved transaction
 *       404:
 *         description: Transaction not found
 */
router.get('/:id', checkPermission('donations', 'read'), paymentTransactionController.getTransactionById);

/**
 * @swagger
 * /api/payment-transactions:
 *   post:
 *     summary: Create payment transaction (Admin/Internal)
 *     description: Create a new payment transaction record
 *     tags: [Payment Transactions]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, paymentGateway]
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 100
 *               currency:
 *                 type: string
 *                 default: TRY
 *               status:
 *                 type: string
 *                 enum: [pending, success, failed]
 *                 default: pending
 *               paymentGateway:
 *                 type: string
 *                 example: iyzico
 *               gatewayTransactionId:
 *                 type: string
 *               gatewayResponse:
 *                 type: object
 *               threeDSecure:
 *                 type: boolean
 *               conversationId:
 *                 type: string
 *               attemptNumber:
 *                 type: integer
 *                 default: 1
 *               ipAddress:
 *                 type: string
 *               userAgent:
 *                 type: string
 *               donationId:
 *                 type: string
 *               recurringDonationId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Transaction successfully created
 */
router.post('/', checkPermission('donations', 'create'), paymentTransactionController.createTransaction);

/**
 * @swagger
 * /api/payment-transactions/{id}:
 *   put:
 *     summary: Update payment transaction (Admin)
 *     description: Update payment transaction information
 *     tags: [Payment Transactions]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, success, failed]
 *               gatewayTransactionId:
 *                 type: string
 *               gatewayResponse:
 *                 type: object
 *               gatewayErrorCode:
 *                 type: string
 *               gatewayErrorMessage:
 *                 type: string
 *               retryable:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Transaction successfully updated
 */
router.put('/:id', checkPermission('donations', 'update'), paymentTransactionController.updateTransaction);

/**
 * @swagger
 * /api/payment-transactions/{id}:
 *   delete:
 *     summary: Delete payment transaction (Admin)
 *     description: Permanently delete a payment transaction
 *     tags: [Payment Transactions]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transaction successfully deleted
 */
router.delete('/:id', checkPermission('donations', 'delete'), paymentTransactionController.deleteTransaction);

/**
 * @swagger
 * /api/payment-transactions/{id}/mark-success:
 *   post:
 *     summary: Mark transaction as success (Admin/Webhook)
 *     description: Mark a payment transaction as successful
 *     tags: [Payment Transactions]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               transactionId:
 *                 type: string
 *               response:
 *                 type: object
 *     responses:
 *       200:
 *         description: Transaction marked as success
 */
router.post('/:id/mark-success', checkPermission('donations', 'update'), paymentTransactionController.markAsSuccess);

/**
 * @swagger
 * /api/payment-transactions/{id}/mark-failed:
 *   post:
 *     summary: Mark transaction as failed (Admin/Webhook)
 *     description: Mark a payment transaction as failed
 *     tags: [Payment Transactions]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               errorCode:
 *                 type: string
 *               errorMessage:
 *                 type: string
 *               response:
 *                 type: object
 *               retryable:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Transaction marked as failed
 */
router.post('/:id/mark-failed', checkPermission('donations', 'update'), paymentTransactionController.markAsFailed);

/**
 * @swagger
 * /api/payment-transactions/{id}/retry:
 *   post:
 *     summary: Retry failed transaction (Admin)
 *     description: Create a new transaction attempt for a failed payment
 *     tags: [Payment Transactions]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transaction retry initiated
 *       400:
 *         description: Transaction cannot be retried
 */
router.post('/:id/retry', checkPermission('donations', 'update'), paymentTransactionController.retryTransaction);

module.exports = router;
