const prisma = require('../../../config/prismaClient');

const findMany = (options = {}) => {
  const { skip, take, where, orderBy } = options;
  return prisma.careerApplication.findMany({
    skip,
    take,
    where,
    include: {
      jobPosition: {
        select: {
          id: true,
          title: true,
          slug: true,
          department: true,
          location: true
        }
      }
    },
    orderBy: orderBy || { submittedAt: 'desc' }
  });
};

const count = (where = {}) => {
  return prisma.careerApplication.count({ where });
};

const findById = (id) => {
  return prisma.careerApplication.findUnique({
    where: { id },
    include: {
      jobPosition: true
    }
  });
};

const create = (data) => {
  return prisma.careerApplication.create({ data });
};

const update = (id, data) => {
  return prisma.careerApplication.update({
    where: { id },
    data
  });
};

const deleteById = (id) => {
  return prisma.careerApplication.delete({ where: { id } });
};

// Get pending applications count
const getPendingCount = () => {
  return prisma.careerApplication.count({
    where: { status: 'new' }
  });
};

// Get applications by status
const findByStatus = (status) => {
  return prisma.careerApplication.findMany({
    where: { status },
    orderBy: { submittedAt: 'desc' }
  });
};

// Get applications by position
const findByPosition = (position) => {
  return prisma.careerApplication.findMany({
    where: {
      position: {
        contains: position,
        mode: 'insensitive'
      }
    },
    orderBy: { submittedAt: 'desc' }
  });
};

module.exports = {
  findMany,
  count,
  findById,
  create,
  update,
  deleteById,
  getPendingCount,
  findByStatus,
  findByPosition
};
