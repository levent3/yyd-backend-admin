const projectRepo = require('./project.repository');
const { parsePagination, createPaginatedResponse } = require('../../../utils/pagination');

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

const normalizeProject = (project) => {
  if (!project) return project;
  return {
    ...project,
    coverImage: normalizeImageUrl(project.coverImage)
  };
};

// Helper function to generate slug from title
const generateSlug = (title) => {
  if (!title) return '';
  return title
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const getAllProjects = async (queryParams = {}) => {
  const { page, limit, status, category, isFeatured, isActive, maxLimit } = queryParams;
  // Public endpoint'ler maxLimit=20 ile çağırır, admin endpoint'ler maxLimit=50 (default)
  const { skip, limit: take } = parsePagination(page, limit, maxLimit);

  // Build where clause
  const where = {};
  if (status) where.status = status;
  if (category) where.category = category;
  if (isFeatured !== undefined) where.isFeatured = isFeatured === 'true';
  if (isActive !== undefined) where.isActive = isActive === 'true';

  const [projects, total] = await Promise.all([
    projectRepo.findMany({ skip, take, where }),
    projectRepo.count(where),
  ]);

  // Normalize image URLs
  const normalizedProjects = projects.map(normalizeProject);

  return createPaginatedResponse(normalizedProjects, total, parseInt(page) || 1, take);
};

const getProjectById = async (id) => {
  const project = await projectRepo.findById(id);
  return normalizeProject(project);
};

const getProjectBySlug = async (slug) => {
  const project = await projectRepo.findBySlug(slug);
  return normalizeProject(project);
};

const createProject = async (data) => {
  // Map frontend fields to schema fields
  const mappedData = {
    title: data.title || data.name,
    slug: generateSlug(data.title || data.name),
    description: data.description || '',
    content: data.content || '',
    coverImage: data.coverImage || null,
    category: data.category || null,
    location: data.location || null,
    country: data.country || null,
    status: data.status || 'active',
    priority: data.priority || 'medium',
    startDate: data.startDate ? new Date(data.startDate) : null,
    endDate: data.endDate ? new Date(data.endDate) : null,
    budget: data.budget ? parseFloat(data.budget) : null,
    targetAmount: data.targetAmount ? parseFloat(data.targetAmount) : null,
    collectedAmount: data.collectedAmount ? parseFloat(data.collectedAmount) : 0,
    beneficiaryCount: data.beneficiaryCount ? parseInt(data.beneficiaryCount) : null,
    isActive: data.isActive !== undefined ? data.isActive : true,
    isFeatured: data.isFeatured || false,
    displayOrder: data.displayOrder || 0,
    authorId: data.authorId
  };
  const project = await projectRepo.create(mappedData);
  return normalizeProject(project);
};

const updateProject = async (id, data) => {
  // Map frontend fields to schema fields
  const mappedData = {};

  if (data.title !== undefined || data.name !== undefined) {
    mappedData.title = data.title || data.name;
    mappedData.slug = generateSlug(data.title || data.name);
  }
  if (data.description !== undefined) {
    mappedData.description = data.description;
  }
  if (data.content !== undefined) {
    mappedData.content = data.content;
  }
  if (data.coverImage !== undefined) {
    mappedData.coverImage = data.coverImage;
  }
  if (data.category !== undefined) {
    mappedData.category = data.category;
  }
  if (data.location !== undefined) {
    mappedData.location = data.location;
  }
  if (data.country !== undefined) {
    mappedData.country = data.country;
  }
  if (data.status !== undefined) {
    mappedData.status = data.status;
  }
  if (data.priority !== undefined) {
    mappedData.priority = data.priority;
  }
  if (data.startDate !== undefined) {
    mappedData.startDate = data.startDate ? new Date(data.startDate) : null;
  }
  if (data.endDate !== undefined) {
    mappedData.endDate = data.endDate ? new Date(data.endDate) : null;
  }
  if (data.budget !== undefined) {
    mappedData.budget = data.budget ? parseFloat(data.budget) : null;
  }
  if (data.targetAmount !== undefined) {
    mappedData.targetAmount = data.targetAmount ? parseFloat(data.targetAmount) : null;
  }
  if (data.collectedAmount !== undefined) {
    mappedData.collectedAmount = parseFloat(data.collectedAmount);
  }
  if (data.beneficiaryCount !== undefined) {
    mappedData.beneficiaryCount = data.beneficiaryCount ? parseInt(data.beneficiaryCount) : null;
  }
  if (data.isActive !== undefined) {
    mappedData.isActive = data.isActive;
  }
  if (data.isFeatured !== undefined) {
    mappedData.isFeatured = data.isFeatured;
  }
  if (data.displayOrder !== undefined) {
    mappedData.displayOrder = parseInt(data.displayOrder);
  }

  const project = await projectRepo.update(id, mappedData);
  return normalizeProject(project);
};

const deleteProject = (id) => projectRepo.deleteById(id);

module.exports = { getAllProjects, getProjectById, getProjectBySlug, createProject, updateProject, deleteProject };