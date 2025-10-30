const mediaCoverageRepo = require('./media-coverage.repository');
const { parsePagination, createPaginatedResponse } = require('../../../utils/pagination');

const getAllMediaCoverage = async (queryParams = {}) => {
  const { page, limit, sourceType, category, isActive, isFeatured } = queryParams;
  const { skip, limit: take } = parsePagination(page, limit);

  const where = {};
  if (sourceType) where.sourceType = sourceType;
  if (category) where.category = category;
  if (isActive !== undefined) where.isActive = isActive === 'true';
  if (isFeatured !== undefined) where.isFeatured = isFeatured === 'true';

  const [coverage, total] = await Promise.all([
    mediaCoverageRepo.findMany({ skip, take, where }),
    mediaCoverageRepo.count(where),
  ]);

  return createPaginatedResponse(coverage, total, parseInt(page) || 1, take);
};

const getMediaCoverageById = async (id) => {
  const coverage = await mediaCoverageRepo.findById(id);
  if (!coverage) {
    const error = new Error('Medya klibi bulunamadı');
    error.statusCode = 404;
    throw error;
  }
  return coverage;
};

const createMediaCoverage = async (data) => {
  const mappedData = {
    title: data.title,
    source: data.source,
    sourceType: data.sourceType || 'internet',
    externalUrl: data.externalUrl || null,
    imageUrl: data.imageUrl || null,
    category: data.category || null,
    isActive: data.isActive !== undefined ? data.isActive : true,
    isFeatured: data.isFeatured !== undefined ? data.isFeatured : false,
    displayOrder: data.displayOrder ? parseInt(data.displayOrder) : 0,
    publishedAt: data.publishedAt ? new Date(data.publishedAt).toISOString() : new Date().toISOString()
  };

  return await mediaCoverageRepo.create(mappedData);
};

const updateMediaCoverage = async (id, data) => {
  await getMediaCoverageById(id);

  const mappedData = {};
  if (data.title !== undefined) mappedData.title = data.title;
  if (data.source !== undefined) mappedData.source = data.source;
  if (data.sourceType !== undefined) mappedData.sourceType = data.sourceType;
  if (data.externalUrl !== undefined) mappedData.externalUrl = data.externalUrl;
  if (data.imageUrl !== undefined) mappedData.imageUrl = data.imageUrl;
  if (data.category !== undefined) mappedData.category = data.category;
  if (data.isActive !== undefined) mappedData.isActive = data.isActive;
  if (data.isFeatured !== undefined) mappedData.isFeatured = data.isFeatured;
  if (data.displayOrder !== undefined) mappedData.displayOrder = parseInt(data.displayOrder);
  if (data.publishedAt !== undefined) {
    mappedData.publishedAt = data.publishedAt
      ? new Date(data.publishedAt).toISOString()
      : null;
  }

  return await mediaCoverageRepo.update(id, mappedData);
};

const deleteMediaCoverage = async (id) => {
  await getMediaCoverageById(id);
  return await mediaCoverageRepo.deleteById(id);
};

const getAllActiveMediaCoverage = async () => {
  return await mediaCoverageRepo.findAllActive();
};

const getFeaturedMediaCoverage = async () => {
  return await mediaCoverageRepo.findFeatured();
};

module.exports = {
  getAllMediaCoverage,
  getMediaCoverageById,
  createMediaCoverage,
  updateMediaCoverage,
  deleteMediaCoverage,
  getAllActiveMediaCoverage,
  getFeaturedMediaCoverage
};
