// src/api/modules/roles/role.repository.js
const prisma = require('../../../config/prismaClient');

// Tüm rolleri getir
const getAllRoles = async () => {
  return prisma.role.findMany({
    include: {
      _count: {
        select: { users: true, accessibleModules: true }
      }
    },
    orderBy: { id: 'asc' }
  });
};

// ID'ye göre rol getir
const getRoleById = async (id) => {
  return prisma.role.findUnique({
    where: { id: parseInt(id) },
    include: {
      accessibleModules: {
        include: {
          module: true
        }
      },
      users: {
        select: {
          id: true,
          username: true,
          email: true,
          fullName: true
        }
      }
    }
  });
};

// Yeni rol oluştur
const createRole = async (data) => {
  return prisma.role.create({
    data: {
      name: data.name
    }
  });
};

// Rol güncelle
const updateRole = async (id, data) => {
  return prisma.role.update({
    where: { id: parseInt(id) },
    data: {
      name: data.name
    }
  });
};

// Rol sil
const deleteRole = async (id) => {
  return prisma.role.delete({
    where: { id: parseInt(id) }
  });
};

// Role modül izinleri ata
const assignModulePermissions = async (roleId, moduleId, permissions) => {
  return prisma.roleModulePermission.upsert({
    where: {
      roleId_moduleId: {
        roleId: parseInt(roleId),
        moduleId: parseInt(moduleId)
      }
    },
    update: {
      permissions: permissions
    },
    create: {
      roleId: parseInt(roleId),
      moduleId: parseInt(moduleId),
      permissions: permissions
    }
  });
};

// Rolün tüm modül izinlerini getir
const getRolePermissions = async (roleId) => {
  return prisma.roleModulePermission.findMany({
    where: { roleId: parseInt(roleId) },
    include: {
      module: true
    }
  });
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
