const moduleService = require('./module.service');

const getAllModules = async (req, res, next) => {
  try {
    const modules = await moduleService.getAllModules();
    res.status(200).json(modules);
  } catch (error) {
    next(error);
  }
};

const getModuleById = async (req, res, next) => {
  try {
    const module = await moduleService.getModuleById(parseInt(req.params.id));
    res.status(200).json(module);
  } catch (error) {
    next(error);
  }
};

const createModule = async (req, res, next) => {
  try {
    const module = await moduleService.createModule(req.body);
    res.status(201).json({ message: 'Modül başarıyla oluşturuldu', module });
  } catch (error) {
    next(error);
  }
};

const updateModule = async (req, res, next) => {
  try {
    const module = await moduleService.updateModule(parseInt(req.params.id), req.body);
    res.status(200).json({ message: 'Modül başarıyla güncellendi', module });
  } catch (error) {
    next(error);
  }
};

const deleteModule = async (req, res, next) => {
  try {
    await moduleService.deleteModule(parseInt(req.params.id));
    res.status(200).json({ message: 'Modül başarıyla silindi' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllModules,
  getModuleById,
  createModule,
  updateModule,
  deleteModule
};
