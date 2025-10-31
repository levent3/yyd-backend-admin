const projectSettingsRepo = require('./project-settings.repository');

const getSettingsByProject = (projectId) => {
  return projectSettingsRepo.findByProjectId(projectId);
};

const createSettings = (data) => {
  return projectSettingsRepo.create(data);
};

const updateSettings = (projectId, data) => {
  return projectSettingsRepo.update(projectId, data);
};

const deleteSettings = (projectId) => {
  return projectSettingsRepo.deleteById(projectId);
};

const upsertSettings = (projectId, data) => {
  return projectSettingsRepo.upsert(projectId, data);
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

// Proje için ayarları getir veya default'u döndür
const getOrCreateDefaultSettings = async (projectId) => {
  let settings = await projectSettingsRepo.findByProjectId(projectId);

  if (!settings) {
    // Varsayılan ayarları oluştur
    settings = await projectSettingsRepo.create({
      projectId,
      ...getDefaultSettings()
    });
  }

  return settings;
};

// Toplu güncelleme - Seçili projelerin preset amounts'larını güncelle
const bulkUpdatePresetAmounts = async (projectIds, presetAmounts) => {
  if (!projectIds || projectIds.length === 0) {
    throw new Error('En az bir proje seçilmelidir');
  }

  if (!presetAmounts || !Array.isArray(presetAmounts) || presetAmounts.length === 0) {
    throw new Error('Geçerli bir tutar listesi girilmelidir');
  }

  // Her proje için ayarları güncelle
  const results = await Promise.allSettled(
    projectIds.map(async (projectId) => {
      // Mevcut ayarları getir veya oluştur
      let settings = await projectSettingsRepo.findByProjectId(projectId);

      if (!settings) {
        // Yoksa oluştur
        settings = await projectSettingsRepo.create({
          projectId,
          ...getDefaultSettings(),
          presetAmounts
        });
      } else {
        // Varsa güncelle
        settings = await projectSettingsRepo.update(projectId, {
          presetAmounts
        });
      }

      return { projectId, success: true, settings };
    })
  );

  // Başarılı ve başarısız olanları ayır
  const successful = results.filter(r => r.status === 'fulfilled').map(r => r.value);
  const failed = results.filter(r => r.status === 'rejected').map(r => ({
    projectId: r.reason?.projectId || 'unknown',
    error: r.reason?.message || 'Bilinmeyen hata'
  }));

  return {
    success: successful.length,
    failed: failed.length,
    total: projectIds.length,
    results: successful,
    errors: failed
  };
};

module.exports = {
  getSettingsByProject,
  createSettings,
  updateSettings,
  deleteSettings,
  upsertSettings,
  getDefaultSettings,
  getOrCreateDefaultSettings,
  bulkUpdatePresetAmounts
};
