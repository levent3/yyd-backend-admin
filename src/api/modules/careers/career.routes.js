const express = require('express');
const careerController = require('./career.controller');
const authMiddleware = require('../../middlewares/authMiddleware');
const { checkPermission } = require('../../middlewares/rbacMiddleware');
const router = express.Router();

// ========== PUBLIC ROUTES ==========

/**
 * @swagger
 * /api/careers/apply:
 *   post:
 *     summary: Submit career application (Public)
 *     description: Submit a job application with CV without authentication
 *     tags: [Careers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fullName, email, cvUrl]
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: Ahmet Yılmaz
 *               email:
 *                 type: string
 *                 format: email
 *                 example: ahmet.yilmaz@example.com
 *               phoneNumber:
 *                 type: string
 *                 example: +90 555 123 4567
 *               position:
 *                 type: string
 *                 example: Yazılım Geliştirici
 *               coverLetter:
 *                 type: string
 *                 example: Kendimi tanıtmak isterim...
 *               cvUrl:
 *                 type: string
 *                 example: https://example.com/cv/ahmet-yilmaz.pdf
 *     responses:
 *       201:
 *         description: Application successfully submitted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Kariyer başvurunuz alındı
 *                 application:
 *                   type: object
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/apply', careerController.createApplication);

// ========== PROTECTED ROUTES (Admin) ==========

// Auth middleware - applies to all routes below
router.use(authMiddleware);

/**
 * @swagger
 * /api/careers:
 *   get:
 *     summary: Get all career applications (Admin)
 *     description: Retrieve paginated list of all career applications with filters
 *     tags: [Careers]
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
 *           enum: [new, reviewing, interviewed, accepted, rejected]
 *         description: Filter by application status
 *       - in: query
 *         name: position
 *         schema:
 *           type: string
 *         description: Filter by position title
 *     responses:
 *       200:
 *         description: Successfully retrieved applications
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
router.get('/', checkPermission('careers', 'read'), careerController.getAllApplications);

/**
 * @swagger
 * /api/careers/pending-count:
 *   get:
 *     summary: Get pending applications count (Admin)
 *     description: Get the count of new/pending career applications
 *     tags: [Careers]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved count
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   example: 5
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
router.get('/pending-count', checkPermission('careers', 'read'), careerController.getPendingCount);

/**
 * @swagger
 * /api/careers/status/{status}:
 *   get:
 *     summary: Get applications by status (Admin)
 *     description: Retrieve career applications filtered by status
 *     tags: [Careers]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [new, reviewing, interviewed, accepted, rejected]
 *         description: Application status
 *     responses:
 *       200:
 *         description: Successfully retrieved applications
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
router.get('/status/:status', checkPermission('careers', 'read'), careerController.getApplicationsByStatus);

/**
 * @swagger
 * /api/careers/position/{position}:
 *   get:
 *     summary: Get applications by position (Admin)
 *     description: Retrieve career applications filtered by position
 *     tags: [Careers]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: position
 *         required: true
 *         schema:
 *           type: string
 *         description: Position title or keyword
 *         example: Yazılım
 *     responses:
 *       200:
 *         description: Successfully retrieved applications
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
router.get('/position/:position', checkPermission('careers', 'read'), careerController.getApplicationsByPosition);

/**
 * @swagger
 * /api/careers/{id}:
 *   get:
 *     summary: Get application by ID (Admin)
 *     description: Retrieve detailed information about a specific career application
 *     tags: [Careers]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Application ID
 *     responses:
 *       200:
 *         description: Successfully retrieved application
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
 *         description: Application not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', checkPermission('careers', 'read'), careerController.getApplicationById);

/**
 * @swagger
 * /api/careers/{id}:
 *   put:
 *     summary: Update application (Admin)
 *     description: Update career application status or information
 *     tags: [Careers]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Application ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [new, reviewing, interviewed, accepted, rejected]
 *                 example: reviewing
 *               fullName:
 *                 type: string
 *                 example: Ahmet Yılmaz
 *               email:
 *                 type: string
 *                 example: ahmet.yilmaz@example.com
 *               phoneNumber:
 *                 type: string
 *                 example: +90 555 123 4567
 *               position:
 *                 type: string
 *                 example: Yazılım Geliştirici
 *     responses:
 *       200:
 *         description: Application successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Başvuru güncellendi
 *                 application:
 *                   type: object
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
 *         description: Application not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', checkPermission('careers', 'update'), careerController.updateApplication);

/**
 * @swagger
 * /api/careers/{id}:
 *   delete:
 *     summary: Delete application (Admin)
 *     description: Permanently delete a career application
 *     tags: [Careers]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Application ID
 *     responses:
 *       200:
 *         description: Application successfully deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Başvuru silindi
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
 *         description: Application not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', checkPermission('careers', 'delete'), careerController.deleteApplication);

module.exports = router;
