const prisma = require('../../../config/prismaClient');
const { includeTranslations } = require('../../../utils/translationHelper');

const findMany = (options = {}) => {
  const { skip, take, where, orderBy, language } = options;

  return prisma.activityArea.findMany({
    skip,
    take,
    where,
    include: {
      ...includeTranslations(language)
    },
    orderBy: orderBy || { displayOrder: 'asc' }
  });
};

const count = (where = {}) => prisma.activityArea.count({ where });

const findById = (id, language = null) => {
  return prisma.activityArea.findUnique({
    where: { id: parseInt(id) },
    include: {
      ...includeTranslations(language)
    }
  });
};

const findBySlug = (slug, language = 'tr') => {
  return prisma.activityArea.findFirst({
    where: {
      translations: {
        some: {
          slug: slug,
          ...(language && { language })
        }
      }
    },
    include: {
      ...includeTranslations()
    }
  });
};

const create = (data) => {
  return prisma.activityArea.create({
    data
  });
};

const update = (id, data) => {
  return prisma.activityArea.update({
    where: { id },
    data
  });
};

const deleteById = (id) => {
  return prisma.activityArea.delete({ where: { id } });
};

// Get active activity areas for public access
const findActive = (options = {}) => {
  const { skip, take, language } = options;

  return prisma.activityArea.findMany({
    skip,
    take,
    where: {
      isActive: true
    },
    include: {
      ...includeTranslations(language)
    },
    orderBy: {
      displayOrder: 'asc'
    }
  });
};

// ========== PAGE BUILDER METHODS ==========

const updateBuilderData = async (activityAreaId, language, builderData) => {
  const { builderData: data, builderHtml, builderCss } = builderData;

  const existingTranslation = await prisma.activityAreaTranslation.findFirst({
    where: {
      activityAreaId: parseInt(activityAreaId),
      language: language,
    },
  });

  if (existingTranslation) {
    return await prisma.activityAreaTranslation.update({
      where: { id: existingTranslation.id },
      data: {
        builderData: data,
        builderHtml: builderHtml,
        builderCss: builderCss,
        usePageBuilder: true,
        updatedAt: new Date(),
      },
    });
  } else {
    throw new Error(`Translation for language '${language}' does not exist for activity area ${activityAreaId}`);
  }
};

module.exports = {
  findMany,
  count,
  findById,
  findBySlug,
  create,
  update,
  deleteById,
  findActive,
  updateBuilderData
};
