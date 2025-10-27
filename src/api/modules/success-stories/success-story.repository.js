const prisma = require('../../../config/prismaClient');

const includeTranslations = {
  translations: {
    select: {
      id: true,
      language: true,
      title: true,
      slug: true,
      summary: true,
      content: true,
      metaTitle: true,
      metaDescription: true
    }
  }
};

const findMany = (options = {}) => {
  const { skip, take, where, orderBy } = options;

  return prisma.successStory.findMany({
    skip,
    take,
    where,
    include: includeTranslations,
    orderBy: orderBy || [
      { displayOrder: 'asc' },
      { publishedAt: 'desc' },
      { createdAt: 'desc' }
    ]
  });
};

const count = (where = {}) => prisma.successStory.count({ where });

const findById = (id) => {
  return prisma.successStory.findUnique({
    where: { id: parseInt(id) },
    include: includeTranslations
  });
};

const findBySlug = (slug, language) => {
  return prisma.successStory.findFirst({
    where: {
      translations: {
        some: {
          slug,
          language
        }
      },
      isActive: true
    },
    include: includeTranslations
  });
};

const create = (data) => {
  return prisma.successStory.create({
    data,
    include: includeTranslations
  });
};

const update = (id, data) => {
  return prisma.successStory.update({
    where: { id: parseInt(id) },
    data,
    include: includeTranslations
  });
};

const deleteById = (id) => {
  return prisma.successStory.delete({
    where: { id: parseInt(id) }
  });
};

// Get active stories by location (for public)
const findActiveByLocation = (location) => {
  return prisma.successStory.findMany({
    where: {
      location,
      isActive: true
    },
    include: includeTranslations,
    orderBy: [
      { displayOrder: 'asc' },
      { publishedAt: 'desc' }
    ]
  });
};

// Get all active stories (for public)
const findAllActive = () => {
  return prisma.successStory.findMany({
    where: {
      isActive: true
    },
    include: includeTranslations,
    orderBy: [
      { displayOrder: 'asc' },
      { publishedAt: 'desc' },
      { createdAt: 'desc' }
    ]
  });
};

// Get featured stories
const findFeatured = () => {
  return prisma.successStory.findMany({
    where: {
      isActive: true,
      isFeatured: true
    },
    include: includeTranslations,
    orderBy: { displayOrder: 'asc' },
    take: 10
  });
};

module.exports = {
  findMany,
  count,
  findById,
  findBySlug,
  create,
  update,
  deleteById,
  findActiveByLocation,
  findAllActive,
  findFeatured
};
