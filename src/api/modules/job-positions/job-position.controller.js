/**
 * Job Position Controller
 *
 * Açık iş pozisyonlarını yönetir (Kariyer sayfası için).
 * - Public endpoint: Aktif pozisyonları listeleme
 * - Admin endpoint: CRUD işlemleri
 * - Slug-based detay sayfası
 *
 * Factory pattern kullanılarak standard CRUD işlemleri sağlanır.
 */

const jobPositionService = require('./job-position.service');
const { createCRUDController } = require('../../../utils/controllerFactory');

// ========== STANDARD CRUD OPERATIONS (Factory ile) ==========

const jobPositionServiceAdapter = {
  getAll: (query) => jobPositionService.getAllJobPositions(query),
  getById: (id) => jobPositionService.getJobPositionById(id),
  create: (data) => jobPositionService.createJobPosition(data),
  update: (id, data) => jobPositionService.updateJobPosition(id, data),
  delete: (id) => jobPositionService.deleteJobPosition(id),
};

// Factory ile controller oluştur
const crudController = createCRUDController(jobPositionServiceAdapter, {
  entityName: 'Pozisyon',
  entityNamePlural: 'Pozisyonlar',
});

// ========== ÖZEL METODLAR (Elle tanımlı) ==========

// GET /api/job-positions/slug/:slug - Get position by slug (public)
const getJobPositionBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const position = await jobPositionService.getJobPositionBySlug(slug);

    res.json({
      success: true,
      data: position,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

// ========== EXPORT ==========

module.exports = {
  // Standard CRUD (factory'den)
  getAllJobPositions: crudController.getAll,
  getJobPositionById: crudController.getById,
  createJobPosition: crudController.create,
  updateJobPosition: crudController.update,
  deleteJobPosition: crudController.delete,

  // Özel metodlar
  getJobPositionBySlug,
};
