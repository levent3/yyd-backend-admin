const prisma = require('../../../config/prismaClient');

const findAll = (filters = {}) => {
  const where = {};

  if (filters.entityType) where.entityType = filters.entityType;
  if (filters.fieldName) where.fieldName = filters.fieldName;
  if (filters.isActive !== undefined) where.isActive = filters.isActive === 'true';

  return prisma.validationRule.findMany({
    where,
    orderBy: [
      { entityType: 'asc' },
      { fieldName: 'asc' },
      { priority: 'asc' }
    ]
  });
};

const findById = (id) => {
  return prisma.validationRule.findUnique({
    where: { id: parseInt(id) }
  });
};

const findByEntity = (entityType) => {
  return prisma.validationRule.findMany({
    where: {
      entityType,
      isActive: true
    },
    orderBy: { priority: 'asc' }
  });
};

const create = (data) => {
  return prisma.validationRule.create({
    data: {
      entityType: data.entityType,
      fieldName: data.fieldName,
      ruleType: data.ruleType,
      ruleValue: data.ruleValue || null,
      errorMessage: data.errorMessage, // JSON
      priority: data.priority || 0,
      isActive: data.isActive !== undefined ? data.isActive : true
    }
  });
};

const update = (id, data) => {
  const updateData = {};

  if (data.ruleValue !== undefined) updateData.ruleValue = data.ruleValue;
  if (data.errorMessage !== undefined) updateData.errorMessage = data.errorMessage;
  if (data.priority !== undefined) updateData.priority = data.priority;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;

  return prisma.validationRule.update({
    where: { id: parseInt(id) },
    data: updateData
  });
};

const deleteById = (id) => {
  return prisma.validationRule.delete({
    where: { id: parseInt(id) }
  });
};

// Bulk operations
const deleteByEntity = (entityType) => {
  return prisma.validationRule.deleteMany({
    where: { entityType }
  });
};

const toggleActive = (id, isActive) => {
  return prisma.validationRule.update({
    where: { id: parseInt(id) },
    data: { isActive }
  });
};

module.exports = {
  findAll,
  findById,
  findByEntity,
  create,
  update,
  deleteById,
  deleteByEntity,
  toggleActive
};
