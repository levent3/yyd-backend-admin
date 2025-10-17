const campaignSettingsRepo = require('./campaign-settings.repository');

const getSettingsByCampaign = (campaignId) => {
  return campaignSettingsRepo.findByCampaignId(campaignId);
};

const createSettings = (data) => {
  return campaignSettingsRepo.create(data);
};

const updateSettings = (campaignId, data) => {
  return campaignSettingsRepo.update(campaignId, data);
};

const deleteSettings = (campaignId) => {
  return campaignSettingsRepo.deleteById(campaignId);
};

const upsertSettings = (campaignId, data) => {
  return campaignSettingsRepo.upsert(campaignId, data);
};

// Varsayılan ayarları döndür (kampanya için settings yoksa)
const getDefaultSettings = () => {
  return {
    presetAmounts: [100, 200, 500, 1000, 2000],
    minAmount: 10,
    maxAmount: null,
    allowRepeat: true,
    minRepeatCount: 2,
    maxRepeatCount: 18,
    allowOneTime: true,
    allowRecurring: true,
    allowedFrequencies: ["monthly", "quarterly", "yearly"],
    allowDedication: false,
    allowAnonymous: true,
    requireMessage: false,
    showProgress: true,
    showDonorCount: true,
    showBeneficiaries: true,
    impactMetrics: [],
    successStories: []
  };
};

// Kampanya için ayarları getir veya default'u döndür
const getOrCreateDefaultSettings = async (campaignId) => {
  let settings = await campaignSettingsRepo.findByCampaignId(campaignId);

  if (!settings) {
    // Varsayılan ayarları oluştur
    settings = await campaignSettingsRepo.create({
      campaignId,
      ...getDefaultSettings()
    });
  }

  return settings;
};

module.exports = {
  getSettingsByCampaign,
  createSettings,
  updateSettings,
  deleteSettings,
  upsertSettings,
  getDefaultSettings,
  getOrCreateDefaultSettings
};
