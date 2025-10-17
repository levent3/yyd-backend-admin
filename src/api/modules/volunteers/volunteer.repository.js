const prisma = require('../../../config/prismaClient');

const findMany = (options = {}) => {
  const { skip, take, where, orderBy } = options;
  return prisma.volunteer.findMany({
    skip,
    take,
    where,
    orderBy: orderBy || { submittedAt: 'desc' }
  });
};

const count = (where = {}) => {
  return prisma.volunteer.count({ where });
};

const findById = (id) => {
  return prisma.volunteer.findUnique({
    where: { id }
  });
};

const create = (data) => {
  return prisma.volunteer.create({ data });
};

const update = (id, data) => {
  return prisma.volunteer.update({
    where: { id },
    data
  });
};

const deleteById = (id) => {
  return prisma.volunteer.delete({ where: { id } });
};

// Get pending applications count
const getPendingCount = () => {
  return prisma.volunteer.count({
    where: { status: 'new' }
  });
};

module.exports = {
  findMany,
  count,
  findById,
  create,
  update,
  deleteById,
  getPendingCount
};
