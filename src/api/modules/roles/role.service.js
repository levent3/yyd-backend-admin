// src/api/modules/roles/role.service.js
const roleRepository = require('./role.repository');

const getAllRoles = async () => {
  return roleRepository.getAllRoles();
};

const getRoleById = async (id) => {
  const role = await roleRepository.getRoleById(id);
  if (!role) {
    const error = new Error('Rol bulunamadı.');
    error.statusCode = 404;
    throw error;
  }
  return role;
};

const createRole = async (data) => {
  // Aynı isimde rol var mı kontrol et
  const roles = await roleRepository.getAllRoles();
  const exists = roles.some(r => r.name.toLowerCase() === data.name.toLowerCase());

  if (exists) {
    const error = new Error('Bu isimde bir rol zaten mevcut.');
    error.statusCode = 409;
    throw error;
  }

  return roleRepository.createRole(data);
};

const updateRole = async (id, data) => {
  await getRoleById(id); // Var mı kontrol et

  // Aynı isimde başka bir rol var mı kontrol et
  const roles = await roleRepository.getAllRoles();
  const exists = roles.some(r =>
    r.id !== parseInt(id) && r.name.toLowerCase() === data.name.toLowerCase()
  );

  if (exists) {
    const error = new Error('Bu isimde başka bir rol zaten mevcut.');
    error.statusCode = 409;
    throw error;
  }

  return roleRepository.updateRole(id, data);
};

const deleteRole = async (id) => {
  const role = await getRoleById(id);

  // superadmin rolü silinemez
  if (role.name.toLowerCase() === 'superadmin') {
    const error = new Error('Superadmin rolü silinemez.');
    error.statusCode = 403;
    throw error;
  }

  // Bu role atanmış kullanıcı var mı kontrol et
  if (role._count && role._count.users > 0) {
    const error = new Error(`Bu rol ${role._count.users} kullanıcıya atanmış. Önce kullanıcıların rollerini değiştirin.`);
    error.statusCode = 409;
    throw error;
  }

  return roleRepository.deleteRole(id);
};

const assignModulePermissions = async (roleId, moduleId, permissions) => {
  // Rol var mı kontrol et
  await getRoleById(roleId);

  // permissions objesi doğru formatta mı kontrol et
  const validActions = ['read', 'create', 'update', 'delete'];
  const providedActions = Object.keys(permissions);

  const isValid = providedActions.every(action =>
    validActions.includes(action) && typeof permissions[action] === 'boolean'
  );

  if (!isValid) {
    const error = new Error('İzin formatı hatalı. Geçerli aksiyonlar: read, create, update, delete');
    error.statusCode = 400;
    throw error;
  }

  return roleRepository.assignModulePermissions(roleId, moduleId, permissions);
};

const getRolePermissions = async (roleId) => {
  await getRoleById(roleId);
  return roleRepository.getRolePermissions(roleId);
};

module.exports = {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  assignModulePermissions,
  getRolePermissions
};
