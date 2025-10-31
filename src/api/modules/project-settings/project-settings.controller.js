/**
 * Campaign Settings Controller
 *
 * REFACTORING NOTU:
 * -----------------
 * Bu controller CRU operations (Create, Read, Update) kullanıyor.
 * projectId bazlı işlemler olduğu için sadece create, update, delete factory'ye uygun.
 * Özel metodlar: getSettingsByCampaign, upsertSettings
 */

const projectSettingsService = require('./project-settings.service');
const { createCRUDController } = require('../../../utils/controllerFactory');

// ========== CRUD OPERATIONS (Factory ile - kısmi) ==========

const projectSettingsServiceAdapter = {
  getAll: null, // projectId bazlı
  getById: null, // projectId bazlı
  create: (data) => projectSettingsService.createSettings(data),
  update: (id, data) => projectSettingsService.updateSettings(id, data),
  delete: (id) => projectSettingsService.deleteSettings(id),
};

const crudController = createCRUDController(projectSettingsServiceAdapter, {
  entityName: 'Campaign settings',
  entityNamePlural: 'Campaign settings',
});

// ========== ÖZEL METODLAR ==========

// GET /api/project-settings/:projectId - Get settings by project
const getSettingsByProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const settings = await projectSettingsService.getSettingsByProject(projectId);

    if (!settings) {
      // Varsayılan ayarları döndür
      const defaultSettings = projectSettingsService.getDefaultSettings();
      return res.json({
        message: 'No custom settings found, returning defaults',
        settings: defaultSettings,
        isDefault: true
      });
    }

    res.json({ settings, isDefault: false });
  } catch (error) {
    next(error);
  }
};

// POST /api/project-settings/:projectId/upsert - Upsert settings
const upsertSettings = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const settings = await projectSettingsService.upsertSettings(projectId, req.body);

    res.json({
      message: 'Project settings saved successfully',
      settings
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/project-settings/bulk-update - Toplu güncelleme
const bulkUpdatePresetAmounts = async (req, res, next) => {
  try {
    const { projectIds, presetAmounts } = req.body;

    if (!projectIds || !Array.isArray(projectIds) || projectIds.length === 0) {
      return res.status(400).json({
        message: 'En az bir proje seçilmelidir',
        field: 'projectIds'
      });
    }

    if (!presetAmounts || !Array.isArray(presetAmounts) || presetAmounts.length === 0) {
      return res.status(400).json({
        message: 'Geçerli bir tutar listesi girilmelidir',
        field: 'presetAmounts'
      });
    }

    const result = await projectSettingsService.bulkUpdatePresetAmounts(projectIds, presetAmounts);

    res.json({
      message: `${result.success} proje başarıyla güncellendi`,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// ========== EXPORT ==========

module.exports = {
  // Özel metodlar (projectId bazlı)
  getSettingsByProject,
  createSettings: crudController.create,
  updateSettings: crudController.update,
  deleteSettings: crudController.delete,
  upsertSettings,
  bulkUpdatePresetAmounts,
};
