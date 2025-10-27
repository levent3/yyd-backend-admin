const express = require('express');
const jobPositionController = require('./job-position.controller');
const authMiddleware = require('../../middlewares/authMiddleware');
const { checkPermission } = require('../../middlewares/rbacMiddleware');
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     JobPosition:
 *       type: object
 *       required:
 *         - title
 *         - slug
 *         - description
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated ID
 *         title:
 *           type: string
 *           description: Pozisyon başlığı
 *           example: "Full-Stack Developer"
 *         slug:
 *           type: string
 *           description: URL-friendly slug
 *           example: "full-stack-developer"
 *         description:
 *           type: string
 *           description: Pozisyon açıklaması
 *           example: "Web uygulamaları geliştirmek için..."
 *         requirements:
 *           type: string
 *           description: Gereksinimler
 *           example: "- 3+ yıl deneyim\n- React bilgisi"
 *         responsibilities:
 *           type: string
 *           description: Sorumluluklar
 *           example: "- Frontend geliştirme\n- API entegrasyonu"
 *         qualifications:
 *           type: string
 *           description: Nitelikler
 *           example: "- Üniversite mezunu\n- İngilizce bilgisi"
 *         department:
 *           type: string
 *           description: Departman
 *           example: "Teknoloji"
 *         location:
 *           type: string
 *           description: Lokasyon
 *           example: "İstanbul (Hibrit)"
 *         employmentType:
 *           type: string
 *           description: Çalışma tipi
 *           example: "Tam Zamanlı"
 *         isActive:
 *           type: boolean
 *           description: Aktif mi?
 *           example: true
 *         isFeatured:
 *           type: boolean
 *           description: Öne çıkan mı?
 *           example: false
 *         displayOrder:
 *           type: integer
 *           description: Sıralama
 *           example: 0
 *         deadline:
 *           type: string
 *           format: date-time
 *           description: Son başvuru tarihi
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

// ========== PUBLIC ROUTES ==========

/**
 * @swagger
 * /api/job-positions/public:
 *   get:
 *     summary: Get all active job positions (Public)
 *     description: Tüm aktif iş pozisyonlarını getir (public)
 *     tags: [Job Positions]
 *     parameters:
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Departmana göre filtrele
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Lokasyona göre filtrele
 *     responses:
 *       200:
 *         description: Job positions successfully retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/JobPosition'
 */
router.get('/public', (req, res, next) => {
  req.query.isActive = 'true';
  jobPositionController.getAllJobPositions(req, res, next);
});

/**
 * @swagger
 * /api/job-positions/slug/{slug}:
 *   get:
 *     summary: Get job position by slug (Public)
 *     description: Slug ile pozisyon detayını getir (public)
 *     tags: [Job Positions]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Position slug
 *     responses:
 *       200:
 *         description: Job position successfully retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/JobPosition'
 *       404:
 *         description: Position not found
 */
router.get('/slug/:slug', jobPositionController.getJobPositionBySlug);

// ========== PROTECTED ROUTES (Admin) ==========

// Auth middleware - applies to all routes below
router.use(authMiddleware);

/**
 * @swagger
 * /api/job-positions:
 *   get:
 *     summary: Get all job positions (Admin)
 *     description: Tüm iş pozisyonlarını getir (admin)
 *     tags: [Job Positions]
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
 *         name: department
 *         schema:
 *           type: string
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: string
 *           enum: ['true', 'false']
 *     responses:
 *       200:
 *         description: Positions successfully retrieved
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/', checkPermission('careers', 'read'), jobPositionController.getAllJobPositions);

/**
 * @swagger
 * /api/job-positions/{id}:
 *   get:
 *     summary: Get job position by ID (Admin)
 *     description: ID ile pozisyon detayını getir (admin)
 *     tags: [Job Positions]
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
 *         description: Position successfully retrieved
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 */
router.get('/:id', checkPermission('careers', 'read'), jobPositionController.getJobPositionById);

/**
 * @swagger
 * /api/job-positions:
 *   post:
 *     summary: Create job position (Admin)
 *     description: Yeni pozisyon oluştur (admin)
 *     tags: [Job Positions]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/JobPosition'
 *     responses:
 *       201:
 *         description: Position successfully created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/', checkPermission('careers', 'create'), jobPositionController.createJobPosition);

/**
 * @swagger
 * /api/job-positions/{id}:
 *   put:
 *     summary: Update job position (Admin)
 *     description: Pozisyon güncelle (admin)
 *     tags: [Job Positions]
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
 *             $ref: '#/components/schemas/JobPosition'
 *     responses:
 *       200:
 *         description: Position successfully updated
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 */
router.put('/:id', checkPermission('careers', 'update'), jobPositionController.updateJobPosition);

/**
 * @swagger
 * /api/job-positions/{id}:
 *   delete:
 *     summary: Delete job position (Admin)
 *     description: Pozisyon sil (admin)
 *     tags: [Job Positions]
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
 *         description: Position successfully deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 */
router.delete('/:id', checkPermission('careers', 'delete'), jobPositionController.deleteJobPosition);

module.exports = router;
