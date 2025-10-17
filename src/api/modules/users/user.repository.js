const prisma = require('../../../config/prismaClient');

const findMany = (options = {}) => {
  const { skip, take, where, orderBy } = options;
  return prisma.user.findMany({
    skip,
    take,
    where,
    select: {
      id: true,
      username: true,
      email: true,
      fullName: true,
      roleId: true,
      createdAt: true,
      role: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: orderBy || { createdAt: 'desc' }
  });
};

const count = (where = {}) => {
  return prisma.user.count({ where });
};

const getAllUsers = () => {
  return prisma.user.findMany({
    select: {
      id: true,
      username: true,
      email: true,
      fullName: true,
      roleId: true,
      createdAt: true,
      role: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
};

const getUserById = (id) => {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      email: true,
      fullName: true,
      roleId: true,
      createdAt: true,
      role: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });
};

const createUser = (data) => {
  return prisma.user.create({
    data,
    select: {
      id: true,
      username: true,
      email: true,
      fullName: true,
      roleId: true,
      role: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });
};

const updateUser = (id, data) => {
  return prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      username: true,
      email: true,
      fullName: true,
      roleId: true,
      role: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });
};

const deleteUser = (id) => {
  return prisma.user.delete({
    where: { id }
  });
};

module.exports = {
  findMany,
  count,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};
