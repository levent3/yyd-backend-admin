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
  createdAt: project.createdAt,
  updatedAt: project.updatedAt
});

// ========== STANDARD CRUD OPERATIONS (Factory ile) ==========

const projectServiceAdapter = {
  getAll: (query) => projectService.getAllProjects(query),
  getById: (id, query) => projectService.getProjectById(id, query.language || 'tr'),
  create: (data) => projectService.createProject(data),
  update: (id, data) => projectService.updateProject(id, data),
  delete: (id) => projectService.deleteProject(id),
};

const crudController = createCRUDController(projectServiceAdapter, {
  entityName: 'Proje',
  entityNamePlural: 'Projeler',
  // transformData: Tüm response'larda mapping uygula
  transformData: mapProjectToFrontend,
  // beforeCreate hook: authorId'yi req.user'dan al
  beforeCreate: async (req, data) => ({
    ...data,
    authorId: req.user.userId, // From auth middleware
  }),
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
    const baseUrl = process.env.BASE_URL || 'http://localhost:5001';
    const imageUrl = `${baseUrl}/uploads/projects/${req.file.filename}`;

    res.status(200).json({
      message: 'Görsel başarıyla yüklendi',
      imageUrl: imageUrl
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
  getPublicProjectBySlug,

  // Upload
  uploadImage,
  upload, // Multer middleware'ini export et
};