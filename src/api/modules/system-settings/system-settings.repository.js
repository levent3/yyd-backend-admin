const prisma = require('../../../config/prismaClient');

const findAll = (filters = {}) => {
  const where = {};

  if (filters.category) where.category = filters.category;
  if (filters.isActive !== undefined) where.isActive = filters.isActive === 'true';
  if (filters.isPublic !== undefined) where.isPublic = filters.isPublic === 'true';

  return prisma.systemSettings.findMany({
    where,
    orderBy: [
      { category: 'asc' },
      { settingKey: 'asc' }
    ]
  });
};

const findByKey = (settingKey) => {
  return prisma.systemSettings.findUnique({
    where: { settingKey }
  });
};

const findByCategory = (category) => {
  return prisma.systemSettings.findMany({
    where: {
      category,
      isActive: true
    }
  });
};

const findPublicSettings = () => {
  return prisma.systemSettings.findMany({
    where: {
      isPublic: true,
      isActive: true
    },
    select: {
      settingKey: true,
      settingValue: true,
      category: true
    }
  });
};

const create = (data) => {
  return prisma.systemSettings.create({
    data: {
      settingKey: data.settingKey,
      settingValue: data.settingValue,
      description: data.description || null,
      category: data.category || null,
      isActive: data.isActive !== undefined ? data.isActive : true,
      isPublic: data.isPublic || false
    }
  });
};

const update = (settingKey, data) => {
  const updateData = {};

  if (data.settingValue !== undefined) updateData.settingValue = data.settingValue;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.category !== undefined) updateData.category = data.category;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;
  if (data.isPublic !== undefined) updateData.isPublic = data.isPublic;

  return prisma.systemSettings.update({
    where: { settingKey },
    data: updateData
  });
};

const deleteByKey = (settingKey) => {
  return prisma.systemSettings.delete({
    where: { settingKey }
  });
};

// Upsert
const upsert = async (settingKey, data) => {
  const existing = await findByKey(settingKey);

  if (existing) {
    return update(settingKey, data);
  } else {
    return create({ ...data, settingKey });
  }
};

module.exports = {
  findAll,
  findByKey,
  findByCategory,
  findPublicSettings,
  create,
  update,
  deleteByKey,
  upsert
};
