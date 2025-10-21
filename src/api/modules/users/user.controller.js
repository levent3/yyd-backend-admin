/**
 * User Controller
 *
 * REFACTORING NOTU:
 * -----------------
 * Bu controller artık generic controllerFactory kullanıyor.
 * En basit controller örneği - sadece standard CRUD işlemleri.
 * Hiç özel metod veya hook yok.
 */

const userService = require('./user.service');
const { createCRUDController } = require('../../../utils/controllerFactory');

// Service metodlarını factory'nin beklediği formata adapt et
const userServiceAdapter = {
  getAll: (query) => userService.getAllUsers(query),
  getById: (id) => userService.getUserById(id),
  create: (data) => userService.createUser(data),
  update: (id, data) => userService.updateUser(id, data),
  delete: (id) => userService.deleteUser(id),
};

// Factory ile controller oluştur
const crudController = createCRUDController(userServiceAdapter, {
  entityName: 'Kullanıcı',
  entityNamePlural: 'Kullanıcılar',
});

// Export - Factory'den gelen metodlar
module.exports = {
  getAllUsers: crudController.getAll,
  getUserById: crudController.getById,
  createUser: crudController.create,
  updateUser: crudController.update,
  deleteUser: crudController.delete,
};
