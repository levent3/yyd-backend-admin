/**
 * Brand Asset Controller
 *
 * Kurumsal kimlik dosyalarını (logo, PDF, vb.) yönetir.
 * - Logo dosyaları (PNG, SVG, PDF)
 * - Marka kılavuzları
 * - Renk paletleri
 * - Font dosyaları
 *
 * Factory pattern kullanılarak standard CRUD işlemleri sağlanır.
 */

const brandAssetService = require('./brand-asset.service');
const { createCRUDController } = require('../../../utils/controllerFactory');

// ========== STANDARD CRUD OPERATIONS (Factory ile) ==========

const brandAssetServiceAdapter = {
  getAll: (query) => brandAssetService.getAllBrandAssets(query),
  getById: (id) => brandAssetService.getBrandAssetById(id),
  create: (data) => brandAssetService.createBrandAsset(data),
  update: (id, data) => brandAssetService.updateBrandAsset(id, data),
  delete: (id) => brandAssetService.deleteBrandAsset(id),
};

// Factory ile controller oluştur
const crudController = createCRUDController(brandAssetServiceAdapter, {
  entityName: 'Brand Asset',
  entityNamePlural: 'Brand Assets',
  // Cache invalidation: create/update/delete işlemlerinde cache temizle
  cachePatterns: ['cache:/api/brand-assets*'],
});

// ========== ÖZEL METODLAR (Elle tanımlı) ==========

// GET /api/brand-assets/type/:fileType - Get assets by file type (public)
const getAssetsByFileType = async (req, res, next) => {
  try {
    const { fileType } = req.params;
    const assets = await brandAssetService.getAssetsByFileType(fileType);

    res.json({
      success: true,
      message: `${fileType} tipi brand asset'ler başarıyla getirildi`,
      data: assets,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

// ========== EXPORT ==========

module.exports = {
  // Standard CRUD (factory'den)
  getAllBrandAssets: crudController.getAll,
  getBrandAssetById: crudController.getById,
  createBrandAsset: crudController.create,
  updateBrandAsset: crudController.update,
  deleteBrandAsset: crudController.delete,

  // Özel metodlar
  getAssetsByFileType,
};
