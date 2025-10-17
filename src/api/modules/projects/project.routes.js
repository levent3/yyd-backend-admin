const express = require('express');
const projectController = require('./project.controller');
const authMiddleware = require('../../middlewares/authMiddleware');
const { checkPermission } = require('../../middlewares/rbacMiddleware');
const { cacheMiddleware } = require('../../middlewares/cacheMiddleware');
const { validationMiddleware } = require('../../validators/dynamicValidator');
const router = express.Router();

// ========== PUBLIC ROUTES (Auth GEREKMİYOR) ==========

/**
 * @swagger
 * /api/projects/public:
 *   get:
 *     summary: Get all active projects (Public)
 *     description: Retrieve list of active projects without authentication
 *     tags: [Projects - Public]
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
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: country
 *         schema:
 *           type: string
 *       - in: query
 *         name: isFeatured
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Projects retrieved successfully
 */
router.get('/public', cacheMiddleware(600), projectController.getPublicProjects);

/**
 * @swagger
 * /api/projects/public/{slug}:
 *   get:
 *     summary: Get project by slug (Public)
 *     description: Retrieve project details by slug without authentication
 *     tags: [Projects - Public]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project details retrieved successfully
 *       404:
 *         description: Project not found
 */
router.get('/public/:slug', cacheMiddleware(1800), projectController.getPublicProjectBySlug);

// ========== PROTECTED ROUTES (Auth GEREKLİ) ==========

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Get all projects
 *     description: Retrieve a paginated list of projects with optional filters
 *     tags: [Projects]
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
 *           enum: [draft, active, completed, archived]
 *         description: Filter projects by status
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter projects by category
 *     responses:
 *       200:
 *         description: Successfully retrieved projects
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Project'
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
router.get('/', authMiddleware, checkPermission('projects', 'read'), projectController.getAllProjects);

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: Get project by ID
 *     description: Retrieve detailed information about a specific project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Successfully retrieved project
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
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
 *         description: Project not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', authMiddleware, checkPermission('projects', 'read'), projectController.getProjectById);

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Create new project
 *     description: Create a new project with details and gallery
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, slug, description, content, category, location, status]
 *             properties:
 *               title:
 *                 type: string
 *                 example: Community Center Renovation
 *               slug:
 *                 type: string
 *                 example: community-center-renovation
 *               description:
 *                 type: string
 *                 example: Renovating the local community center to serve more families
 *               content:
 *                 type: string
 *                 example: Detailed project description and objectives
 *               category:
 *                 type: string
 *                 example: Infrastructure
 *               location:
 *                 type: string
 *                 example: Istanbul, Turkey
 *               status:
 *                 type: string
 *                 enum: [draft, active, completed, archived]
 *                 example: active
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: 2024-01-15
 *               endDate:
 *                 type: string
 *                 format: date
 *                 example: 2024-12-31
 *               budget:
 *                 type: number
 *                 example: 50000
 *               featuredImage:
 *                 type: string
 *                 example: https://example.com/images/project.jpg
 *               gallery:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     imageUrl:
 *                       type: string
 *                       example: https://example.com/images/gallery1.jpg
 *                     caption:
 *                       type: string
 *                       example: Project progress photo
 *                     displayOrder:
 *                       type: integer
 *                       example: 1
 *     responses:
 *       201:
 *         description: Project successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
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
router.post('/', authMiddleware, checkPermission('projects', 'create'), validationMiddleware('project'), projectController.createProject);

/**
 * @swagger
 * /api/projects/{id}:
 *   put:
 *     summary: Update project
 *     description: Update project information and gallery
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Project ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Community Center Renovation
 *               slug:
 *                 type: string
 *                 example: community-center-renovation
 *               description:
 *                 type: string
 *                 example: Renovating the local community center to serve more families
 *               content:
 *                 type: string
 *                 example: Detailed project description and objectives
 *               category:
 *                 type: string
 *                 example: Infrastructure
 *               location:
 *                 type: string
 *                 example: Istanbul, Turkey
 *               status:
 *                 type: string
 *                 enum: [draft, active, completed, archived]
 *                 example: active
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: 2024-01-15
 *               endDate:
 *                 type: string
 *                 format: date
 *                 example: 2024-12-31
 *               budget:
 *                 type: number
 *                 example: 50000
 *               featuredImage:
 *                 type: string
 *                 example: https://example.com/images/project.jpg
 *               gallery:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/GalleryItem'
 *     responses:
 *       200:
 *         description: Project successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
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
 *         description: Project not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', authMiddleware, checkPermission('projects', 'update'), validationMiddleware('project'), projectController.updateProject);

/**
 * @swagger
 * /api/projects/{id}:
 *   delete:
 *     summary: Delete project
 *     description: Permanently delete a project and its gallery
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project successfully deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Project deleted successfully
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
 *         description: Project not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', authMiddleware, checkPermission('projects', 'delete'), projectController.deleteProject);

/**
 * @swagger
 * /api/projects/upload-image:
 *   post:
 *     summary: Upload project image
 *     description: Upload an image file for project gallery or featured image
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [image]
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file to upload (JPEG, PNG, GIF)
 *     responses:
 *       200:
 *         description: Image successfully uploaded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 imageUrl:
 *                   type: string
 *                   example: https://example.com/uploads/project-image-123.jpg
 *                 message:
 *                   type: string
 *                   example: Image uploaded successfully
 *       400:
 *         description: Invalid file type or missing file
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
router.post('/upload-image',
  authMiddleware,
  checkPermission('projects', 'create'),
  projectController.upload.single('image'),
  projectController.uploadImage
);

module.exports = router;