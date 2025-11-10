const successStoryService = require('./success-story.service');
const { createCRUDController } = require('../../../utils/controllerFactory');

const successStoryServiceAdapter = {
  getAll: (query) => successStoryService.getAllSuccessStories(query),
  getById: (id, query) => successStoryService.getSuccessStoryById(id, query.language),
  create: (data) => successStoryService.createSuccessStory(data),
  update: (id, data) => successStoryService.updateSuccessStory(id, data),
  delete: (id) => successStoryService.deleteSuccessStory(id),
};

const crudController = createCRUDController(successStoryServiceAdapter, {
  entityName: 'Success Story',
  entityNamePlural: 'Success Stories',
  // Cache invalidation: create/update/delete işlemlerinde cache temizle
  cachePatterns: ['cache:/api/success-stories*'],
});

const getAllActiveSuccessStories = async (req, res, next) => {
  try {
    const { language } = req.query;
    const stories = await successStoryService.getAllActiveSuccessStories(language);
    res.json({ success: true, message: 'Aktif başarı hikayeleri başarıyla getirildi', data: stories, timestamp: new Date().toISOString() });
  } catch (error) {
    next(error);
  }
};

const getSuccessStoriesByLocation = async (req, res, next) => {
  try {
    const { location } = req.params;
    const { language } = req.query;
    const stories = await successStoryService.getSuccessStoriesByLocation(location, language);
    res.json({ success: true, message: `${location} lokasyonu başarı hikayeleri başarıyla getirildi`, data: stories, timestamp: new Date().toISOString() });
  } catch (error) {
    next(error);
  }
};

const getFeaturedSuccessStories = async (req, res, next) => {
  try {
    const { language } = req.query;
    const stories = await successStoryService.getFeaturedSuccessStories(language);
    res.json({ success: true, message: 'Öne çıkan başarı hikayeleri başarıyla getirildi', data: stories, timestamp: new Date().toISOString() });
  } catch (error) {
    next(error);
  }
};

const getSuccessStoryBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { language } = req.query;
    const story = await successStoryService.getSuccessStoryBySlug(slug, language || 'tr');
    res.json({ success: true, data: story, timestamp: new Date().toISOString() });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllSuccessStories: crudController.getAll,
  getSuccessStoryById: crudController.getById,
  createSuccessStory: crudController.create,
  updateSuccessStory: crudController.update,
  deleteSuccessStory: crudController.delete,
  getAllActiveSuccessStories,
  getSuccessStoriesByLocation,
  getFeaturedSuccessStories,
  getSuccessStoryBySlug,
};
