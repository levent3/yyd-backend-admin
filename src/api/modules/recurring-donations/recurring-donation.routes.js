const express = require('express');
const recurringDonationController = require('./recurring-donation.controller');
const authMiddleware = require('../../middlewares/authMiddleware');
const { checkPermission } = require('../../middlewares/rbacMiddleware');
const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * @swagger
 * /api/recurring-donations:
 *   get:
 *     summary: Get all recurring donations (Admin)
 *     description: Retrieve paginated list of all recurring donations with filters
 *     tags: [Recurring Donations]
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
 *           enum: [active, paused, cancelled, completed]
 *       - in: query
 *         name: frequency
 *         schema:
 *           type: string
 *           enum: [monthly, quarterly, yearly]
 *       - in: query
 *         name: donorId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully retrieved recurring donations
 */
router.get('/', checkPermission('donations', 'read'), recurringDonationController.getAllRecurringDonations);

/**
 * @swagger
 * /api/recurring-donations/statistics:
 *   get:
 *     summary: Get recurring donations statistics (Admin)
 *     description: Get overall statistics for recurring donations
 *     tags: [Recurring Donations]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved statistics
 */
router.get('/statistics', checkPermission('donations', 'read'), recurringDonationController.getStatistics);

/**
 * @swagger
 * /api/recurring-donations/due:
 *   get:
 *     summary: Get due recurring donations (Admin/Cron)
 *     description: Get recurring donations that are due for payment
 *     tags: [Recurring Donations]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved due donations
 */
router.get('/due', checkPermission('donations', 'read'), recurringDonationController.getDueRecurringDonations);

/**
 * @swagger
 * /api/recurring-donations/donor/{donorId}:
 *   get:
 *     summary: Get recurring donations by donor (Admin)
 *     description: Get all recurring donations for a specific donor
 *     tags: [Recurring Donations]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: donorId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully retrieved donations
 */
router.get('/donor/:donorId', checkPermission('donations', 'read'), recurringDonationController.getByDonor);

/**
 * @swagger
 * /api/recurring-donations/campaign/{projectId}:
 *   get:
 *     summary: Get recurring donations by project (Admin)
 *     description: Get all recurring donations for a specific project
 *     tags: [Recurring Donations]
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
 *         description: Successfully retrieved donations
 */
router.get('/campaign/:projectId', checkPermission('donations', 'read'), recurringDonationController.getByCampaign);

/**
 * @swagger
 * /api/recurring-donations/{id}:
 *   get:
 *     summary: Get recurring donation by ID (Admin)
 *     description: Retrieve detailed information about a specific recurring donation
 *     tags: [Recurring Donations]
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
 *         description: Successfully retrieved recurring donation
 *       404:
 *         description: Recurring donation not found
 */
router.get('/:id', checkPermission('donations', 'read'), recurringDonationController.getRecurringDonationById);

/**
 * @swagger
 * /api/recurring-donations:
 *   post:
 *     summary: Create recurring donation (Admin)
 *     description: Create a new recurring donation subscription
 *     tags: [Recurring Donations]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, frequency, donorId, paymentMethod]
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 100
 *               currency:
 *                 type: string
 *                 default: TRY
 *                 example: TRY
 *               frequency:
 *                 type: string
 *                 enum: [monthly, quarterly, yearly]
 *                 example: monthly
 *               paymentMethod:
 *                 type: string
 *                 default: credit_card
 *                 example: credit_card
 *               paymentGateway:
 *                 type: string
 *                 example: iyzico
 *               cardToken:
 *                 type: string
 *                 description: Encrypted card token from payment gateway
 *               cardMask:
 *                 type: string
 *                 example: 5890****1234
 *               cardBrand:
 *                 type: string
 *                 example: VISA
 *               donorId:
 *                 type: integer
 *                 example: 1
 *               projectId:
 *                 type: integer
 *                 example: 5
 *               totalPaymentsPlanned:
 *                 type: integer
 *                 description: Total number of planned payments (null for indefinite)
 *                 example: 12
 *     responses:
 *       201:
 *         description: Recurring donation successfully created
 */
router.post('/', checkPermission('donations', 'create'), recurringDonationController.createRecurringDonation);

/**
 * @swagger
 * /api/recurring-donations/{id}:
 *   put:
 *     summary: Update recurring donation (Admin)
 *     description: Update recurring donation information
 *     tags: [Recurring Donations]
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
 *               amount:
 *                 type: number
 *               frequency:
 *                 type: string
 *                 enum: [monthly, quarterly, yearly]
 *               status:
 *                 type: string
 *                 enum: [active, paused, cancelled, completed]
 *               cardToken:
 *                 type: string
 *               cardMask:
 *                 type: string
 *               cardBrand:
 *                 type: string
 *     responses:
 *       200:
 *         description: Recurring donation successfully updated
 */
router.put('/:id', checkPermission('donations', 'update'), recurringDonationController.updateRecurringDonation);

/**
 * @swagger
 * /api/recurring-donations/{id}:
 *   delete:
 *     summary: Delete recurring donation (Admin)
 *     description: Permanently delete a recurring donation
 *     tags: [Recurring Donations]
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
 *         description: Recurring donation successfully deleted
 */
router.delete('/:id', checkPermission('donations', 'delete'), recurringDonationController.deleteRecurringDonation);

/**
 * @swagger
 * /api/recurring-donations/{id}/pause:
 *   post:
 *     summary: Pause recurring donation (Admin)
 *     description: Temporarily pause a recurring donation
 *     tags: [Recurring Donations]
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
 *         description: Recurring donation successfully paused
 */
router.post('/:id/pause', checkPermission('donations', 'update'), recurringDonationController.pauseRecurringDonation);

/**
 * @swagger
 * /api/recurring-donations/{id}/resume:
 *   post:
 *     summary: Resume recurring donation (Admin)
 *     description: Resume a paused recurring donation
 *     tags: [Recurring Donations]
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
 *         description: Recurring donation successfully resumed
 */
router.post('/:id/resume', checkPermission('donations', 'update'), recurringDonationController.resumeRecurringDonation);

/**
 * @swagger
 * /api/recurring-donations/{id}/cancel:
 *   post:
 *     summary: Cancel recurring donation (Admin)
 *     description: Cancel a recurring donation subscription
 *     tags: [Recurring Donations]
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
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 example: Kullanıcı isteği
 *     responses:
 *       200:
 *         description: Recurring donation successfully cancelled
 */
router.post('/:id/cancel', checkPermission('donations', 'update'), recurringDonationController.cancelRecurringDonation);

/**
 * @swagger
 * /api/recurring-donations/{id}/payment-success:
 *   post:
 *     summary: Process payment success (Internal/Webhook)
 *     description: Mark a recurring payment as successful
 *     tags: [Recurring Donations]
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
 *         description: Payment success processed
 */
router.post('/:id/payment-success', checkPermission('donations', 'update'), recurringDonationController.processPaymentSuccess);

/**
 * @swagger
 * /api/recurring-donations/{id}/payment-failure:
 *   post:
 *     summary: Process payment failure (Internal/Webhook)
 *     description: Mark a recurring payment as failed
 *     tags: [Recurring Donations]
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
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 example: Yetersiz bakiye
 *     responses:
 *       200:
 *         description: Payment failure processed
 */
router.post('/:id/payment-failure', checkPermission('donations', 'update'), recurringDonationController.processPaymentFailure);

module.exports = router;
