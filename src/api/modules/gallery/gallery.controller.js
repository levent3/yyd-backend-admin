const galleryService = require('./gallery.service');

// GET /api/gallery - Get all gallery items (admin)
const getAllGalleryItems = async (req, res, next) => {
  try {
    const result = await galleryService.getAllGalleryItems(req.query);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

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

// GET /api/gallery/:id - Get gallery item by ID
const getGalleryItemById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const galleryItem = await galleryService.getGalleryItemById(id);

    if (!galleryItem) {
      return res.status(404).json({ message: 'Galeri öğesi bulunamadı' });
    }

    res.json(galleryItem);
  } catch (error) {
    next(error);
  }
};

// POST /api/gallery - Create gallery item
const createGalleryItem = async (req, res, next) => {
  try {
    const galleryData = {
      ...req.body,
      uploaderId: req.user.id // From auth middleware
    };

    const galleryItem = await galleryService.createGalleryItem(galleryData);
    res.status(201).json(galleryItem);
  } catch (error) {
    next(error);
  }
};

// PUT /api/gallery/:id - Update gallery item
const updateGalleryItem = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const galleryItem = await galleryService.updateGalleryItem(id, req.body);
    res.json(galleryItem);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/gallery/:id - Delete gallery item
const deleteGalleryItem = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    await galleryService.deleteGalleryItem(id);
    res.json({ message: 'Galeri öğesi silindi' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllGalleryItems,
  getPublicGallery,
  getGalleryItemById,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem
};
