const prisma = require('../../../config/prismaClient');

const findMany = (options = {}) => {
  const { skip, take, where, orderBy } = options;
  return prisma.mediaCoverage.findMany({
    skip,
    take,
    where,
    orderBy: orderBy || [
      { publishedAt: 'desc' },
      { displayOrder: 'asc' }
    ]
  });
};

const count = (where = {}) => prisma.mediaCoverage.count({ where });

const findById = (id) => prisma.mediaCoverage.findUnique({ where: { id: parseInt(id) } });

const create = (data) => prisma.mediaCoverage.create({ data });

const update = (id, data) => prisma.mediaCoverage.update({ where: { id: parseInt(id) }, data });

const deleteById = (id) => prisma.mediaCoverage.delete({ where: { id: parseInt(id) } });

const findAllActive = () => prisma.mediaCoverage.findMany({
  where: { isActive: true },
  orderBy: [{ publishedAt: 'desc' }, { displayOrder: 'asc' }]
});

const findFeatured = () => prisma.mediaCoverage.findMany({
  where: { isActive: true, isFeatured: true },
  orderBy: { displayOrder: 'asc' },
  take: 10
});

module.exports = {
  findMany,
  count,
  findById,
  create,
  update,
  deleteById,
  findAllActive,
  findFeatured
};
