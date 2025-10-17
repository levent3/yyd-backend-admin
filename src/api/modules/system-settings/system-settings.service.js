const systemSettingsRepo = require('./system-settings.repository');

// Cache için (performance)
let settingsCache = {};
let cacheExpiry = null;
const CACHE_DURATION = 10 * 60 * 1000; // 10 dakika

const clearCache = () => {
  settingsCache = {};
  cacheExpiry = null;
};

const getAllSettings = (filters) => {
  return systemSettingsRepo.findAll(filters);
};

const getSettingByKey = async (settingKey, useCache = true) => {
  const now = Date.now();

  // Cache kontrolü
  if (useCache && settingsCache[settingKey] && cacheExpiry && now < cacheExpiry) {
    return settingsCache[settingKey];
  }

  const setting = await systemSettingsRepo.findByKey(settingKey);

  // Cache'e kaydet
  if (useCache && setting) {
    settingsCache[settingKey] = setting;
    if (!cacheExpiry) cacheExpiry = now + CACHE_DURATION;
  }

  return setting;
};

const getSettingsByCategory = (category) => {
  return systemSettingsRepo.findByCategory(category);
};

const getPublicSettings = () => {
  return systemSettingsRepo.findPublicSettings();
};

const createSetting = async (data) => {
  const setting = await systemSettingsRepo.create(data);
  clearCache();
  return setting;
};

const updateSetting = async (settingKey, data) => {
  const setting = await systemSettingsRepo.update(settingKey, data);
  clearCache();
  return setting;
};

const deleteSetting = async (settingKey) => {
  const result = await systemSettingsRepo.deleteByKey(settingKey);
  clearCache();
  return result;
};

const upsertSetting = async (settingKey, data) => {
  const setting = await systemSettingsRepo.upsert(settingKey, data);
  clearCache();
  return setting;
};

// Helper: Get setting value directly
const getValue = async (settingKey, defaultValue = null) => {
  const setting = await getSettingByKey(settingKey);
  return setting ? setting.settingValue : defaultValue;
};

// Helper: Set setting value directly
const setValue = async (settingKey, value, options = {}) => {
  return upsertSetting(settingKey, {
    settingValue: value,
    ...options
  });
};

// Varsayılan sistem ayarları
const getDefaultSettings = () => {
  return {
    // Payment
    default_currency: { value: "TRY", category: "payment", isPublic: true },
    payment_gateways: {
      value: ["iyzico", "paytr"],
      category: "payment",
      isPublic: true
    },
    min_donation_amount: { value: 10, category: "donation", isPublic: true },

    // Languages
    supported_languages: {
      value: ["tr", "en", "ar"],
      category: "general",
      isPublic: true
    },
    default_language: { value: "tr", category: "general", isPublic: true },

    // Notification
    notification_email: { value: "info@yyd.org.tr", category: "notification", isPublic: false },

    // Donation
    cart_expiry_minutes: { value: 30, category: "donation", isPublic: true },
    allow_anonymous_donations: { value: true, category: "donation", isPublic: true },

    // SMS Donation
    sms_short_code: { value: null, category: "payment", isPublic: true },
    sms_enabled: { value: false, category: "payment", isPublic: true }
  };
};

// Initialize default settings (sadece ilk kurulumda)
const initializeDefaults = async () => {
  const defaults = getDefaultSettings();
  const created = [];

  for (const [key, config] of Object.entries(defaults)) {
    const existing = await systemSettingsRepo.findByKey(key);

    if (!existing) {
      const setting = await systemSettingsRepo.create({
        settingKey: key,
        settingValue: config.value,
        category: config.category,
        isPublic: config.isPublic,
        description: `Default ${key} setting`
      });
      created.push(setting);
    }
  }

  clearCache();
  return created;
};

module.exports = {
  getAllSettings,
  getSettingByKey,
  getSettingsByCategory,
  getPublicSettings,
  createSetting,
  updateSetting,
  deleteSetting,
  upsertSetting,
  getValue,
  setValue,
  getDefaultSettings,
  initializeDefaults,
  clearCache
};
