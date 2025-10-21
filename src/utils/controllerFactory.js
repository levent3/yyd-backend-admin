/**
 * Generic Controller Factory
 *
 * NEDEN BU DOSYA VAR?
 * -------------------
 * Controller'larda aynı try-catch pattern'leri tekrar tekrar yazılıyordu.
 * Bu factory ile:
 * - Kod tekrarı azalır (~500 satır)
 * - Tutarlılık artar
 * - Hata yönetimi merkezileşir
 * - Yeni modül eklemek kolaylaşır
 *
 * KULLANIM ÖRNEĞİ:
 * -----------------
 * const newsController = createCRUDController(newsService, {
 *   entityName: 'Haber',
 *   entityNamePlural: 'Haberler'
 * });
 *
 * // Ardından route'larda:
 * router.get('/', authMiddleware, newsController.getAll);
 * router.post('/', authMiddleware, newsController.create);
 *
 * FRONTEND ENTEGRASYONUna DOKUNMAZ!
 * ---------------------------------
 * API response formatları aynı kalır, sadece controller katmanı temizlenir.
 */

/**
 * Standard CRUD controller oluşturur
 *
 * @param {Object} service - Servis objesi (getAllX, getXById, createX, updateX, deleteX metodları olmalı)
 * @param {Object} options - Konfigürasyon seçenekleri
 * @param {string} options.entityName - Tekil entity ismi (örn: 'Haber', 'Kampanya')
 * @param {string} options.entityNamePlural - Çoğul entity ismi (örn: 'Haberler', 'Kampanyalar')
 * @param {Function} options.transformData - Data transform fonksiyonu (opsiyonel)
 * @param {Function} options.beforeCreate - Create'den önce çalışacak hook (opsiyonel)
 * @param {Function} options.afterCreate - Create'den sonra çalışacak hook (opsiyonel)
 * @param {Function} options.afterUpdate - Update'den sonra çalışacak hook (opsiyonel)
 * @param {Function} options.afterDelete - Delete'den sonra çalışacak hook (opsiyonel)
 * @param {Array} options.cachePatterns - Invalidate edilecek cache pattern'leri (opsiyonel)
 * @returns {Object} - Controller metodları (getAll, getById, create, update, delete)
 */
const createCRUDController = (service, options = {}) => {
  const {
    entityName = 'Kayıt',
    entityNamePlural = 'Kayıtlar',
    transformData = null,
    beforeCreate = null,
    afterCreate = null,
    afterUpdate = null,
    afterDelete = null,
    cachePatterns = [],
  } = options;

  /**
   * Helper: Cache'leri temizle (eğer cachePatterns verilmişse)
   */
  const invalidateCacheIfNeeded = async () => {
    if (cachePatterns.length > 0) {
      const { invalidateCache } = require('../api/middlewares/cacheMiddleware');
      for (const pattern of cachePatterns) {
        await invalidateCache(pattern);
      }
    }
  };

  /**
   * Helper: Data transform (eğer transformData fonksiyonu verilmişse)
   */
  const applyTransform = (data) => {
    if (!transformData) return data;

    // Array ise her elemanı transform et
    if (Array.isArray(data)) {
      return data.map(transformData);
    }

    // Tek obje ise direkt transform et
    return transformData(data);
  };

  /**
   * GET ALL - Tüm kayıtları getir
   * Pagination desteği var
   */
  const getAll = async (req, res, next) => {
    try {
      const result = await service.getAll(req.query);

      // Eğer result.data varsa (paginated response)
      if (result.data !== undefined) {
        const transformedData = applyTransform(result.data);
        return res.status(200).json({
          data: transformedData,
          pagination: result.pagination,
        });
      }

      // Direkt array dönüyorsa
      const transformedData = applyTransform(result);
      res.status(200).json(transformedData);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET BY ID - ID'ye göre tek kayıt getir
   * 404 kontrolü otomatik yapılır
   */
  const getById = async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const item = await service.getById(id);

      if (!item) {
        return res.status(404).json({ message: `${entityName} bulunamadı` });
      }

      const transformedData = applyTransform(item);
      res.status(200).json(transformedData);
    } catch (error) {
      next(error);
    }
  };

  /**
   * CREATE - Yeni kayıt oluştur
   * beforeCreate ve afterCreate hook'ları çalıştırılır
   * Cache invalidation yapılır
   */
  const create = async (req, res, next) => {
    try {
      let data = req.body;

      // beforeCreate hook varsa çalıştır (örn: authorId ekleme)
      if (beforeCreate) {
        data = await beforeCreate(req, data);
      }

      const newItem = await service.create(data);

      // afterCreate hook varsa çalıştır (örn: email gönderme)
      if (afterCreate) {
        await afterCreate(req, newItem);
      }

      // Cache'leri temizle
      await invalidateCacheIfNeeded();

      const transformedData = applyTransform(newItem);
      res.status(201).json({
        message: `${entityName} oluşturuldu`,
        [entityName.toLowerCase()]: transformedData,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * UPDATE - Mevcut kaydı güncelle
   * afterUpdate hook'u çalıştırılır
   * Cache invalidation yapılır
   */
  const update = async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const updatedItem = await service.update(id, req.body);

      // afterUpdate hook varsa çalıştır
      if (afterUpdate) {
        await afterUpdate(req, updatedItem);
      }

      // Cache'leri temizle
      await invalidateCacheIfNeeded();

      const transformedData = applyTransform(updatedItem);
      res.status(200).json({
        message: `${entityName} güncellendi`,
        [entityName.toLowerCase()]: transformedData,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE - Kaydı sil
   * afterDelete hook'u çalıştırılır
   * Cache invalidation yapılır
   */
  const deleteItem = async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      await service.delete(id);

      // afterDelete hook varsa çalıştır
      if (afterDelete) {
        await afterDelete(req, id);
      }

      // Cache'leri temizle
      await invalidateCacheIfNeeded();

      res.status(200).json({ message: `${entityName} silindi` });
    } catch (error) {
      next(error);
    }
  };

  return {
    getAll,
    getById,
    create,
    update,
    delete: deleteItem,
  };
};

module.exports = {
  createCRUDController,
};
