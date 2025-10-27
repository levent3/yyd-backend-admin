const prisma = require('../../../config/prismaClient');

const findMany = (options = {}) => {
  const { skip, take, where, orderBy } = options;

  return prisma.brandAsset.findMany({
    skip,
    take,
    where,
    orderBy: orderBy || [
      { displayOrder: 'asc' },
      { createdAt: 'desc' }
    ]
  });
};

const count = (where = {}) => prisma.brandAsset.count({ where });

const findById = (id) => {
  return prisma.brandAsset.findUnique({
    where: { id: parseInt(id) }
  });
};

const create = (data) => {
  return prisma.brandAsset.create({
    data
  });
};

const update = (id, data) => {
  return prisma.brandAsset.update({
    where: { id: parseInt(id) },
    data
  });
};

const deleteById = (id) => {
  return prisma.brandAsset.delete({
    where: { id: parseInt(id) }
  });
};

// Get active assets by file type (for public)
const findByFileType = (fileType) => {
  return prisma.brandAsset.findMany({
    where: {
      fileType,
      isActive: true
    },
    orderBy: { displayOrder: 'asc' }
  });
};

module.exports = {
  findMany,
  count,
  findById,
  create,
  update,
  deleteById,
  findByFileType
};
