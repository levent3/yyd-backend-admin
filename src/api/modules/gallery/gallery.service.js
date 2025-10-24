const galleryRepo = require('./gallery.repository');
const { parsePagination, createPaginatedResponse } = require('../../../utils/pagination');

// Helper to convert relative URLs to full URLs
const normalizeFileUrl = (fileUrl) => {
  if (!fileUrl) return fileUrl;

  // Eğer URL zaten tam URL ise (http:// veya https:// ile başlıyorsa) olduğu gibi dön
  if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
    return fileUrl;
  }

  // Relative URL ise tam URL'e çevir
  const baseUrl = process.env.BASE_URL || 'http://localhost:5001';
  return `${baseUrl}${fileUrl}`;
};

const normalizeGalleryItem = (item) => {
  if (!item) return item;
  return {
    ...item,
    fileUrl: normalizeFileUrl(item.fileUrl)
  };
};

const getAllGalleryItems = async (queryParams = {}) => {
  const { page, limit, mediaType, projectId, ...rest } = queryParams;
  const { skip, limit: take } = parsePagination(page, limit);

  const where = {};

  if (mediaType) where.mediaType = mediaType;
  if (projectId) where.projectId = parseInt(projectId);

  const [data, total] = await Promise.all([
    galleryRepo.findMany({ skip, take, where }),
    galleryRepo.count(where),
  ]);

  // Normalize file URLs
  const normalizedData = data.map(normalizeGalleryItem);

  return createPaginatedResponse(normalizedData, total, parseInt(page) || 1, take);
};

const getGalleryItemById = async (id) => {
  const item = await galleryRepo.findById(id);
  return normalizeGalleryItem(item);
};

const createGalleryItem = async (data) => {
  const mappedData = {
    title: data.title || null,
    mediaType: data.mediaType || 'image', // "image" or "video" - default to "image"
    fileUrl: data.fileUrl || data.imageUrl, // Support both fileUrl and imageUrl
    projectId: data.projectId ? parseInt(data.projectId) : null,
    uploaderId: data.uploaderId
  };

  const item = await galleryRepo.create(mappedData);
  return normalizeGalleryItem(item);
};

const updateGalleryItem = async (id, data) => {
  const mappedData = {};

  if (data.title !== undefined) {
    mappedData.title = data.title;
  }

  if (data.mediaType !== undefined) {
    mappedData.mediaType = data.mediaType;
  }

  if (data.fileUrl !== undefined) {
    mappedData.fileUrl = data.fileUrl;
  }

  if (data.projectId !== undefined) {
    mappedData.projectId = data.projectId ? parseInt(data.projectId) : null;
  }

  const item = await galleryRepo.update(id, mappedData);
  return normalizeGalleryItem(item);
};

const deleteGalleryItem = (id) => {
  return galleryRepo.deleteById(id);
};

const getPublicGallery = async (filters) => {
  const items = await galleryRepo.findPublic(filters);
  return items.map(normalizeGalleryItem);
};

module.exports = {
  getAllGalleryItems,
  getGalleryItemById,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  getPublicGallery
};
