const mediaCoverageService = require('./media-coverage.service');
const { createCRUDController } = require('../../../utils/controllerFactory');

const mediaCoverageServiceAdapter = {
  getAll: (query) => mediaCoverageService.getAllMediaCoverage(query),
  getById: (id) => mediaCoverageService.getMediaCoverageById(id),
  create: (data) => mediaCoverageService.createMediaCoverage(data),
  update: (id, data) => mediaCoverageService.updateMediaCoverage(id, data),
  delete: (id) => mediaCoverageService.deleteMediaCoverage(id),
};

const crudController = createCRUDController(mediaCoverageServiceAdapter, {
  entityName: 'Media Coverage',
  entityNamePlural: 'Media Coverage',
  // Cache invalidation: create/update/delete işlemlerinde cache temizle
  cachePatterns: ['cache:/api/media-coverage*'],
});

const getAllActiveMediaCoverage = async (req, res, next) => {
  try {
    const coverage = await mediaCoverageService.getAllActiveMediaCoverage();
    res.json({ success: true, message: 'Aktif medya klipleri başarıyla getirildi', data: coverage, timestamp: new Date().toISOString() });
  } catch (error) {
    next(error);
  }
};

const getFeaturedMediaCoverage = async (req, res, next) => {
  try {
    const coverage = await mediaCoverageService.getFeaturedMediaCoverage();
    res.json({ success: true, message: 'Öne çıkan medya klipleri başarıyla getirildi', data: coverage, timestamp: new Date().toISOString() });
  } catch (error) {
    next(error);
  }
};

// POST /api/media-coverage/import-from-website - Import media coverage from YYD website
const importFromWebsite = async (req, res, next) => {
  try {
    const { importMediaCoverage } = require('../../../scripts/import-media-coverage');

    const result = await importMediaCoverage();

    res.status(200).json({
      success: true,
      message: 'Media coverage import tamamlandı',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllMediaCoverage: crudController.getAll,
  getMediaCoverageById: crudController.getById,
  createMediaCoverage: crudController.create,
  updateMediaCoverage: crudController.update,
  deleteMediaCoverage: crudController.delete,
  getAllActiveMediaCoverage,
  getFeaturedMediaCoverage,
  importFromWebsite,
};
