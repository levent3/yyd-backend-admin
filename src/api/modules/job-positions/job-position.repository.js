const prisma = require('../../../config/prismaClient');

const findMany = (options = {}) => {
  const { skip, take, where, orderBy } = options;

  return prisma.jobPosition.findMany({
    skip,
    take,
    where,
    orderBy: orderBy || [
      { displayOrder: 'asc' },
      { createdAt: 'desc' }
    ],
    include: {
      _count: {
        select: { applications: true }
      }
    }
  });
};

const count = (where = {}) => prisma.jobPosition.count({ where });

const findById = (id) => {
  return prisma.jobPosition.findUnique({
    where: { id: parseInt(id) },
    include: {
      _count: {
        select: { applications: true }
      }
    }
  });
};

const findBySlug = (slug) => {
  return prisma.jobPosition.findUnique({
    where: { slug },
    include: {
      _count: {
        select: { applications: true }
      }
    }
  });
};

const create = (data) => {
  return prisma.jobPosition.create({
    data
  });
};

const update = (id, data) => {
  return prisma.jobPosition.update({
    where: { id: parseInt(id) },
    data
  });
};

const deleteById = (id) => {
  return prisma.jobPosition.delete({
    where: { id: parseInt(id) }
  });
};

module.exports = {
  findMany,
  count,
  findById,
  findBySlug,
  create,
  update,
  deleteById
};
