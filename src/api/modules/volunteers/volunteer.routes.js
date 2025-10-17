const express = require('express');
const router = express.Router();
const volunteerController = require('./volunteer.controller');
const authMiddleware = require('../../middlewares/authMiddleware');
const { checkPermission } = require('../../middlewares/permissionMiddleware');

/**
 * @swagger
 * /api/volunteers:
 *   post:
 *     summary: Submit volunteer application (Public)
 *     description: Create a new volunteer application without authentication
 *     tags: [Volunteers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, email, phone, message]
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: Ayse
 *               lastName:
 *                 type: string
 *                 example: Kaya
 *               email:
 *                 type: string
 *                 format: email
 *                 example: ayse.kaya@example.com
 *               phone:
 *                 type: string
 *                 example: +90 555 234 5678
 *               message:
 *                 type: string
 *                 example: I would like to volunteer for community projects
 *               address:
 *                 type: string
 *                 example: Izmir, Turkey
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 example: 1995-05-15
 *               occupation:
 *                 type: string
 *                 example: Teacher
 *               skills:
 *                 type: string
 *                 example: Education, Communication, Organization
 *               availability:
 *                 type: string
 *                 example: Weekends
 *     responses:
 *       201:
 *         description: Volunteer application successfully submitted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Application submitted successfully
 *                 applicationId:
 *                   type: integer
 *                   example: 1
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', volunteerController.createApplication);

// Protected routes (require authentication)
router.use(authMiddleware);

/**
 * @swagger
 * /api/volunteers:
 *   get:
 *     summary: Get all volunteer applications (Admin)
 *     description: Retrieve paginated list of all volunteer applications
 *     tags: [Volunteers]
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
 *           enum: [pending, approved, rejected, contacted]
 *         description: Filter by application status
 *     responses:
 *       200:
 *         description: Successfully retrieved volunteer applications
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
router.get(
  '/',
  checkPermission('volunteers', 'read'),
  volunteerController.getAllApplications
);

/**
 * @swagger
 * /api/volunteers/pending-count:
 *   get:
 *     summary: Get pending applications count (Admin)
 *     description: Retrieve count of pending volunteer applications for dashboard
 *     tags: [Volunteers]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved pending count
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
router.get(
  '/pending-count',
  checkPermission('volunteers', 'read'),
  volunteerController.getPendingCount
);

/**
 * @swagger
 * /api/volunteers/{id}:
 *   get:
 *     summary: Get volunteer application by ID (Admin)
 *     description: Retrieve detailed information about a specific volunteer application
 *     tags: [Volunteers]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Volunteer application ID
 *     responses:
 *       200:
 *         description: Successfully retrieved volunteer application
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
 *         description: Volunteer application not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/:id',
  checkPermission('volunteers', 'read'),
  volunteerController.getApplicationById
);

/**
 * @swagger
 * /api/volunteers/{id}:
 *   put:
 *     summary: Update volunteer application (Admin)
 *     description: Update volunteer application status and information
 *     tags: [Volunteers]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Volunteer application ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, approved, rejected, contacted]
 *                 example: approved
 *               firstName:
 *                 type: string
 *                 example: Ayse
 *               lastName:
 *                 type: string
 *                 example: Kaya
 *               email:
 *                 type: string
 *                 format: email
 *                 example: ayse.kaya@example.com
 *               phone:
 *                 type: string
 *                 example: +90 555 234 5678
 *               message:
 *                 type: string
 *                 example: Updated message
 *               address:
 *                 type: string
 *                 example: Izmir, Turkey
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 example: 1995-05-15
 *               occupation:
 *                 type: string
 *                 example: Teacher
 *               skills:
 *                 type: string
 *                 example: Education, Communication, Organization
 *               availability:
 *                 type: string
 *                 example: Weekends
 *               adminNotes:
 *                 type: string
 *                 example: Called and confirmed availability
 *     responses:
 *       200:
 *         description: Volunteer application successfully updated
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
 *         description: Volunteer application not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put(
  '/:id',
  checkPermission('volunteers', 'update'),
  volunteerController.updateApplication
);

/**
 * @swagger
 * /api/volunteers/{id}:
 *   delete:
 *     summary: Delete volunteer application (Admin)
 *     description: Permanently delete a volunteer application
 *     tags: [Volunteers]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Volunteer application ID
 *     responses:
 *       200:
 *         description: Volunteer application successfully deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Application deleted successfully
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
 *         description: Volunteer application not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete(
  '/:id',
  checkPermission('volunteers', 'delete'),
  volunteerController.deleteApplication
);

module.exports = router;
