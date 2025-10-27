/**
 * Public Spot Controller
 *
 * Kamu spotları ve videoları yönetir.
 * Multi-language desteği ile çalışır.
 * - Video URL (YouTube, Vimeo, self-hosted)
 * - Kategori bazlı filtreleme
 * - View count tracking
 * - Featured spots
 *
 * Factory pattern kullanılarak standard CRUD işlemleri sağlanır.
 */

const publicSpotService = require('./public-spot.service');
const { createCRUDController } = require('../../../utils/controllerFactory');

// ========== STANDARD CRUD OPERATIONS (Factory ile) ==========

const publicSpotServiceAdapter = {
  getAll: (query) => publicSpotService.getAllPublicSpots(query),
  getById: (id, query) => publicSpotService.getPublicSpotById(id, query.language),
  create: (data) => publicSpotService.createPublicSpot(data),
  update: (id, data) => publicSpotService.updatePublicSpot(id, data),
  delete: (id) => publicSpotService.deletePublicSpot(id),
};

// Factory ile controller oluştur
const crudController = createCRUDController(publicSpotServiceAdapter, {
  entityName: 'Public Spot',
  entityNamePlural: 'Public Spots',
  cachePatterns: ['cache:/public-spots*'],
});

// ========== ÖZEL METODLAR (Elle tanımlı) ==========

// GET /api/public-spots/public - Get all active spots (public)
const getAllActivePublicSpots = async (req, res, next) => {
  try {
    const { language } = req.query;
    const spots = await publicSpotService.getAllActivePublicSpots(language);

    res.json({
      success: true,
      message: 'Aktif kamu spotları başarıyla getirildi',
      data: spots,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/public-spots/category/:category - Get spots by category (public)
const getPublicSpotsByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const { language } = req.query;
    const spots = await publicSpotService.getPublicSpotsByCategory(category, language);

    res.json({
      success: true,
      message: `${category} kategorisi kamu spotları başarıyla getirildi`,
      data: spots,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/public-spots/featured - Get featured spots (public)
const getFeaturedPublicSpots = async (req, res, next) => {
  try {
    const { language } = req.query;
    const spots = await publicSpotService.getFeaturedPublicSpots(language);

    res.json({
      success: true,
      message: 'Öne çıkan kamu spotları başarıyla getirildi',
      data: spots,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/public-spots/:id/view - Increment view count
const incrementViewCount = async (req, res, next) => {
  try {
    const { id } = req.params;
    await publicSpotService.incrementViewCount(id);

    res.json({
      success: true,
      message: 'Görüntülenme sayısı güncellendi',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

// ========== EXPORT ==========

module.exports = {
  // Standard CRUD (factory'den)
  getAllPublicSpots: crudController.getAll,
  getPublicSpotById: crudController.getById,
  createPublicSpot: crudController.create,
  updatePublicSpot: crudController.update,
  deletePublicSpot: crudController.delete,

  // Özel metodlar
  getAllActivePublicSpots,
  getPublicSpotsByCategory,
  getFeaturedPublicSpots,
  incrementViewCount,
};
