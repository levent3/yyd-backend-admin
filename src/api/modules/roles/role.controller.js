/**
 * Role Controller
 *
 * REFACTORING NOTU:
 * -----------------
 * Bu controller artık generic controllerFactory kullanıyor.
 * Standard CRUD işlemleri factory'den geliyor.
 * Özel metodlar: assignModulePermissions, getRolePermissions
 */

const roleService = require('./role.service');
const { createCRUDController } = require('../../../utils/controllerFactory');

// ========== STANDARD CRUD OPERATIONS (Factory ile) ==========

const roleServiceAdapter = {
  getAll: () => roleService.getAllRoles(),
  getById: (id) => roleService.getRoleById(id),
  create: (data) => roleService.createRole(data),
  update: (id, data) => roleService.updateRole(id, data),
  delete: (id) => roleService.deleteRole(id),
};

const crudController = createCRUDController(roleServiceAdapter, {
  entityName: 'Rol',
  entityNamePlural: 'Roller',
});

// ========== ÖZEL METODLAR ==========

// POST /api/roles/:roleId/modules/:moduleId - Assign permissions
const assignModulePermissions = async (req, res, next) => {
  try {
    const { roleId, moduleId } = req.params;
    const permissions = req.body;

    const result = await roleService.assignModulePermissions(roleId, moduleId, permissions);
    res.status(200).json({
      message: 'İzinler başarıyla atandı.',
      permission: result
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/roles/:roleId/permissions - Get role permissions
const getRolePermissions = async (req, res, next) => {
  try {
    const permissions = await roleService.getRolePermissions(req.params.roleId);
    res.status(200).json(permissions);
  } catch (error) {
    next(error);
  }
};

// ========== EXPORT ==========

module.exports = {
  // Standard CRUD (factory'den)
  getAllRoles: crudController.getAll,
  getRoleById: crudController.getById,
  createRole: crudController.create,
  updateRole: crudController.update,
  deleteRole: crudController.delete,

  // Özel metodlar
  assignModulePermissions,
  getRolePermissions,
};
