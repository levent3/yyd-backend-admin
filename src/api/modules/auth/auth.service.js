const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authRepository = require('./auth.repository');
const config = require('../../../config');

const register = async (userData) => {
  const { email, password, username, fullName } = userData;
  const existingUser = await authRepository.findUserByEmail(email);
  if (existingUser) {
    const error = new Error('Bu email adresi zaten kullanılıyor.');
    error.statusCode = 409; // Conflict
    throw error;
  }
  const passwordHash = await bcrypt.hash(password, 12);
  // Varsayılan rol olarak "editor" (roleId: 2) atayalım.
  // Bu rolün ID'sinin veritabanında olduğundan emin olmalıyız.
  return authRepository.createUser({ email, passwordHash, username, fullName, roleId: 2 });
};

const login = async (email, password) => {
  const user = await authRepository.findUserByEmail(email);
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    const error = new Error('Geçersiz email veya şifre.');
    error.statusCode = 401; // Unauthorized
    throw error;
  }
  const token = jwt.sign(
    { userId: user.id, roleId: user.roleId },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
  return { token, user: { id: user.id, email: user.email, fullName: user.fullName } };
};

const getMe = async (userId) => {
  const user = await authRepository.findUserByIdWithPermissions(userId);
  if (!user) {
    const error = new Error('Kullanıcı bulunamadı.');
    error.statusCode = 404;
    throw error;
  }

  // İzinleri düzenle (permissions JSONB formatından çıkar)
  const permissions = user.role.accessibleModules.map(am => ({
    moduleKey: am.module.moduleKey,
    moduleName: am.module.name,
    read: am.permissions?.read || false,
    create: am.permissions?.create || false,
    update: am.permissions?.update || false,
    delete: am.permissions?.delete || false
  }));

  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    username: user.username,
    role: {
      id: user.role.id,
      name: user.role.name
    },
    permissions
  };
};

module.exports = { register, login, getMe };