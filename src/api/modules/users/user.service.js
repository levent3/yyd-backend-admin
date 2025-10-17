const userRepository = require('./user.repository');
const bcrypt = require('bcryptjs');
const { parsePagination, createPaginatedResponse } = require('../../../utils/pagination');

const getAllUsers = async (queryParams = {}) => {
  const { page, limit, roleId, email, ...rest } = queryParams;
  const { skip, limit: take } = parsePagination(page, limit);

  const where = {};

  if (roleId) where.roleId = parseInt(roleId);
  if (email) where.email = { contains: email, mode: 'insensitive' };

  const [data, total] = await Promise.all([
    userRepository.findMany({ skip, take, where }),
    userRepository.count(where),
  ]);

  return createPaginatedResponse(data, total, parseInt(page) || 1, take);
};

const getUserById = (id) => {
  return userRepository.getUserById(id);
};

const createUser = async (data) => {
  // Şifreyi hash'le
  const hashedPassword = await bcrypt.hash(data.password, 10);

  const userData = {
    username: data.username,
    email: data.email,
    passwordHash: hashedPassword,
    fullName: data.fullName || null,
    roleId: data.roleId,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  return userRepository.createUser(userData);
};

const updateUser = async (id, data) => {
  const updateData = {
    updatedAt: new Date()
  };

  if (data.username) updateData.username = data.username;
  if (data.email) updateData.email = data.email;
  if (data.fullName !== undefined) updateData.fullName = data.fullName;
  if (data.roleId) updateData.roleId = data.roleId;

  // Eğer şifre değiştiriliyorsa hash'le
  if (data.password) {
    updateData.passwordHash = await bcrypt.hash(data.password, 10);
  }

  return userRepository.updateUser(id, updateData);
};

const deleteUser = (id) => {
  return userRepository.deleteUser(id);
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};
