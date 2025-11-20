/**
 * Project Controller
 *
 * REFACTORING NOTU:
 * -----------------
 * Bu controller artık generic controllerFactory kullanıyor.
 *
 * ÖNEMLİ: mapProjectToFrontend fonksiyonu transformData olarak factory'ye geçiliyor.
 * Bu sayede tüm CRUD işlemlerinde otomatik mapping yapılıyor.
 *
 * beforeCreate hook: authorId'yi req.user'dan ekliyor.
 * Public endpoint'ler ayrı tanımlanmış.
 */

const projectService = require('./project.service');
const upload = require('../../../config/multer');
const { createCRUDController } = require('../../../utils/controllerFactory');
const { buildFileUrl } = require('../../../utils/urlHelper');

// Helper to map schema to frontend format
const mapProjectToFrontend = (project) => ({
  id: project.id,
  title: project.title,
  slug: project.slug,
  description: project.description || '',
  content: project.content || '',
  coverImage: project.coverImage,
  category: project.category,
  location: project.location,
  country: project.country,
  status: project.status,
  priority: project.priority,
  startDate: project.startDate,
  endDate: project.endDate,
  budget: project.budget,
  targetAmount: project.targetAmount,
  collectedAmount: project.collectedAmount,
  beneficiaryCount: project.beneficiaryCount,
  isActive: project.isActive,
  isFeatured: project.isFeatured,
  displayOrder: project.displayOrder,
  translations: project.translations || [],
  settings: project.settings || null, // Proje ayarları (bağış formu için gerekli)
  createdAt: project.createdAt,
  updatedAt: project.updatedAt
});

// ========== STANDARD CRUD OPERATIONS (Factory ile) ==========

const projectServiceAdapter = {
  getAll: (query) => projectService.getAllProjects(query),
  getById: (id, query) => {
    // Admin endpoint için tüm çevirileri dahil et
    const language = query.language || 'tr';
    return projectService.getProjectById(id, language);
  },
  create: (data) => projectService.createProject(data),
  update: (id, data) => projectService.updateProject(id, data),
  delete: (id) => projectService.deleteProject(id),
};

const crudController = createCRUDController(projectServiceAdapter, {
  entityName: 'Proje',
  entityNamePlural: 'Projeler',
  // transformData: Tüm response'larda mapping uygula
  transformData: mapProjectToFrontend,
  // Cache invalidation: create/update/delete işlemlerinde cache temizle
  cachePatterns: ['cache:/api/projects*'],
  // beforeCreate hook: authorId'yi req.user'dan al
  beforeCreate: async (req, data) => {
    // Eğer translations yoksa, eski formatı yeni formata dönüştür
    if (!data.translations && (data.title || data.description || data.content)) {
      data.translations = [{
        language: 'tr',
        title: data.title || 'Yeni Proje',
        slug: data.slug || null,
        description: data.description || null,
        content: data.content || null
      }];
      // Eski field'ları sil
      delete data.title;
      delete data.slug;
      delete data.description;
      delete data.content;
    }

    return {
      ...data,
      authorId: req.user?.userId || req.user?.id || null, // From auth middleware
    };
  },
});

// ========== ÖZEL METODLAR (Public endpoints & upload) ==========

// Public: Tüm aktif projeleri listele
const getPublicProjects = async (req, res, next) => {
  try {
    const language = req.query.language || 'tr';

    // Sadece aktif projeleri göster
    const filters = {
      ...req.query,
      language, // Dil parametresini ekle
      isActive: 'true',
      status: req.query.status || 'active',
      maxLimit: 20 // Public endpoint için max 20 kayıt
    };

    const result = await projectService.getAllProjects(filters);
    // Artık service'den zaten formatlanmış geliyor
    const mappedProjects = result.data.map(mapProjectToFrontend);

    res.status(200).json({
      success: true,
      message: 'Projeler başarıyla getirildi',
      data: mappedProjects,
      pagination: result.pagination,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

// Public: ShortCode ile proje detayı getir (SMS linkler için)
const getProjectByShortCode = async (req, res, next) => {
  try {
    const language = req.query.language || 'tr';
    const project = await projectService.getProjectByShortCode(req.params.shortCode, language);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Proje bulunamadı',
        timestamp: new Date().toISOString()
      });
    }

    // Sadece aktif projeleri göster
    if (!project.isActive || project.status !== 'active') {
      return res.status(404).json({
        success: false,
        message: 'Proje bulunamadı',
        timestamp: new Date().toISOString()
      });
    }

    res.status(200).json({
      success: true,
      message: 'Proje detayı başarıyla getirildi',
      data: mapProjectToFrontend(project),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

// Public: Slug ile proje detayı getir
const getPublicProjectBySlug = async (req, res, next) => {
  try {
    const language = req.query.language || 'tr';
    const project = await projectService.getProjectBySlug(req.params.slug, language);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Proje bulunamadı',
        timestamp: new Date().toISOString()
      });
    }

    // Sadece aktif projeleri göster
    if (!project.isActive || project.status !== 'active') {
      return res.status(404).json({
        success: false,
        message: 'Proje bulunamadı',
        timestamp: new Date().toISOString()
      });
    }

    res.status(200).json({
      success: true,
      message: 'Proje detayı başarıyla getirildi',
      data: mapProjectToFrontend(project),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

// Görsel yükleme endpoint'i
const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Lütfen bir görsel dosyası yükleyin' });
    }

    // BASE_URL ile tam URL oluştur
    const baseUrl = require('../../../utils/urlHelper').getBaseUrl();
    const imageUrl = `${baseUrl}/uploads/projects/${req.file.filename}`;

    res.status(200).json({
      message: 'Görsel başarıyla yüklendi',
      imageUrl: imageUrl
    });
  } catch (error) {
    next(error);
  }
};

// ========== PAGE BUILDER CONTROLLERS ==========

// PUT /api/projects/:id/builder - Save builder data
const updateBuilderData = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { language = 'tr', builderData, builderHtml, builderCss } = req.body;

    const result = await projectService.updateBuilderData(parseInt(id), language, {
      builderData,
      builderHtml,
      builderCss
    });

    res.status(200).json({
      message: 'Builder data başarıyla güncellendi',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/projects/:id/builder - Get builder data
const getBuilderData = async (req, res, next) => {
  try {
    const { id } = req.params;
    const language = req.query.language || 'tr';

    const builderData = await projectService.getBuilderData(parseInt(id), language);
    res.status(200).json(builderData);
  } catch (error) {
    next(error);
  }
};

// POST /api/projects/migrate-to-builder - Migrate content to page builder
const migrateContentToBuilder = async (req, res, next) => {
  try {
    const { migrateProjectContents } = require('./migrations/content-to-builder');

    const result = await migrateProjectContents();

    res.status(200).json({
      message: 'Migration tamamlandı',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// ========== EXPORT ==========

module.exports = {
  // Standard CRUD (factory'den - mapping otomatik uygulanıyor)
  getAllProjects: crudController.getAll,
  getProjectById: crudController.getById,
  createProject: crudController.create,
  updateProject: crudController.update,
  deleteProject: crudController.delete,

  // Public endpoints (özel)
  getPublicProjects,
  getProjectByShortCode,
  getPublicProjectBySlug,

  // Upload
  uploadImage,
  upload, // Multer middleware'ini export et

  // Page Builder
  updateBuilderData,
  getBuilderData,
  migrateContentToBuilder,
};