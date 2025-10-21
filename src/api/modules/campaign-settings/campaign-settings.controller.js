/**
 * Campaign Settings Controller
 *
 * REFACTORING NOTU:
 * -----------------
 * Bu controller CRU operations (Create, Read, Update) kullanıyor.
 * campaignId bazlı işlemler olduğu için sadece create, update, delete factory'ye uygun.
 * Özel metodlar: getSettingsByCampaign, upsertSettings
 */

const campaignSettingsService = require('./campaign-settings.service');
const { createCRUDController } = require('../../../utils/controllerFactory');

// ========== CRUD OPERATIONS (Factory ile - kısmi) ==========

const campaignSettingsServiceAdapter = {
  getAll: null, // campaignId bazlı
  getById: null, // campaignId bazlı
  create: (data) => campaignSettingsService.createSettings(data),
  update: (id, data) => campaignSettingsService.updateSettings(id, data),
  delete: (id) => campaignSettingsService.deleteSettings(id),
};

const crudController = createCRUDController(campaignSettingsServiceAdapter, {
  entityName: 'Campaign settings',
  entityNamePlural: 'Campaign settings',
});

// ========== ÖZEL METODLAR ==========

// GET /api/campaign-settings/:campaignId - Get settings by campaign
const getSettingsByCampaign = async (req, res, next) => {
  try {
    const { campaignId } = req.params;
    const settings = await campaignSettingsService.getSettingsByCampaign(campaignId);

    if (!settings) {
      // Varsayılan ayarları döndür
      const defaultSettings = campaignSettingsService.getDefaultSettings();
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

// POST /api/campaign-settings/:campaignId/upsert - Upsert settings
const upsertSettings = async (req, res, next) => {
  try {
    const { campaignId } = req.params;
    const settings = await campaignSettingsService.upsertSettings(campaignId, req.body);

    res.json({
      message: 'Campaign settings saved successfully',
      settings
    });
  } catch (error) {
    next(error);
  }
};

// ========== EXPORT ==========

module.exports = {
  // Özel metodlar (campaignId bazlı)
  getSettingsByCampaign,
  createSettings: crudController.create,
  updateSettings: crudController.update,
  deleteSettings: crudController.delete,
  upsertSettings,
};
