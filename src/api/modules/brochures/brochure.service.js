const brochureRepo = require('./brochure.repository');
const { parsePagination, createPaginatedResponse } = require('../../../utils/pagination');
const { formatEntityWithTranslation } = require('../../../utils/translationHelper');

const getAllBrochures = async (queryParams = {}) => {
  const { page, limit, category, projectId, campaignId, isActive, language } = queryParams;
  const { skip, limit: take } = parsePagination(page, limit);

  // Build where clause
  const where = {};
  if (category) where.category = category;
  if (projectId) where.projectId = parseInt(projectId);
  if (campaignId) where.campaignId = parseInt(campaignId);
  if (isActive !== undefined) where.isActive = isActive === 'true';

  const [brochures, total] = await Promise.all([
    brochureRepo.findMany({ skip, take, where }),
    brochureRepo.count(where),
  ]);

  // Format with translations
  const formattedBrochures = brochures.map(brochure =>
    formatEntityWithTranslation(brochure, language)
  );

  return createPaginatedResponse(formattedBrochures, total, parseInt(page) || 1, take);
};

const getBrochureById = async (id, language) => {
  const brochure = await brochureRepo.findById(id);

  if (!brochure) {
    const error = new Error('Broşür bulunamadı');
    error.statusCode = 404;
    throw error;
  }

  return formatEntityWithTranslation(brochure, language);
};

const createBrochure = async (data) => {
  const { translations, ...brochureData } = data;

  // Map main data
  const mappedData = {
    pdfUrl: brochureData.pdfUrl,
    thumbnailUrl: brochureData.thumbnailUrl || null,
    fileSize: brochureData.fileSize ? parseInt(brochureData.fileSize) : null,
    category: brochureData.category || null,
    projectId: brochureData.projectId ? parseInt(brochureData.projectId) : null,
    campaignId: brochureData.campaignId ? parseInt(brochureData.campaignId) : null,
    isActive: brochureData.isActive !== undefined ? brochureData.isActive : true,
    isFeatured: brochureData.isFeatured !== undefined ? brochureData.isFeatured : false,
    displayOrder: brochureData.displayOrder ? parseInt(brochureData.displayOrder) : 0,
    publishedAt: brochureData.publishedAt || null
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

  return await brochureRepo.create(mappedData);
};

const updateBrochure = async (id, data) => {
  // Check if exists
  await getBrochureById(id);

  const { translations, ...brochureData } = data;
  const mappedData = {};

  // Map basic fields
  if (brochureData.pdfUrl !== undefined) mappedData.pdfUrl = brochureData.pdfUrl;
  if (brochureData.thumbnailUrl !== undefined) mappedData.thumbnailUrl = brochureData.thumbnailUrl;
  if (brochureData.fileSize !== undefined) mappedData.fileSize = brochureData.fileSize ? parseInt(brochureData.fileSize) : null;
  if (brochureData.category !== undefined) mappedData.category = brochureData.category;
  if (brochureData.projectId !== undefined) mappedData.projectId = brochureData.projectId ? parseInt(brochureData.projectId) : null;
  if (brochureData.campaignId !== undefined) mappedData.campaignId = brochureData.campaignId ? parseInt(brochureData.campaignId) : null;
  if (brochureData.isActive !== undefined) mappedData.isActive = brochureData.isActive;
  if (brochureData.isFeatured !== undefined) mappedData.isFeatured = brochureData.isFeatured;
  if (brochureData.displayOrder !== undefined) mappedData.displayOrder = parseInt(brochureData.displayOrder);
  if (brochureData.publishedAt !== undefined) mappedData.publishedAt = brochureData.publishedAt || null;

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

  return await brochureRepo.update(id, mappedData);
};

const deleteBrochure = async (id) => {
  // Check if exists
  await getBrochureById(id);

  return await brochureRepo.deleteById(id);
};

// Get brochures by category (for public use)
const getBrochuresByCategory = async (category, language) => {
  const brochures = await brochureRepo.findActiveByCategory(category);
  return brochures.map(brochure => formatEntityWithTranslation(brochure, language));
};

// Get all active brochures (for public use)
const getAllActiveBrochures = async (language) => {
  const brochures = await brochureRepo.findAllActive();
  return brochures.map(brochure => formatEntityWithTranslation(brochure, language));
};

module.exports = {
  getAllBrochures,
  getBrochureById,
  createBrochure,
  updateBrochure,
  deleteBrochure,
  getBrochuresByCategory,
  getAllActiveBrochures
};
