// src/api/modules/roles/role.controller.js
const roleService = require('./role.service');

const getAllRoles = async (req, res, next) => {
  try {
    const roles = await roleService.getAllRoles();
    res.status(200).json(roles);
  } catch (error) {
    next(error);
  }
};

const getRoleById = async (req, res, next) => {
  try {
    const role = await roleService.getRoleById(req.params.id);
    res.status(200).json(role);
  } catch (error) {
    next(error);
  }
};

const createRole = async (req, res, next) => {
  try {
    const role = await roleService.createRole(req.body);
    res.status(201).json({ message: 'Rol başarıyla oluşturuldu.', role });
  } catch (error) {
    next(error);
  }
};

const updateRole = async (req, res, next) => {
  try {
    const role = await roleService.updateRole(req.params.id, req.body);
    res.status(200).json({ message: 'Rol başarıyla güncellendi.', role });
  } catch (error) {
    next(error);
  }
};

const deleteRole = async (req, res, next) => {
  try {
    await roleService.deleteRole(req.params.id);
    res.status(200).json({ message: 'Rol başarıyla silindi.' });
  } catch (error) {
    next(error);
  }
};

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

const getRolePermissions = async (req, res, next) => {
  try {
    const permissions = await roleService.getRolePermissions(req.params.roleId);
    res.status(200).json(permissions);
  } catch (error) {
    next(error);
  }
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
