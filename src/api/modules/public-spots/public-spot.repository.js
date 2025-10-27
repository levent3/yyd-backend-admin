const prisma = require('../../../config/prismaClient');

const includeTranslations = {
  translations: {
    select: {
      id: true,
      language: true,
      title: true,
      description: true
    }
  }
};

const findMany = (options = {}) => {
  const { skip, take, where, orderBy } = options;

  return prisma.publicSpot.findMany({
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

const count = (where = {}) => prisma.publicSpot.count({ where });

const findById = (id) => {
  return prisma.publicSpot.findUnique({
    where: { id: parseInt(id) },
    include: includeTranslations
  });
};

const create = (data) => {
  return prisma.publicSpot.create({
    data,
    include: includeTranslations
  });
};

const update = (id, data) => {
  return prisma.publicSpot.update({
    where: { id: parseInt(id) },
    data,
    include: includeTranslations
  });
};

const deleteById = (id) => {
  return prisma.publicSpot.delete({
    where: { id: parseInt(id) }
  });
};

// Get active public spots (for public)
const findActiveByCategory = (category) => {
  return prisma.publicSpot.findMany({
    where: {
      category,
      isActive: true
    },
    include: includeTranslations,
    orderBy: [
      { displayOrder: 'asc' },
      { publishedAt: 'desc' }
    ]
  });
};

// Get all active public spots (for public)
const findAllActive = () => {
  return prisma.publicSpot.findMany({
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

// Get featured public spots
const findFeatured = () => {
  return prisma.publicSpot.findMany({
    where: {
      isActive: true,
      isFeatured: true
    },
    include: includeTranslations,
    orderBy: { displayOrder: 'asc' },
    take: 10
  });
};

// Increment view count
const incrementViewCount = async (id) => {
  return prisma.publicSpot.update({
    where: { id: parseInt(id) },
    data: {
      viewCount: {
        increment: 1
      }
    }
  });
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
  findFeatured,
  incrementViewCount
};
