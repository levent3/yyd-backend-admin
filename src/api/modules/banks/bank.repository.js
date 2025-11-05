const prisma = require('../../../config/prismaClient');

const findMany = (options = {}) => {
  const { skip, take, where, orderBy } = options;
  return prisma.bank.findMany({
    skip,
    take,
    where,
    orderBy: orderBy || { displayOrder: 'asc' },
    include: {
      binCodes: {
        where: { isActive: true },
        select: {
          id: true,
          binCode: true,
          isActive: true
        }
      }
    }
  });
};

const count = (where = {}) => prisma.bank.count({ where });

const findById = (id) => prisma.bank.findUnique({
  where: { id },
  include: {
    binCodes: {
      orderBy: { binCode: 'asc' },
      select: {
        id: true,
        binCode: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    }
  }
});

const findByName = (name) => prisma.bank.findFirst({
  where: { name }
});

const create = (data) => prisma.bank.create({ data });

const update = (id, data) => prisma.bank.update({
  where: { id },
  data
});

const deleteById = (id) => prisma.bank.delete({ where: { id } });

module.exports = {
  findMany,
  count,
  findById,
  findByName,
  create,
  update,
  deleteById
};
