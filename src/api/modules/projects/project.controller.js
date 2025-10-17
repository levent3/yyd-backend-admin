const projectService = require('./project.service');
const upload = require('../../../config/multer');

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

const getAllProjects = async (req, res, next) => {
  try {
    const result = await projectService.getAllProjects(req.query);
    const mappedProjects = result.data.map(mapProjectToFrontend);
    res.status(200).json({
      data: mappedProjects,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const createProject = async (req, res, next) => {
  try {
    const authorId = req.user.userId;
    const projectData = { ...req.body, authorId };
    const newProject = await projectService.createProject(projectData);
    res.status(201).json(mapProjectToFrontend(newProject));
  } catch (error) {
    next(error);
  }
};

const getProjectById = async (req, res, next) => {
  try {
    const project = await projectService.getProjectById(parseInt(req.params.id));
    if (!project) {
      return res.status(404).json({ message: 'Proje bulunamadı' });
    }
    res.status(200).json(mapProjectToFrontend(project));
  } catch (error) {
    next(error);
  }
};

const updateProject = async (req, res, next) => {
  try {
    const updatedProject = await projectService.updateProject(parseInt(req.params.id), req.body);
    res.status(200).json(mapProjectToFrontend(updatedProject));
  } catch (error) {
    next(error);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    await projectService.deleteProject(parseInt(req.params.id));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// ========== PUBLIC ENDPOINTS (Auth gerektirmez) ==========

// Public: Tüm aktif projeleri listele
const getPublicProjects = async (req, res, next) => {
  try {
    // Sadece aktif projeleri göster
    const filters = {
      ...req.query,
      isActive: 'true',
      status: req.query.status || 'active',
      maxLimit: 20 // Public endpoint için max 20 kayıt
    };

    const result = await projectService.getAllProjects(filters);
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
    const project = await projectService.getProjectBySlug(req.params.slug);

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

module.exports = {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getPublicProjects,
  getPublicProjectBySlug,
  uploadImage,
  upload // Multer middleware'ini export et
};