// src/api/middlewares/rbacMiddleware.js
const prisma = require('../../config/prismaClient');

/**
 * Rol bazlı erişim kontrolü
 * @param {Array} allowedRoles - İzin verilen rol isimleri (örn: ['superadmin', 'editor'])
 */
const checkRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      // authMiddleware'den gelen user bilgisi
      if (!req.user || !req.user.roleId) {
        const error = new Error('Kullanıcı bilgisi bulunamadı.');
        error.statusCode = 401;
        throw error;
      }

      // Kullanıcının rolünü veritabanından çek
      const userRole = await prisma.role.findUnique({
        where: { id: req.user.roleId },
        select: { name: true }
      });

      if (!userRole) {
        const error = new Error('Kullanıcı rolü bulunamadı.');
        error.statusCode = 403;
        throw error;
      }

      // Rolü kontrol et
      if (!allowedRoles.includes(userRole.name.toLowerCase())) {
        const error = new Error('Bu işlem için yetkiniz yok.');
        error.statusCode = 403; // Forbidden
        throw error;
      }

      // Rol adını req'e ekle (ileride kullanılabilir)
      req.user.roleName = userRole.name;
      next();
    } catch (error) {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    }
  };
};

/**
 * Modül ve işlem bazlı izin kontrolü
 * @param {String} moduleKey - AdminModule'ün moduleKey'i (örn: 'projects', 'users')
 * @param {String} action - İşlem tipi ('read', 'create', 'update', 'delete')
 */
const checkPermission = (moduleKey, action) => {
  return async (req, res, next) => {
    try {
      // authMiddleware'den gelen user bilgisi
      if (!req.user || !req.user.roleId) {
        const error = new Error('Kullanıcı bilgisi bulunamadı.');
        error.statusCode = 401;
        throw error;
      }

      // Superadmin rolünü kontrol et - superadmin'e her şey izinli
      const userRole = await prisma.role.findUnique({
        where: { id: req.user.roleId },
        select: { name: true }
      });

      if (userRole && userRole.name.toLowerCase() === 'superadmin') {
        req.user.roleName = userRole.name;
        return next(); // Superadmin, tüm izinleri atla
      }

      // İlgili modülü bul
      const module = await prisma.adminModule.findUnique({
        where: { moduleKey: moduleKey }
      });

      if (!module) {
        const error = new Error(`Modül bulunamadı: ${moduleKey}`);
        error.statusCode = 404;
        throw error;
      }

      // Kullanıcının bu modül için izinlerini kontrol et
      const permission = await prisma.roleModulePermission.findUnique({
        where: {
          roleId_moduleId: {
            roleId: req.user.roleId,
            moduleId: module.id
          }
        }
      });

      if (!permission) {
        const error = new Error('Bu modül için izniniz yok.');
        error.statusCode = 403;
        throw error;
      }

      // İlgili action'ın izni var mı kontrol et
      const permissions = permission.permissions;
      if (!permissions[action]) {
        const error = new Error(`Bu işlem (${action}) için izniniz yok.`);
        error.statusCode = 403;
        throw error;
      }

      // İzin varsa devam et
      req.user.roleName = userRole.name;
      next();
    } catch (error) {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    }
  };
};

module.exports = { checkRole, checkPermission };
