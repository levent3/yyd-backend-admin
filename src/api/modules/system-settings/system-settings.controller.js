const systemSettingsService = require('./system-settings.service');

// GET /api/system-settings
const getAllSettings = async (req, res, next) => {
  try {
    const { category, isActive, isPublic } = req.query;
    const settings = await systemSettingsService.getAllSettings({ category, isActive, isPublic });

    res.json(settings);
  } catch (error) {
    next(error);
  }
};

// GET /api/system-settings/public
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

// GET /api/system-settings/:key
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

// GET /api/system-settings/category/:category
const getSettingsByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const settings = await systemSettingsService.getSettingsByCategory(category);

    res.json(settings);
  } catch (error) {
    next(error);
  }
};

// POST /api/system-settings
const createSetting = async (req, res, next) => {
  try {
    const setting = await systemSettingsService.createSetting(req.body);

    res.status(201).json({
      message: 'System setting created successfully',
      setting
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/system-settings/:key
const updateSetting = async (req, res, next) => {
  try {
    const { key } = req.params;
    const setting = await systemSettingsService.updateSetting(key, req.body);

    res.json({
      message: 'System setting updated successfully',
      setting
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/system-settings/:key
const deleteSetting = async (req, res, next) => {
  try {
    const { key } = req.params;
    await systemSettingsService.deleteSetting(key);

    res.json({ message: 'System setting deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// POST /api/system-settings/:key/upsert
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

// POST /api/system-settings/initialize
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

module.exports = {
  getAllSettings,
  getPublicSettings,
  getSettingByKey,
  getSettingsByCategory,
  createSetting,
  updateSetting,
  deleteSetting,
  upsertSetting,
  initializeDefaults
};
