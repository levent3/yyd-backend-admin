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
};
