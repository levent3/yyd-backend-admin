const prisma = require('../../../config/prismaClient');

const findMany = (options = {}) => {
  const { skip, take, where, orderBy } = options;
  return prisma.binCode.findMany({
    skip,
    take,
    where,
    orderBy: orderBy || { binCode: 'asc' },
    include: {
      bank: {
        select: {
          id: true,
          name: true,
          isOurBank: true,
          isVirtualPosActive: true,
          isActive: true
        }
      }
    }
  });
};

const count = (where = {}) => prisma.binCode.count({ where });

const findById = (id) => prisma.binCode.findUnique({
  where: { id },
  include: {
    bank: {
      select: {
        id: true,
        name: true,
        isOurBank: true,
        isVirtualPosActive: true,
        isActive: true
      }
    }
  }
});

const findByBinCode = (binCode) => prisma.binCode.findUnique({
  where: { binCode },
  include: {
    bank: {
      select: {
        id: true,
        name: true,
        isOurBank: true,
        isVirtualPosActive: true,
        isActive: true
      }
    }
  }
});

const findByBankId = (bankId) => prisma.binCode.findMany({
  where: { bankId },
  orderBy: { binCode: 'asc' }
});

const create = (data) => prisma.binCode.create({
  data,
  include: {
    bank: {
      select: {
        id: true,
        name: true,
        isOurBank: true,
        isVirtualPosActive: true,
        isActive: true
      }
    }
  }
});

const update = (id, data) => prisma.binCode.update({
  where: { id },
  data,
  include: {
    bank: {
      select: {
        id: true,
        name: true,
        isOurBank: true,
        isVirtualPosActive: true,
        isActive: true
      }
    }
  }
});

const deleteById = (id) => prisma.binCode.delete({ where: { id } });

module.exports = {
  findMany,
  count,
  findById,
  findByBinCode,
  findByBankId,
  create,
  update,
  deleteById
};
