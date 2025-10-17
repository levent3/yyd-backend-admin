const prisma = require('../../../config/prismaClient');

const getAllModules = () => {
  return prisma.adminModule.findMany({
    orderBy: { displayOrder: 'asc' }
  });
};

const getModuleById = (id) => {
  return prisma.adminModule.findUnique({
    where: { id }
  });
};

const createModule = (data) => {
  return prisma.adminModule.create({
    data: {
      name: data.name,
      moduleKey: data.moduleKey,
      displayOrder: data.displayOrder || 0,
      parentId: data.parentId || null
    }
  });
};

const updateModule = (id, data) => {
  return prisma.adminModule.update({
    where: { id },
    data: {
      name: data.name,
      moduleKey: data.moduleKey,
      displayOrder: data.displayOrder,
      parentId: data.parentId
    }
  });
};

const deleteModule = (id) => {
  return prisma.adminModule.delete({
    where: { id }
  });
};

module.exports = {
  getAllModules,
  getModuleById,
  createModule,
  updateModule,
  deleteModule
};
