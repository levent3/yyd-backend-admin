const prisma = require('../../../config/prismaClient');

const findMany = (filters = {}) => {
  const where = {};

  if (filters.status) {
    where.status = filters.status;
  }

  return prisma.contactMessage.findMany({
    where,
    orderBy: {
      submittedAt: 'desc'
    }
  });
};

const findById = (id) => {
  return prisma.contactMessage.findUnique({
    where: { id }
  });
};

const create = (data) => {
  return prisma.contactMessage.create({ data });
};

const update = (id, data) => {
  return prisma.contactMessage.update({
    where: { id },
    data
  });
};

const deleteById = (id) => {
  return prisma.contactMessage.delete({ where: { id } });
};

// Mark as read
const markAsRead = (id) => {
  return prisma.contactMessage.update({
    where: { id },
    data: { status: 'read' }
  });
};

// Get unread count
const getUnreadCount = () => {
  return prisma.contactMessage.count({
    where: { status: 'new' }
  });
};

module.exports = {
  findMany,
  findById,
  create,
  update,
  deleteById,
  markAsRead,
  getUnreadCount
};
