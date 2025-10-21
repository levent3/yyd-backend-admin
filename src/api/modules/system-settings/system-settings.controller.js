/**
 * System Settings Controller
 *
 * REFACTORING NOTU:
 * -----------------
 * Bu controller artık generic controllerFactory kullanıyor.
 * Standard CRUD işlemleri factory'den geliyor.
 * Özel metodlar: getPublicSettings, getSettingByKey, getSettingsByCategory, upsertSetting, initializeDefaults
 */

const systemSettingsService = require('./system-settings.service');
const { createCRUDController } = require('../../../utils/controllerFactory');

// ========== STANDARD CRUD OPERATIONS (Factory ile) ==========

const systemSettingsServiceAdapter = {
  getAll: (query) => systemSettingsService.getAllSettings(query),
  getById: null, // Key-based, not ID-based
  create: (data) => systemSettingsService.createSetting(data),
  update: (id, data) => systemSettingsService.updateSetting(id, data),
  delete: (id) => systemSettingsService.deleteSetting(id),
};

const crudController = createCRUDController(systemSettingsServiceAdapter, {
  entityName: 'System setting',
  entityNamePlural: 'System settings',
});

// ========== ÖZEL METODLAR ==========

// GET /api/system-settings/public - Get public settings
const getPublicSettings = async (req, res, next) => {
  try {
    const settings = await systemSettingsService.getPublicSettings();

    // Key-value object olarak döndür
    const settingsMap = {};
    settings.forEach(s => {
      settingsMap[s.settingKey] = s.settingValue;
    });

    res.json(settingsMap);
  } catch (error) {
    next(error);
  }
};

// GET /api/system-settings/:key - Get setting by key
const getSettingByKey = async (req, res, next) => {
  try {
    const { key } = req.params;
    const setting = await systemSettingsService.getSettingByKey(key);

    if (!setting) {
      return res.status(404).json({ message: 'Setting not found' });
    }

    res.json(setting);
  } catch (error) {
    next(error);
  }
};

// GET /api/system-settings/category/:category - Get settings by category
const getSettingsByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const settings = await systemSettingsService.getSettingsByCategory(category);

    res.json(settings);
  } catch (error) {
    next(error);
  }
};

// POST /api/system-settings/:key/upsert - Upsert setting
const upsertSetting = async (req, res, next) => {
  try {
    const { key } = req.params;
    const setting = await systemSettingsService.upsertSetting(key, req.body);

    res.json({
      message: 'System setting saved successfully',
      setting
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/system-settings/initialize - Initialize default settings
const initializeDefaults = async (req, res, next) => {
  try {
    const created = await systemSettingsService.initializeDefaults();

    res.json({
      message: 'Default settings initialized',
      created: created.length,
      settings: created
    });
  } catch (error) {
    next(error);
  }
};

// ========== EXPORT ==========

module.exports = {
  // Standard CRUD (factory'den)
  getAllSettings: crudController.getAll,
  createSetting: crudController.create,
  updateSetting: crudController.update,
  deleteSetting: crudController.delete,

  // Özel metodlar
  getPublicSettings,
  getSettingByKey,
  getSettingsByCategory,
  upsertSetting,
  initializeDefaults,
};
