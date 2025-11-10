/**
 * News Controller
 *
 * REFACTORING NOTU:
 * -----------------
 * Bu controller artık generic controllerFactory kullanıyor.
 * Bu sayede kod tekrarı azaldı ve tutarlılık arttı.
 *
 * Standard CRUD işlemleri (getAll, getById, create, update, delete) factory'den geliyor.
 * Özel metodlar (getPublishedNews, getBySlug) ise aşağıda manuel tanımlanmış.
 *
 * Frontend'e gönderilen response formatı DEĞİŞMEDİ!
 */

const newsService = require('./news.service');
const { createCRUDController } = require('../../../utils/controllerFactory');

// ========== STANDARD CRUD OPERATIONS (Factory ile) ==========

// Service metodlarını factory'nin beklediği formata adapt ediyoruz
const newsServiceAdapter = {
  getAll: (query) => newsService.getAllNews(query),
  getById: (id, query) => newsService.getNewsById(id, query.language || 'tr'),
  create: (data) => newsService.createNews(data),
  update: (id, data) => newsService.updateNews(id, data),
  delete: (id) => newsService.deleteNews(id),
};

// Factory ile controller oluştur
const crudController = createCRUDController(newsServiceAdapter, {
  entityName: 'Haber',
  entityNamePlural: 'Haberler',
  // beforeCreate hook: authorId'yi req.user'dan al
  beforeCreate: async (req, data) => ({
    ...data,
    authorId: req.user.id, // From auth middleware
  }),
  // Cache invalidation: create/update/delete işlemlerinde cache temizle
  cachePatterns: ['cache:/api/news*'],
});

// ========== ÖZEL METODLAR (Elle tanımlı) ==========

// GET /api/news/published - Get published news (public)
const getPublishedNews = async (req, res, next) => {
  try {
    const news = await newsService.getPublishedNews(req.query);
    res.json(news);
  } catch (error) {
    next(error);
  }
};

// GET /api/news/slug/:slug - Get news by slug (public)
const getNewsBySlug = async (req, res, next) => {
  try {
    const language = req.query.language || 'tr';
    const news = await newsService.getNewsBySlug(req.params.slug, language);

    if (!news) {
      return res.status(404).json({ message: 'Haber bulunamadı' });
    }

    res.json(news);
  } catch (error) {
    next(error);
  }
};

// ========== EXPORT ==========

module.exports = {
  // Standard CRUD (factory'den)
  getAllNews: crudController.getAll,
  getNewsById: crudController.getById,
  createNews: crudController.create,
  updateNews: crudController.update,
  deleteNews: crudController.delete,

  // Özel metodlar
  getPublishedNews,
  getNewsBySlug,
};
