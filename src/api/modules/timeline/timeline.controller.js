const timelineService = require('./timeline.service');
const { createCRUDController } = require('../../../utils/controllerFactory');

// Service adapter for factory
const timelineServiceAdapter = {
  getAll: (query) => timelineService.getAllTimelines(query),
  getById: (id, query) => {
    const language = query.language || 'tr';
    return timelineService.getTimelineById(id, language);
  },
  create: (data) => timelineService.createTimeline(data),
  update: (id, data) => timelineService.updateTimeline(id, data),
  delete: (id) => timelineService.deleteTimeline(id),
};

const crudController = createCRUDController(timelineServiceAdapter, {
  entityName: 'Timeline',
  entityNamePlural: 'Timeline',
  // beforeCreate hook: Eski formatı yeni formata dönüştür
  beforeCreate: async (req, data) => {
    // Eğer translations yoksa, eski formatı yeni formata dönüştür
    if (!data.translations && (data.title || data.description)) {
      data.translations = [{
        language: 'tr',
        title: data.title || 'Yeni Olay',
        description: data.description || null
      }];
      // Eski field'ları sil
      delete data.title;
      delete data.description;
    }

    return data;
  },
});

// Yıla göre timeline'ları getir (özel endpoint)
const getTimelinesByYear = async (req, res, next) => {
  try {
    const { year } = req.params;
    const language = req.query.language || 'tr';

    const timelines = await timelineService.getTimelinesByYear(year, language);

    res.status(200).json({
      success: true,
      message: `${year} yılına ait timeline'lar başarıyla getirildi`,
      data: timelines,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  // Standard CRUD (factory'den)
  getAllTimelines: crudController.getAll,
  getTimelineById: crudController.getById,
  createTimeline: crudController.create,
  updateTimeline: crudController.update,
  deleteTimeline: crudController.delete,

  // Özel endpoint
  getTimelinesByYear,
};
