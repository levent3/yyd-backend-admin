const brandAssetRepo = require('./brand-asset.repository');
const { parsePagination, createPaginatedResponse } = require('../../../utils/pagination');

const getAllBrandAssets = async (queryParams = {}) => {
  const { page, limit, fileType, language, isActive } = queryParams;
  const { skip, limit: take } = parsePagination(page, limit);

  // Build where clause
  const where = {};
  if (fileType) where.fileType = fileType;
  if (language) where.language = language;
  if (isActive !== undefined) where.isActive = isActive === 'true';

  const [assets, total] = await Promise.all([
    brandAssetRepo.findMany({ skip, take, where }),
    brandAssetRepo.count(where),
  ]);

  return createPaginatedResponse(assets, total, parseInt(page) || 1, take);
};

const getBrandAssetById = async (id) => {
  const asset = await brandAssetRepo.findById(id);

  if (!asset) {
    const error = new Error('Brand asset bulunamadı');
    error.statusCode = 404;
    throw error;
  }

  return asset;
};

const createBrandAsset = async (data) => {
  const mappedData = {
    fileName: data.fileName,
    fileType: data.fileType,
    fileUrl: data.fileUrl,
    thumbnailUrl: data.thumbnailUrl || null,
    fileSize: data.fileSize ? parseInt(data.fileSize) : null,
    language: data.language || null,
    version: data.version || null,
    description: data.description || null,
    isActive: data.isActive !== undefined ? data.isActive : true,
    displayOrder: data.displayOrder ? parseInt(data.displayOrder) : 0
  };

  return await brandAssetRepo.create(mappedData);
};

const updateBrandAsset = async (id, data) => {
  // Check if exists
  await getBrandAssetById(id);

  const mappedData = {};

  if (data.fileName !== undefined) mappedData.fileName = data.fileName;
  if (data.fileType !== undefined) mappedData.fileType = data.fileType;
  if (data.fileUrl !== undefined) mappedData.fileUrl = data.fileUrl;
  if (data.thumbnailUrl !== undefined) mappedData.thumbnailUrl = data.thumbnailUrl;
  if (data.fileSize !== undefined) mappedData.fileSize = data.fileSize ? parseInt(data.fileSize) : null;
  if (data.language !== undefined) mappedData.language = data.language;
  if (data.version !== undefined) mappedData.version = data.version;
  if (data.description !== undefined) mappedData.description = data.description;
  if (data.isActive !== undefined) mappedData.isActive = data.isActive;
  if (data.displayOrder !== undefined) mappedData.displayOrder = parseInt(data.displayOrder);

  return await brandAssetRepo.update(id, mappedData);
};

const deleteBrandAsset = async (id) => {
  // Check if exists
  await getBrandAssetById(id);

  return await brandAssetRepo.deleteById(id);
};

// Get assets by file type (for public use)
const getAssetsByFileType = async (fileType) => {
  return await brandAssetRepo.findByFileType(fileType);
};

module.exports = {
  getAllBrandAssets,
  getBrandAssetById,
  createBrandAsset,
  updateBrandAsset,
  deleteBrandAsset,
  getAssetsByFileType
};
