const express = require('express');
const moduleController = require('./module.controller');
const authMiddleware = require('../../middlewares/authMiddleware');
const { checkPermission } = require('../../middlewares/rbacMiddleware');
const router = express.Router();

// Tüm route'lar authentication gerektirir
router.use(authMiddleware);

// Modül listesi - okuma yetkisi gerekli (roles modülü için)
router.get('/', checkPermission('roles', 'read'), moduleController.getAllModules);

// Modül detayı - okuma yetkisi gerekli
router.get('/:id', checkPermission('modules', 'read'), moduleController.getModuleById);

// Modül oluşturma - oluşturma yetkisi gerekli
router.post('/', checkPermission('modules', 'create'), moduleController.createModule);

// Modül güncelleme - güncelleme yetkisi gerekli
router.put('/:id', checkPermission('modules', 'update'), moduleController.updateModule);

// Modül silme - silme yetkisi gerekli
router.delete('/:id', checkPermission('modules', 'delete'), moduleController.deleteModule);

module.exports = router;
