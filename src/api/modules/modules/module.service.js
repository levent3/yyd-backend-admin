const moduleRepository = require('./module.repository');

const getAllModules = () => {
  return moduleRepository.getAllModules();
};

const getModuleById = (id) => {
  return moduleRepository.getModuleById(id);
};

const createModule = (data) => {
  return moduleRepository.createModule(data);
};

const updateModule = (id, data) => {
  return moduleRepository.updateModule(id, data);
};

const deleteModule = (id) => {
  return moduleRepository.deleteModule(id);
};

module.exports = {
  getAllModules,
  getModuleById,
  createModule,
  updateModule,
  deleteModule
};
