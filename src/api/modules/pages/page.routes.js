const express = require('express');
const router = express.Router();
const pageController = require('./page.controller');
const authMiddleware = require('../../middlewares/authMiddleware');
const { checkPermission } = require('../../middlewares/rbacMiddleware');
const { cacheMiddleware } = require('../../middlewares/cacheMiddleware');

// ========== PUBLIC ROUTES (No Authentication Required) ==========

/**
 * @swagger
 * /api/pages/public:
 *   get:
 *     summary: Get all published public pages
 *     description: Get all active and published pages accessible to public
 *     tags: [Pages - Public]
 *     parameters:
 *       - in: query
 *         name: pageType
 *         schema:
 *           type: string
 *           enum: [about, terms, privacy, faq, contact, team, general]
 *         description: Filter by page type
 *     responses:
 *       200:
 *         description: List of public pages
 */
router.get(
  '/public',
  cacheMiddleware(3600), // 1 hour cache
  pageController.getPublicPages
);

/**
 * @swagger
 * /api/pages/public/slug/{slug}:
 *   get:
 *     summary: Get a published page by slug
 *     description: Get full page content by slug for public viewing
 *     tags: [Pages - Public]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Page slug
 *     responses:
 *       200:
 *         description: Page details
 *       404:
 *         description: Page not found
 */
router.get(
  '/public/slug/:slug',
  cacheMiddleware(3600), // 1 hour cache
  pageController.getPublicPageBySlug
);

/**
 * @swagger
 * /api/pages/public/type/{pageType}:
 *   get:
 *     summary: Get all pages by page type
 *     description: Get all published pages of a specific type
 *     tags: [Pages - Public]
 *     parameters:
 *       - in: path
 *         name: pageType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [about, terms, privacy, faq, contact, team, general]
 *         description: Page type
 *     responses:
 *       200:
 *         description: List of pages
 */
router.get(
  '/public/type/:pageType',
  cacheMiddleware(3600), // 1 hour cache
  pageController.getPublicPagesByType
);

// ========== ADMIN ROUTES (Authentication + RBAC Required) ==========

// All routes below require authentication
router.use(authMiddleware);

/**
 * @swagger
 * /api/pages:
 *   get:
 *     summary: Get all pages (Admin)
 *     description: Get all pages with filtering and pagination for admin panel
 *     tags: [Pages - Admin]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published]
 *       - in: query
 *         name: pageType
 *         schema:
 *           type: string
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: isPublic
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: Pages list with pagination
 */
router.get(
  '/',
  checkPermission('pages', 'read'),
  pageController.getAllPages
);

/**
 * @swagger
 * /api/pages/{id}:
 *   get:
 *     summary: Get page by ID (Admin)
 *     description: Get full page details by ID for admin panel
 *     tags: [Pages - Admin]
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
 *         description: Page details
 *       404:
 *         description: Page not found
 */
router.get(
  '/:id',
  checkPermission('pages', 'read'),
  pageController.getPageById
);

/**
 * @swagger
 * /api/pages/slug/{slug}:
 *   get:
 *     summary: Get page by slug (Admin)
 *     description: Get full page details by slug for admin panel
 *     tags: [Pages - Admin]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Page details
 *       404:
 *         description: Page not found
 */
router.get(
  '/slug/:slug',
  checkPermission('pages', 'read'),
  pageController.getPageBySlug
);

/**
 * @swagger
 * /api/pages:
 *   post:
 *     summary: Create a new page
 *     description: Create a new static page
 *     tags: [Pages - Admin]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - slug
 *             properties:
 *               title:
 *                 type: string
 *               slug:
 *                 type: string
 *               content:
 *                 type: string
 *               excerpt:
 *                 type: string
 *               metaTitle:
 *                 type: string
 *               metaDescription:
 *                 type: string
 *               metaKeywords:
 *                 type: string
 *               pageType:
 *                 type: string
 *                 enum: [about, terms, privacy, faq, contact, team, general]
 *                 default: general
 *               status:
 *                 type: string
 *                 enum: [draft, published]
 *                 default: draft
 *               isPublic:
 *                 type: boolean
 *                 default: true
 *               isActive:
 *                 type: boolean
 *                 default: true
 *               displayOrder:
 *                 type: integer
 *                 default: 0
 *               featuredImage:
 *                 type: string
 *     responses:
 *       201:
 *         description: Page created successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Slug already exists
 */
router.post(
  '/',
  checkPermission('pages', 'create'),
  pageController.createPage
);

/**
 * @swagger
 * /api/pages/{id}:
 *   put:
 *     summary: Update a page
 *     description: Update an existing page
 *     tags: [Pages - Admin]
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
 *               title:
 *                 type: string
 *               slug:
 *                 type: string
 *               content:
 *                 type: string
 *               excerpt:
 *                 type: string
 *               metaTitle:
 *                 type: string
 *               metaDescription:
 *                 type: string
 *               metaKeywords:
 *                 type: string
 *               pageType:
 *                 type: string
 *                 enum: [about, terms, privacy, faq, contact, team, general]
 *               status:
 *                 type: string
 *                 enum: [draft, published]
 *               isPublic:
 *                 type: boolean
 *               isActive:
 *                 type: boolean
 *               displayOrder:
 *                 type: integer
 *               featuredImage:
 *                 type: string
 *     responses:
 *       200:
 *         description: Page updated successfully
 *       404:
 *         description: Page not found
 *       409:
 *         description: Slug already exists
 */
router.put(
  '/:id',
  checkPermission('pages', 'update'),
  pageController.updatePage
);

/**
 * @swagger
 * /api/pages/{id}:
 *   delete:
 *     summary: Delete a page
 *     description: Delete a page by ID
 *     tags: [Pages - Admin]
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
 *         description: Page deleted successfully
 *       404:
 *         description: Page not found
 */
router.delete(
  '/:id',
  checkPermission('pages', 'delete'),
  pageController.deletePage
);

module.exports = router;
