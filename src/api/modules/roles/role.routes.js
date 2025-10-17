// src/api/modules/roles/role.routes.js
const express = require('express');
const roleController = require('./role.controller');
const authMiddleware = require('../../middlewares/authMiddleware');
const { checkPermission } = require('../../middlewares/rbacMiddleware');
const router = express.Router();

// Tüm route'lar authentication gerektirir
router.use(authMiddleware);

// Rol listesi - okuma yetkisi gerekli
router.get('/', checkPermission('roles', 'read'), roleController.getAllRoles);

// Tek bir rol getir - okuma yetkisi gerekli
router.get('/:id', checkPermission('roles', 'read'), roleController.getRoleById);

// Yeni rol oluştur - create yetkisi gerekli
router.post('/', checkPermission('roles', 'create'), roleController.createRole);

// Rol güncelle - update yetkisi gerekli
router.put('/:id', checkPermission('roles', 'update'), roleController.updateRole);

// Rol sil - delete yetkisi gerekli
router.delete('/:id', checkPermission('roles', 'delete'), roleController.deleteRole);

// Rol izinleri yönetimi
// Rolün tüm izinlerini getir - okuma yetkisi gerekli
router.get('/:roleId/permissions', checkPermission('roles', 'read'), roleController.getRolePermissions);

// Role modül izni ata/güncelle - update yetkisi gerekli
router.put('/:roleId/permissions/:moduleId', checkPermission('roles', 'update'), roleController.assignModulePermissions);

module.exports = router;
