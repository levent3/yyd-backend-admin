/**
 * Activity Area Controller
 *
 * CRUD operations for managing activity areas
 */

const activityAreaService = require('./activity-area.service');
const { createCRUDController } = require('../../../utils/controllerFactory');

// ========== STANDARD CRUD OPERATIONS (Factory ile) ==========

// Service metodlarını factory'nin beklediği formata adapt ediyoruz
const activityAreaServiceAdapter = {
  getAll: (query) => activityAreaService.getAllActivityAreas(query),
  getById: (id, query) => activityAreaService.getActivityAreaById(id, query.language || 'tr'),
  create: (data) => activityAreaService.createActivityArea(data),
  update: (id, data) => activityAreaService.updateActivityArea(id, data),
  delete: (id) => activityAreaService.deleteActivityArea(id),
};

// Factory ile controller oluştur
const crudController = createCRUDController(activityAreaServiceAdapter, {
  entityName: 'Faaliyet Alanı',
  entityNamePlural: 'Faaliyet Alanları',
  // Cache invalidation: create/update/delete işlemlerinde cache temizle
  cachePatterns: ['cache:/api/activity-areas*'],
});

// ========== ÖZEL METODLAR (Elle tanımlı) ==========

// GET /api/activity-areas/active - Get active activity areas (public)
const getActiveActivityAreas = async (req, res, next) => {
  try {
    const activityAreas = await activityAreaService.getActiveActivityAreas(req.query);
    res.json(activityAreas);
  } catch (error) {
    next(error);
  }
};

// GET /api/activity-areas/slug/:slug - Get activity area by slug (public)
const getActivityAreaBySlug = async (req, res, next) => {
  try {
    const language = req.query.language || 'tr';
    const activityArea = await activityAreaService.getActivityAreaBySlug(req.params.slug, language);

    if (!activityArea) {
      return res.status(404).json({ message: 'Faaliyet alanı bulunamadı' });
    }

    res.json(activityArea);
  } catch (error) {
    next(error);
  }
};

// ========== PAGE BUILDER METHODS ==========

// PUT /api/activity-areas/:id/builder - Update builder data
const updateBuilderData = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { language = 'tr', builderData, builderHtml, builderCss } = req.body;

    const result = await activityAreaService.updateBuilderData(parseInt(id), language, {
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

// GET /api/activity-areas/:id/builder - Get builder data
const getBuilderData = async (req, res, next) => {
  try {
    const { id } = req.params;
    const language = req.query.language || 'tr';

    const builderData = await activityAreaService.getBuilderData(parseInt(id), language);
    res.status(200).json(builderData);
  } catch (error) {
    next(error);
  }
};

// POST /api/activity-areas/migrate-to-builder - Migrate content to builder
const migrateContentToBuilder = async (req, res, next) => {
  try {
    const { migrateActivityAreaContents } = require('./migrations/content-to-builder');
    const result = await migrateActivityAreaContents();

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
  getAllActivityAreas: crudController.getAll,
  getActivityAreaById: crudController.getById,
  createActivityArea: crudController.create,
  updateActivityArea: crudController.update,
  deleteActivityArea: crudController.delete,

  // Özel metodlar
  getActiveActivityAreas,
  getActivityAreaBySlug,

  // Page Builder metodları
  updateBuilderData,
  getBuilderData,
  migrateContentToBuilder,
};
