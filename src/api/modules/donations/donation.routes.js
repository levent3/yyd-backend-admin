const express = require('express');
const donationController = require('./donation.controller');
const authMiddleware = require('../../middlewares/authMiddleware');
const { checkPermission } = require('../../middlewares/rbacMiddleware');
const { validationMiddleware } = require('../../validators/dynamicValidator');
const { cacheMiddleware } = require('../../middlewares/cacheMiddleware');
const router = express.Router();

// ========== PUBLIC ROUTES (Bağış yapma için auth gerekm az) ==========

/**
 * @swagger
 * /api/donations/campaigns/public:
 *   get:
 *     summary: Get all active campaigns (Public)
 *     description: Retrieve list of active donation campaigns accessible without authentication
 *     tags: [Donations]
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
 *     responses:
 *       200:
 *         description: Successfully retrieved campaigns
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationInfo'
 */
router.get('/campaigns/public', cacheMiddleware(600), donationController.getAllCampaigns);

/**
 * @swagger
 * /api/donations/campaigns/slug/{slug}:
 *   get:
 *     summary: Get campaign by slug (Public)
 *     description: Retrieve detailed campaign information by slug without authentication
 *     tags: [Donations]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Campaign slug
 *         example: water-well-project
 *     responses:
 *       200:
 *         description: Successfully retrieved campaign
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Campaign not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/campaigns/slug/:slug', cacheMiddleware(1800), donationController.getCampaignBySlug);

/**
 * @swagger
 * /api/donations/bank-accounts/public:
 *   get:
 *     summary: Get all bank accounts (Public)
 *     description: Retrieve list of bank accounts for donations without authentication
 *     tags: [Donations]
 *     responses:
 *       200:
 *         description: Successfully retrieved bank accounts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   bankName:
 *                     type: string
 *                     example: Example Bank
 *                   accountName:
 *                     type: string
 *                     example: Charity Organization
 *                   iban:
 *                     type: string
 *                     example: TR123456789012345678901234
 *                   currency:
 *                     type: string
 *                     example: TRY
 */
router.get('/bank-accounts/public', cacheMiddleware(3600), donationController.getAllBankAccounts);

/**
 * @swagger
 * /api/donations/public:
 *   post:
 *     summary: Create donation (Public)
 *     description: Create a new donation without authentication for guest donations
 *     tags: [Donations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, donorFirstName, donorLastName, donorEmail, donorPhone]
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 100
 *               donorFirstName:
 *                 type: string
 *                 example: Ahmet
 *               donorLastName:
 *                 type: string
 *                 example: Yilmaz
 *               donorEmail:
 *                 type: string
 *                 format: email
 *                 example: ahmet.yilmaz@example.com
 *               donorPhone:
 *                 type: string
 *                 example: +90 555 123 4567
 *               campaignId:
 *                 type: integer
 *                 example: 1
 *               paymentMethod:
 *                 type: string
 *                 enum: [credit_card, bank_transfer, cash]
 *                 example: bank_transfer
 *               isAnonymous:
 *                 type: boolean
 *                 default: false
 *                 example: false
 *               message:
 *                 type: string
 *                 example: May it be beneficial
 *     responses:
 *       201:
 *         description: Donation successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Donation'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/public', validationMiddleware('donation'), donationController.createDonation);

// ========== PROTECTED ROUTES (Admin için) ==========

// Auth middleware - aşağıdaki tüm route'lar için geçerli
router.use(authMiddleware);

// ===== DONATIONS =====

/**
 * @swagger
 * /api/donations:
 *   get:
 *     summary: Get all donations (Admin)
 *     description: Retrieve paginated list of all donations with filters
 *     tags: [Donations]
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, completed, failed, refunded]
 *         description: Filter by donation status
 *       - in: query
 *         name: campaignId
 *         schema:
 *           type: integer
 *         description: Filter by campaign ID
 *     responses:
 *       200:
 *         description: Successfully retrieved donations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Donation'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationInfo'
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', checkPermission('donations', 'read'), donationController.getAllDonations);

/**
 * @swagger
 * /api/donations/{id}:
 *   get:
 *     summary: Get donation by ID (Admin)
 *     description: Retrieve detailed information about a specific donation
 *     tags: [Donations]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Donation ID
 *     responses:
 *       200:
 *         description: Successfully retrieved donation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Donation'
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Donation not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', checkPermission('donations', 'read'), donationController.getDonationById);

/**
 * @swagger
 * /api/donations:
 *   post:
 *     summary: Create donation (Admin)
 *     description: Create a new donation record as administrator
 *     tags: [Donations]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, donorId]
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 500
 *               donorId:
 *                 type: integer
 *                 example: 1
 *               campaignId:
 *                 type: integer
 *                 example: 2
 *               paymentMethod:
 *                 type: string
 *                 enum: [credit_card, bank_transfer, cash]
 *                 example: credit_card
 *               status:
 *                 type: string
 *                 enum: [pending, completed, failed, refunded]
 *                 example: completed
 *               isAnonymous:
 *                 type: boolean
 *                 default: false
 *                 example: false
 *               message:
 *                 type: string
 *                 example: For education projects
 *     responses:
 *       201:
 *         description: Donation successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Donation'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', checkPermission('donations', 'create'), donationController.createDonation);

/**
 * @swagger
 * /api/donations/{id}:
 *   put:
 *     summary: Update donation (Admin)
 *     description: Update donation information and status
 *     tags: [Donations]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Donation ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 500
 *               status:
 *                 type: string
 *                 enum: [pending, completed, failed, refunded]
 *                 example: completed
 *               paymentMethod:
 *                 type: string
 *                 enum: [credit_card, bank_transfer, cash]
 *                 example: bank_transfer
 *               isAnonymous:
 *                 type: boolean
 *                 example: false
 *               message:
 *                 type: string
 *                 example: Updated message
 *     responses:
 *       200:
 *         description: Donation successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Donation'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Donation not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', checkPermission('donations', 'update'), donationController.updateDonation);

/**
 * @swagger
 * /api/donations/{id}:
 *   delete:
 *     summary: Delete donation (Admin)
 *     description: Permanently delete a donation record
 *     tags: [Donations]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Donation ID
 *     responses:
 *       200:
 *         description: Donation successfully deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Donation deleted successfully
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Donation not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', checkPermission('donations', 'delete'), donationController.deleteDonation);

// ===== CAMPAIGNS =====

/**
 * @swagger
 * /api/donations/campaigns:
 *   get:
 *     summary: Get all campaigns (Admin)
 *     description: Retrieve paginated list of all campaigns with admin access
 *     tags: [Donations]
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, completed, cancelled]
 *         description: Filter by campaign status
 *     responses:
 *       200:
 *         description: Successfully retrieved campaigns
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationInfo'
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/campaigns', checkPermission('donations', 'read'), donationController.getAllCampaigns);

/**
 * @swagger
 * /api/donations/campaigns/{id}:
 *   get:
 *     summary: Get campaign by ID (Admin)
 *     description: Retrieve detailed campaign information by ID
 *     tags: [Donations]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Campaign ID
 *     responses:
 *       200:
 *         description: Successfully retrieved campaign
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Campaign not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/campaigns/:id', checkPermission('donations', 'read'), donationController.getCampaignById);

/**
 * @swagger
 * /api/donations/campaigns:
 *   post:
 *     summary: Create campaign (Admin)
 *     description: Create a new donation campaign
 *     tags: [Donations]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, slug, description, goalAmount]
 *             properties:
 *               title:
 *                 type: string
 *                 example: Water Well Project
 *               slug:
 *                 type: string
 *                 example: water-well-project
 *               description:
 *                 type: string
 *                 example: Build water wells in needy regions
 *               goalAmount:
 *                 type: number
 *                 example: 10000
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: 2024-01-01
 *               endDate:
 *                 type: string
 *                 format: date
 *                 example: 2024-12-31
 *               status:
 *                 type: string
 *                 enum: [active, completed, cancelled]
 *                 example: active
 *               featuredImage:
 *                 type: string
 *                 example: https://example.com/images/campaign.jpg
 *     responses:
 *       201:
 *         description: Campaign successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Validation error or slug already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/campaigns', checkPermission('donations', 'create'), donationController.createCampaign);

/**
 * @swagger
 * /api/donations/campaigns/{id}:
 *   put:
 *     summary: Update campaign (Admin)
 *     description: Update campaign information and status
 *     tags: [Donations]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Campaign ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Water Well Project
 *               slug:
 *                 type: string
 *                 example: water-well-project
 *               description:
 *                 type: string
 *                 example: Build water wells in needy regions
 *               goalAmount:
 *                 type: number
 *                 example: 10000
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: 2024-01-01
 *               endDate:
 *                 type: string
 *                 format: date
 *                 example: 2024-12-31
 *               status:
 *                 type: string
 *                 enum: [active, completed, cancelled]
 *                 example: active
 *               featuredImage:
 *                 type: string
 *                 example: https://example.com/images/campaign.jpg
 *     responses:
 *       200:
 *         description: Campaign successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Campaign not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/campaigns/:id', checkPermission('donations', 'update'), donationController.updateCampaign);

/**
 * @swagger
 * /api/donations/campaigns/{id}:
 *   delete:
 *     summary: Delete campaign (Admin)
 *     description: Permanently delete a donation campaign
 *     tags: [Donations]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Campaign ID
 *     responses:
 *       200:
 *         description: Campaign successfully deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Campaign deleted successfully
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Campaign not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/campaigns/:id', checkPermission('donations', 'delete'), donationController.deleteCampaign);

// ===== DONORS =====

/**
 * @swagger
 * /api/donations/donors:
 *   get:
 *     summary: Get all donors (Admin)
 *     description: Retrieve paginated list of all donors
 *     tags: [Donations]
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
 *         name: email
 *         schema:
 *           type: string
 *         description: Filter by donor email
 *     responses:
 *       200:
 *         description: Successfully retrieved donors
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationInfo'
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/donors', checkPermission('donations', 'read'), donationController.getAllDonors);

/**
 * @swagger
 * /api/donations/donors/{id}:
 *   get:
 *     summary: Get donor by ID (Admin)
 *     description: Retrieve detailed donor information by ID
 *     tags: [Donations]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Donor ID
 *     responses:
 *       200:
 *         description: Successfully retrieved donor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Donor not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/donors/:id', checkPermission('donations', 'read'), donationController.getDonorById);

/**
 * @swagger
 * /api/donations/donors/email/{email}:
 *   get:
 *     summary: Get donor by email (Admin)
 *     description: Retrieve donor information by email address
 *     tags: [Donations]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *         description: Donor email address
 *         example: donor@example.com
 *     responses:
 *       200:
 *         description: Successfully retrieved donor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Donor not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/donors/email/:email', checkPermission('donations', 'read'), donationController.getDonorByEmail);

/**
 * @swagger
 * /api/donations/donors:
 *   post:
 *     summary: Create donor (Admin)
 *     description: Create a new donor record
 *     tags: [Donations]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, email, phone]
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: Mehmet
 *               lastName:
 *                 type: string
 *                 example: Demir
 *               email:
 *                 type: string
 *                 format: email
 *                 example: mehmet.demir@example.com
 *               phone:
 *                 type: string
 *                 example: +90 555 987 6543
 *               address:
 *                 type: string
 *                 example: Ankara, Turkey
 *     responses:
 *       201:
 *         description: Donor successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Validation error or email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/donors', checkPermission('donations', 'create'), donationController.createDonor);

/**
 * @swagger
 * /api/donations/donors/{id}:
 *   put:
 *     summary: Update donor (Admin)
 *     description: Update donor information
 *     tags: [Donations]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Donor ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: Mehmet
 *               lastName:
 *                 type: string
 *                 example: Demir
 *               email:
 *                 type: string
 *                 format: email
 *                 example: mehmet.demir@example.com
 *               phone:
 *                 type: string
 *                 example: +90 555 987 6543
 *               address:
 *                 type: string
 *                 example: Ankara, Turkey
 *     responses:
 *       200:
 *         description: Donor successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Donor not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/donors/:id', checkPermission('donations', 'update'), donationController.updateDonor);

// ===== BANK ACCOUNTS =====

/**
 * @swagger
 * /api/donations/bank-accounts:
 *   get:
 *     summary: Get all bank accounts (Admin)
 *     description: Retrieve list of all bank accounts with admin access
 *     tags: [Donations]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved bank accounts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/bank-accounts', checkPermission('donations', 'read'), donationController.getAllBankAccounts);

/**
 * @swagger
 * /api/donations/bank-accounts/{id}:
 *   get:
 *     summary: Get bank account by ID (Admin)
 *     description: Retrieve detailed bank account information
 *     tags: [Donations]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Bank account ID
 *     responses:
 *       200:
 *         description: Successfully retrieved bank account
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Bank account not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/bank-accounts/:id', checkPermission('donations', 'read'), donationController.getBankAccountById);

/**
 * @swagger
 * /api/donations/bank-accounts:
 *   post:
 *     summary: Create bank account (Admin)
 *     description: Create a new bank account for donations
 *     tags: [Donations]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [bankName, accountName, iban, currency]
 *             properties:
 *               bankName:
 *                 type: string
 *                 example: Ziraat Bank
 *               accountName:
 *                 type: string
 *                 example: Charity Organization Foundation
 *               iban:
 *                 type: string
 *                 example: TR123456789012345678901234
 *               currency:
 *                 type: string
 *                 example: TRY
 *               branch:
 *                 type: string
 *                 example: Central Branch
 *               accountNumber:
 *                 type: string
 *                 example: 1234567890
 *               isActive:
 *                 type: boolean
 *                 default: true
 *                 example: true
 *     responses:
 *       201:
 *         description: Bank account successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Validation error or IBAN already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/bank-accounts', checkPermission('donations', 'create'), donationController.createBankAccount);

/**
 * @swagger
 * /api/donations/bank-accounts/{id}:
 *   put:
 *     summary: Update bank account (Admin)
 *     description: Update bank account information
 *     tags: [Donations]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Bank account ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bankName:
 *                 type: string
 *                 example: Ziraat Bank
 *               accountName:
 *                 type: string
 *                 example: Charity Organization Foundation
 *               iban:
 *                 type: string
 *                 example: TR123456789012345678901234
 *               currency:
 *                 type: string
 *                 example: TRY
 *               branch:
 *                 type: string
 *                 example: Central Branch
 *               accountNumber:
 *                 type: string
 *                 example: 1234567890
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Bank account successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Bank account not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/bank-accounts/:id', checkPermission('donations', 'update'), donationController.updateBankAccount);

/**
 * @swagger
 * /api/donations/bank-accounts/{id}:
 *   delete:
 *     summary: Delete bank account (Admin)
 *     description: Permanently delete a bank account
 *     tags: [Donations]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Bank account ID
 *     responses:
 *       200:
 *         description: Bank account successfully deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Bank account deleted successfully
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Bank account not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/bank-accounts/:id', checkPermission('donations', 'delete'), donationController.deleteBankAccount);

module.exports = router;
