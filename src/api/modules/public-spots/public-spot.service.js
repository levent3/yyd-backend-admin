const publicSpotRepo = require('./public-spot.repository');
const { parsePagination, createPaginatedResponse } = require('../../../utils/pagination');
const { formatEntityWithTranslation } = require('../../../utils/translationHelper');

const getAllPublicSpots = async (queryParams = {}) => {
  const { page, limit, category, videoType, isActive, isFeatured, language } = queryParams;
  const { skip, limit: take } = parsePagination(page, limit);

  // Build where clause
  const where = {};
  if (category) where.category = category;
  if (videoType) where.videoType = videoType;
  if (isActive !== undefined) where.isActive = isActive === 'true';
  if (isFeatured !== undefined) where.isFeatured = isFeatured === 'true';

  const [spots, total] = await Promise.all([
    publicSpotRepo.findMany({ skip, take, where }),
    publicSpotRepo.count(where),
  ]);

  // Format with translations
  const formattedSpots = spots.map(spot =>
    formatEntityWithTranslation(spot, language)
  );

  return createPaginatedResponse(formattedSpots, total, parseInt(page) || 1, take);
};

const getPublicSpotById = async (id, language) => {
  const spot = await publicSpotRepo.findById(id);

  if (!spot) {
    const error = new Error('Kamu spotu bulunamadı');
    error.statusCode = 404;
    throw error;
  }

  return formatEntityWithTranslation(spot, language);
};

const createPublicSpot = async (data) => {
  const { translations, ...spotData } = data;

  // Map main data
  const mappedData = {
    videoUrl: spotData.videoUrl,
    videoType: spotData.videoType || 'youtube',
    thumbnailUrl: spotData.thumbnailUrl || null,
    duration: spotData.duration ? parseInt(spotData.duration) : null,
    category: spotData.category || null,
    viewCount: spotData.viewCount ? parseInt(spotData.viewCount) : 0,
    isActive: spotData.isActive !== undefined ? spotData.isActive : true,
    isFeatured: spotData.isFeatured !== undefined ? spotData.isFeatured : false,
    displayOrder: spotData.displayOrder ? parseInt(spotData.displayOrder) : 0,
    publishedAt: spotData.publishedAt || null
  };

  // Add translations if provided
  if (translations && Array.isArray(translations)) {
    mappedData.translations = {
      create: translations.map(t => ({
        language: t.language,
        title: t.title,
        description: t.description || null
      }))
    };
  }

  return await publicSpotRepo.create(mappedData);
};

const updatePublicSpot = async (id, data) => {
  // Check if exists
  await getPublicSpotById(id);

  const { translations, ...spotData } = data;
  const mappedData = {};

  // Map basic fields
  if (spotData.videoUrl !== undefined) mappedData.videoUrl = spotData.videoUrl;
  if (spotData.videoType !== undefined) mappedData.videoType = spotData.videoType;
  if (spotData.thumbnailUrl !== undefined) mappedData.thumbnailUrl = spotData.thumbnailUrl;
  if (spotData.duration !== undefined) mappedData.duration = spotData.duration ? parseInt(spotData.duration) : null;
  if (spotData.category !== undefined) mappedData.category = spotData.category;
  if (spotData.viewCount !== undefined) mappedData.viewCount = parseInt(spotData.viewCount);
  if (spotData.isActive !== undefined) mappedData.isActive = spotData.isActive;
  if (spotData.isFeatured !== undefined) mappedData.isFeatured = spotData.isFeatured;
  if (spotData.displayOrder !== undefined) mappedData.displayOrder = parseInt(spotData.displayOrder);
  if (spotData.publishedAt !== undefined) mappedData.publishedAt = spotData.publishedAt;

  // Update translations if provided
  if (translations && Array.isArray(translations)) {
    // Delete existing translations and create new ones
    mappedData.translations = {
      deleteMany: {},
      create: translations.map(t => ({
        language: t.language,
        title: t.title,
        description: t.description || null
      }))
    };
  }

  return await publicSpotRepo.update(id, mappedData);
};

const deletePublicSpot = async (id) => {
  // Check if exists
  await getPublicSpotById(id);

  return await publicSpotRepo.deleteById(id);
};

// Get public spots by category (for public use)
const getPublicSpotsByCategory = async (category, language) => {
  const spots = await publicSpotRepo.findActiveByCategory(category);
  return spots.map(spot => formatEntityWithTranslation(spot, language));
};

// Get all active public spots (for public use)
const getAllActivePublicSpots = async (language) => {
  const spots = await publicSpotRepo.findAllActive();
  return spots.map(spot => formatEntityWithTranslation(spot, language));
};

// Get featured public spots
const getFeaturedPublicSpots = async (language) => {
  const spots = await publicSpotRepo.findFeatured();
  return spots.map(spot => formatEntityWithTranslation(spot, language));
};

// Increment view count
const incrementViewCount = async (id) => {
  return await publicSpotRepo.incrementViewCount(id);
};

module.exports = {
  getAllPublicSpots,
  getPublicSpotById,
  createPublicSpot,
  updatePublicSpot,
  deletePublicSpot,
  getPublicSpotsByCategory,
  getAllActivePublicSpots,
  getFeaturedPublicSpots,
  incrementViewCount
};
