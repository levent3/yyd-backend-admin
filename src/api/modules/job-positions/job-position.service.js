const jobPositionRepo = require('./job-position.repository');
const { parsePagination, createPaginatedResponse } = require('../../../utils/pagination');
const prisma = require('../../../config/database');

// Modül kaydını oluştur
const ensureModuleExists = async () => {
  const existingModule = await prisma.module.findUnique({
    where: { slug: 'job-positions' }
  });

  if (!existingModule) {
    const module = await prisma.module.create({
      data: {
        name: 'Açık Pozisyonlar',
        slug: 'job-positions',
        description: 'Kariyer sayfasında gösterilen açık iş pozisyonlarının yönetimi',
        icon: 'briefcase',
        displayOrder: 4,
        isActive: true,
        category: 'Başvuru Yönetimi'
      }
    });

    // Permissions ekle
    await prisma.modulePermission.createMany({
      data: [
        { roleId: 1, moduleId: module.id, canView: true, canCreate: true, canEdit: true, canDelete: true },
        { roleId: 2, moduleId: module.id, canView: true, canCreate: true, canEdit: true, canDelete: true },
        { roleId: 3, moduleId: module.id, canView: true, canCreate: true, canEdit: true, canDelete: false }
      ]
    });
  }
};

ensureModuleExists().catch(console.error);

const getAllJobPositions = async (queryParams = {}) => {
  const { page, limit, department, location, employmentType, isActive, isFeatured } = queryParams;
  const { skip, limit: take } = parsePagination(page, limit);

  // Build where clause
  const where = {};
  if (department) where.department = department;
  if (location) where.location = location;
  if (employmentType) where.employmentType = employmentType;
  if (isActive !== undefined) where.isActive = isActive === 'true';
  if (isFeatured !== undefined) where.isFeatured = isFeatured === 'true';

  const [positions, total] = await Promise.all([
    jobPositionRepo.findMany({ skip, take, where }),
    jobPositionRepo.count(where),
  ]);

  return createPaginatedResponse(positions, total, parseInt(page) || 1, take);
};

const getJobPositionById = async (id) => {
  const position = await jobPositionRepo.findById(id);

  if (!position) {
    const error = new Error('Pozisyon bulunamadı');
    error.statusCode = 404;
    throw error;
  }

  return position;
};

const getJobPositionBySlug = async (slug) => {
  const position = await jobPositionRepo.findBySlug(slug);

  if (!position) {
    const error = new Error('Pozisyon bulunamadı');
    error.statusCode = 404;
    throw error;
  }

  return position;
};

const createJobPosition = async (data) => {
  // Map data
  const mappedData = {
    title: data.title,
    slug: data.slug,
    description: data.description,
    requirements: data.requirements || null,
    responsibilities: data.responsibilities || null,
    qualifications: data.qualifications || null,
    department: data.department || null,
    location: data.location || null,
    employmentType: data.employmentType || null,
    isActive: data.isActive !== undefined ? data.isActive : true,
    isFeatured: data.isFeatured !== undefined ? data.isFeatured : false,
    displayOrder: data.displayOrder !== undefined ? parseInt(data.displayOrder) : 0,
    deadline: data.deadline || null
  };

  return jobPositionRepo.create(mappedData);
};

const updateJobPosition = async (id, data) => {
  // Check if exists
  await getJobPositionById(id);

  const mappedData = {};

  if (data.title !== undefined) mappedData.title = data.title;
  if (data.slug !== undefined) mappedData.slug = data.slug;
  if (data.description !== undefined) mappedData.description = data.description;
  if (data.requirements !== undefined) mappedData.requirements = data.requirements;
  if (data.responsibilities !== undefined) mappedData.responsibilities = data.responsibilities;
  if (data.qualifications !== undefined) mappedData.qualifications = data.qualifications;
  if (data.department !== undefined) mappedData.department = data.department;
  if (data.location !== undefined) mappedData.location = data.location;
  if (data.employmentType !== undefined) mappedData.employmentType = data.employmentType;
  if (data.isActive !== undefined) mappedData.isActive = data.isActive;
  if (data.isFeatured !== undefined) mappedData.isFeatured = data.isFeatured;
  if (data.displayOrder !== undefined) mappedData.displayOrder = parseInt(data.displayOrder);
  if (data.deadline !== undefined) mappedData.deadline = data.deadline;

  return jobPositionRepo.update(id, mappedData);
};

const deleteJobPosition = async (id) => {
  // Check if exists
  await getJobPositionById(id);

  return jobPositionRepo.deleteById(id);
};

module.exports = {
  getAllJobPositions,
  getJobPositionById,
  getJobPositionBySlug,
  createJobPosition,
  updateJobPosition,
  deleteJobPosition
};
