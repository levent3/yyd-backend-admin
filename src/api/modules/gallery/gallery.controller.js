/**
 * Gallery Controller
 *
 * REFACTORING NOTU:
 * -----------------
 * Bu controller artık generic controllerFactory kullanıyor.
 * Standard CRUD işlemleri factory'den geliyor.
 * beforeCreate hook: uploaderId'yi req.user'dan ekliyor.
 * Özel metod: getPublicGallery
 */

const galleryService = require('./gallery.service');
const { createCRUDController } = require('../../../utils/controllerFactory');

// ========== STANDARD CRUD OPERATIONS (Factory ile) ==========

const galleryServiceAdapter = {
  getAll: (query) => galleryService.getAllGalleryItems(query),
  getById: (id) => galleryService.getGalleryItemById(id),
  create: (data) => galleryService.createGalleryItem(data),
  update: (id, data) => galleryService.updateGalleryItem(id, data),
  delete: (id) => galleryService.deleteGalleryItem(id),
};

const crudController = createCRUDController(galleryServiceAdapter, {
  entityName: 'Galeri öğesi',
  entityNamePlural: 'Galeri öğeleri',
  // Cache invalidation: create/update/delete işlemlerinde cache temizle
  cachePatterns: ['cache:/api/gallery*'],
  // beforeCreate hook: uploaderId'yi req.user'dan al
  beforeCreate: async (req, data) => ({
    ...data,
    uploaderId: req.user.id, // From auth middleware
  }),
});

// ========== ÖZEL METODLAR ==========

// GET /api/gallery/public - Get public gallery items
const getPublicGallery = async (req, res, next) => {
  try {
    const filters = {
      mediaType: req.query.mediaType,
      projectId: req.query.projectId
    };

    const galleryItems = await galleryService.getPublicGallery(filters);
    res.json(galleryItems);
  } catch (error) {
    next(error);
  }
};

// ========== EXPORT ==========

module.exports = {
  // Standard CRUD (factory'den)
  getAllGalleryItems: crudController.getAll,
  getGalleryItemById: crudController.getById,
  createGalleryItem: crudController.create,
  updateGalleryItem: crudController.update,
  deleteGalleryItem: crudController.delete,

  // Özel metodlar
  getPublicGallery,
};
