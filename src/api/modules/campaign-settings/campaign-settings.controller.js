const campaignSettingsService = require('./campaign-settings.service');

// GET /api/campaign-settings/:campaignId
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

// POST /api/campaign-settings
const createSettings = async (req, res, next) => {
  try {
    const settings = await campaignSettingsService.createSettings(req.body);

    res.status(201).json({
      message: 'Campaign settings created successfully',
      settings
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/campaign-settings/:campaignId
const updateSettings = async (req, res, next) => {
  try {
    const { campaignId } = req.params;
    const settings = await campaignSettingsService.updateSettings(campaignId, req.body);

    res.json({
      message: 'Campaign settings updated successfully',
      settings
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/campaign-settings/:campaignId
const deleteSettings = async (req, res, next) => {
  try {
    const { campaignId } = req.params;
    await campaignSettingsService.deleteSettings(campaignId);

    res.json({ message: 'Campaign settings deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// POST /api/campaign-settings/:campaignId/upsert
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

module.exports = {
  getSettingsByCampaign,
  createSettings,
  updateSettings,
  deleteSettings,
  upsertSettings
};
