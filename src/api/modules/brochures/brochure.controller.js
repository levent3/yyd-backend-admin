/**
 * Brochure Controller
 *
 * Broşürleri (katalog, dergi, bülten vb.) yönetir.
 * Multi-language desteği ile çalışır.
 * - Project veya Campaign ile ilişkilendirilebilir
 * - Tip bazlı filtreleme (catalog, magazine, bulletin, report, other)
 * - PDF dosyası ve thumbnail ile birlikte
 *
 * Factory pattern kullanılarak standard CRUD işlemleri sağlanır.
 */

const brochureService = require('./brochure.service');
const { createCRUDController } = require('../../../utils/controllerFactory');

// ========== STANDARD CRUD OPERATIONS (Factory ile) ==========

const brochureServiceAdapter = {
  getAll: (query) => brochureService.getAllBrochures(query),
  getById: (id, query) => brochureService.getBrochureById(id, query.language),
  create: (data) => brochureService.createBrochure(data),
  update: (id, data) => brochureService.updateBrochure(id, data),
  delete: (id) => brochureService.deleteBrochure(id),
};

// Factory ile controller oluştur
const crudController = createCRUDController(brochureServiceAdapter, {
  entityName: 'Brochure',
  entityNamePlural: 'Brochures',
  // Cache invalidation: create/update/delete işlemlerinde cache temizle
  cachePatterns: ['cache:/api/brochures*'],
});

// ========== ÖZEL METODLAR (Elle tanımlı) ==========

// GET /api/brochures/public - Get all active brochures (public)
const getAllActiveBrochures = async (req, res, next) => {
  try {
    const { language } = req.query;
    const brochures = await brochureService.getAllActiveBrochures(language);

    res.json({
      success: true,
      message: 'Aktif broşürler başarıyla getirildi',
      data: brochures,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/brochures/category/:category - Get brochures by category (public)
const getBrochuresByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const { language } = req.query;
    const brochures = await brochureService.getBrochuresByCategory(category, language);

    res.json({
      success: true,
      message: `${category} kategorisi broşürler başarıyla getirildi`,
      data: brochures,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

// ========== PAGE BUILDER CONTROLLERS ==========

// PUT /api/brochures/:id/builder - Save builder data
const updateBuilderData = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { language = 'tr', builderData, builderHtml, builderCss } = req.body;

    const result = await brochureService.updateBuilderData(parseInt(id), language, {
      builderData,
      builderHtml,
      builderCss
    });

    res.status(200).json({
      message: 'Builder data başarıyla güncellendi',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/brochures/:id/builder - Get builder data
const getBuilderData = async (req, res, next) => {
  try {
    const { id } = req.params;
    const language = req.query.language || 'tr';

    const builderData = await brochureService.getBuilderData(parseInt(id), language);
    res.status(200).json(builderData);
  } catch (error) {
    next(error);
  }
};

// POST /api/brochures/migrate-to-builder - Migrate content to page builder
const migrateContentToBuilder = async (req, res, next) => {
  try {
    const { migrateBrochureContents } = require('./migrations/content-to-builder');

    const result = await migrateBrochureContents();

    res.status(200).json({
      message: 'Migration tamamlandı',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// ========== EXPORT ==========

module.exports = {
  // Standard CRUD (factory'den)
  getAllBrochures: crudController.getAll,
  getBrochureById: crudController.getById,
  createBrochure: crudController.create,
  updateBrochure: crudController.update,
  deleteBrochure: crudController.delete,

  // Özel metodlar
  getAllActiveBrochures,
  getBrochuresByCategory,

  // Page Builder
  updateBuilderData,
  getBuilderData,
  migrateContentToBuilder,
};
