const prisma = require('../../../config/prismaClient');

const findMany = (options = {}) => {
  const { skip, take, where } = options;

  return prisma.contactMessage.findMany({
    skip,
    take,
    where,
    orderBy: {
      submittedAt: 'desc'
    }
  });
};

const count = (where = {}) => {
  return prisma.contactMessage.count({ where });
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
  count,
  findById,
  create,
  update,
  deleteById,
  markAsRead,
  getUnreadCount
};
