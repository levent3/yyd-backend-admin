const prisma = require('../../../config/prismaClient');

const findUserByEmail = (email) => {
  return prisma.user.findUnique({ where: { email } });
};

const createUser = (data) => {
  // data = { email, passwordHash, username, fullName, roleId }
  return prisma.user.create({ data });
};

const findUserByIdWithPermissions = (userId) => {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      role: {
        include: {
          accessibleModules: {
            include: {
              module: true
            }
          }
        }
      }
    }
  });
};

module.exports = { findUserByEmail, createUser, findUserByIdWithPermissions };