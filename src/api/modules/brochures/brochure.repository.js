const prisma = require('../../../config/prismaClient');

const includeTranslations = {
  translations: {
    select: {
      id: true,
      language: true,
      title: true,
      description: true,
      builderData: true,
      builderHtml: true,
      builderCss: true,
      usePageBuilder: true
    }
  }
};

const findMany = (options = {}) => {
  const { skip, take, where, orderBy } = options;

  return prisma.brochure.findMany({
    skip,
    take,
    where,
    include: includeTranslations,
    orderBy: orderBy || [
      { displayOrder: 'asc' },
      { createdAt: 'desc' }
    ]
  });
};

const count = (where = {}) => prisma.brochure.count({ where });

const findById = (id) => {
  return prisma.brochure.findUnique({
    where: { id: parseInt(id) },
    include: includeTranslations
  });
};

const create = (data) => {
  return prisma.brochure.create({
    data,
    include: includeTranslations
  });
};

const update = (id, data) => {
  return prisma.brochure.update({
    where: { id: parseInt(id) },
    data,
    include: includeTranslations
  });
};

const deleteById = (id) => {
  return prisma.brochure.delete({
    where: { id: parseInt(id) }
  });
};

// Get active brochures by category (for public)
const findActiveByCategory = (category) => {
  return prisma.brochure.findMany({
    where: {
      category,
      isActive: true
    },
    include: includeTranslations,
    orderBy: { displayOrder: 'asc' }
  });
};

// Get all active brochures (for public)
const findAllActive = () => {
  return prisma.brochure.findMany({
    where: {
      isActive: true
    },
    include: includeTranslations,
    orderBy: [
      { displayOrder: 'asc' },
      { createdAt: 'desc' }
    ]
  });
};

// ========== PAGE BUILDER OPERATIONS ==========

const updateBuilderData = async (brochureId, language, builderData) => {
  const { builderData: data, builderHtml, builderCss } = builderData;

  // Check if translation exists
  const existingTranslation = await prisma.brochureTranslation.findFirst({
    where: {
      brochureId: parseInt(brochureId),
      language: language,
    },
  });

  if (existingTranslation) {
    // Update existing translation
    return await prisma.brochureTranslation.update({
      where: {
        id: existingTranslation.id,
      },
      data: {
        builderData: data,
        builderHtml: builderHtml,
        builderCss: builderCss,
        usePageBuilder: true, // Automatically enable page builder when saving
        updatedAt: new Date(),
      },
    });
  } else {
    // If translation doesn't exist, throw error (translations should be created first)
    throw new Error(`Translation for language '${language}' does not exist for brochure ${brochureId}`);
  }
};

module.exports = {
  findMany,
  count,
  findById,
  create,
  update,
  deleteById,
  findActiveByCategory,
  findAllActive,
  updateBuilderData
};
