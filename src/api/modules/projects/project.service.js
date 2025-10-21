const projectRepo = require('./project.repository');
const { parsePagination, createPaginatedResponse } = require('../../../utils/pagination');
const {
  formatEntityWithTranslation,
  generateSlug
} = require('../../../utils/translationHelper');

// Helper to convert relative URLs to full URLs
const normalizeImageUrl = (imageUrl) => {
  if (!imageUrl) return imageUrl;

  // Eğer URL zaten tam URL ise (http:// veya https:// ile başlıyorsa) olduğu gibi dön
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // Relative URL ise tam URL'e çevir
  const baseUrl = process.env.BASE_URL || 'http://localhost:5001';
  return `${baseUrl}${imageUrl}`;
};

const normalizeProject = (project, language = 'tr', includeAllTranslations = false) => {
  if (!project) return project;

  // Translation formatını uygula
  const formatted = formatEntityWithTranslation(project, language, includeAllTranslations);

  // CoverImage URL'ini normalize et
  return {
    ...formatted,
    coverImage: normalizeImageUrl(formatted.coverImage)
  };
};

const getAllProjects = async (queryParams = {}) => {
  const { page, limit, status, category, isFeatured, isActive, maxLimit, language = 'tr' } = queryParams;
  // Public endpoint'ler maxLimit=20 ile çağırır, admin endpoint'ler maxLimit=50 (default)
  const { skip, limit: take } = parsePagination(page, limit, maxLimit);

  // Build where clause
  const where = {};
  if (status) where.status = status;
  if (category) where.category = category;
  if (isFeatured !== undefined) where.isFeatured = isFeatured === 'true';
  if (isActive !== undefined) where.isActive = isActive === 'true';

  const [projects, total] = await Promise.all([
    projectRepo.findMany({ skip, take, where, language }),
    projectRepo.count(where),
  ]);

  // Format her bir projeyi çevirisiyle birlikte
  const formattedProjects = projects.map(item =>
    normalizeProject(item, language, false)
  );

  return createPaginatedResponse(formattedProjects, total, parseInt(page) || 1, take);
};

const getProjectById = async (id, language = 'tr') => {
  const project = await projectRepo.findById(id, language);
  return normalizeProject(project, language, true);
};

const getProjectBySlug = async (slug, language = 'tr') => {
  const project = await projectRepo.findBySlug(slug, language);
  return normalizeProject(project, language, true);
};

const createProject = async (data) => {
  // translations array: [{ language: 'tr', title: '...', description: '...', content: '...' }]
  const { translations, ...rest } = data;

  if (!translations || translations.length === 0) {
    throw new Error('En az bir çeviri gereklidir');
  }

  // Her bir translation için slug generate et
  const translationsWithSlug = translations.map(trans => ({
    language: trans.language,
    title: trans.title,
    slug: trans.slug || generateSlug(trans.title),
    description: trans.description || null,
    content: trans.content || null
  }));

  // Dil-bağımsız alanları map et
  const mappedData = {
    coverImage: rest.coverImage || null,
    category: rest.category || null,
    location: rest.location || null,
    country: rest.country || null,
    status: rest.status || 'active',
    priority: rest.priority || 'medium',
    startDate: rest.startDate ? new Date(rest.startDate) : null,
    endDate: rest.endDate ? new Date(rest.endDate) : null,
    budget: rest.budget ? parseFloat(rest.budget) : null,
    targetAmount: rest.targetAmount ? parseFloat(rest.targetAmount) : null,
    collectedAmount: rest.collectedAmount ? parseFloat(rest.collectedAmount) : 0,
    beneficiaryCount: rest.beneficiaryCount ? parseInt(rest.beneficiaryCount) : null,
    isActive: rest.isActive !== undefined ? rest.isActive : true,
    isFeatured: rest.isFeatured || false,
    displayOrder: rest.displayOrder || 0,
    authorId: rest.authorId || null,
    translations: {
      create: translationsWithSlug
    }
  };

  return projectRepo.create(mappedData);
};

const updateProject = async (id, data) => {
  const { translations, ...rest } = data;
  const mappedData = {};

  // Dil-bağımsız alanları güncelle
  if (rest.coverImage !== undefined) {
    mappedData.coverImage = rest.coverImage;
  }
  if (rest.category !== undefined) {
    mappedData.category = rest.category;
  }
  if (rest.location !== undefined) {
    mappedData.location = rest.location;
  }
  if (rest.country !== undefined) {
    mappedData.country = rest.country;
  }
  if (rest.status !== undefined) {
    mappedData.status = rest.status;
  }
  if (rest.priority !== undefined) {
    mappedData.priority = rest.priority;
  }
  if (rest.startDate !== undefined) {
    mappedData.startDate = rest.startDate ? new Date(rest.startDate) : null;
  }
  if (rest.endDate !== undefined) {
    mappedData.endDate = rest.endDate ? new Date(rest.endDate) : null;
  }
  if (rest.budget !== undefined) {
    mappedData.budget = rest.budget ? parseFloat(rest.budget) : null;
  }
  if (rest.targetAmount !== undefined) {
    mappedData.targetAmount = rest.targetAmount ? parseFloat(rest.targetAmount) : null;
  }
  if (rest.collectedAmount !== undefined) {
    mappedData.collectedAmount = parseFloat(rest.collectedAmount);
  }
  if (rest.beneficiaryCount !== undefined) {
    mappedData.beneficiaryCount = rest.beneficiaryCount ? parseInt(rest.beneficiaryCount) : null;
  }
  if (rest.isActive !== undefined) {
    mappedData.isActive = rest.isActive;
  }
  if (rest.isFeatured !== undefined) {
    mappedData.isFeatured = rest.isFeatured;
  }
  if (rest.displayOrder !== undefined) {
    mappedData.displayOrder = parseInt(rest.displayOrder);
  }

  // Translations güncelleme (varsa)
  if (translations && translations.length > 0) {
    const translationUpdates = translations.map(trans => ({
      where: {
        projectId_language: {
          projectId: id,
          language: trans.language
        }
      },
      create: {
        language: trans.language,
        title: trans.title,
        slug: trans.slug || generateSlug(trans.title),
        description: trans.description || null,
        content: trans.content || null
      },
      update: {
        title: trans.title,
        slug: trans.slug || generateSlug(trans.title),
        description: trans.description || null,
        content: trans.content || null
      }
    }));

    mappedData.translations = {
      upsert: translationUpdates
    };
  }

  return projectRepo.update(id, mappedData);
};

const deleteProject = (id) => projectRepo.deleteById(id);

module.exports = { getAllProjects, getProjectById, getProjectBySlug, createProject, updateProject, deleteProject };