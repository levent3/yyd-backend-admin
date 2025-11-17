const settingsRepo = require('./gallery-settings.repository');
const { formatEntityWithTranslation } = require('../../../utils/translationHelper');
const { buildFileUrl } = require('../../../utils/urlHelper');

// Helper to convert relative URLs to full URLs
const normalizeCoverImage = (imageUrl) => {
  if (!imageUrl) return imageUrl;

  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  return buildFileUrl(imageUrl);
};

const normalizeSettings = (settings, language = 'tr', includeAllTranslations = false) => {
  if (!settings) return settings;

  const formatted = formatEntityWithTranslation(settings, language, includeAllTranslations);

  return {
    ...formatted,
    coverImage: normalizeCoverImage(formatted.coverImage)
  };
};

const getSettings = async (language = 'tr', includeAllTranslations = false) => {
  const settings = await settingsRepo.getSettings(includeAllTranslations ? null : language);
  return normalizeSettings(settings, language, includeAllTranslations);
};

const updateSettings = async (data) => {
  const { translations, ...rest } = data;
  const mappedData = {};

  if (rest.coverImage !== undefined) {
    mappedData.coverImage = rest.coverImage;
  }

  if (rest.isActive !== undefined) {
    mappedData.isActive = rest.isActive;
  }

  // Translations
  if (translations && translations.length > 0) {
    mappedData.translations = translations.map(trans => ({
      language: trans.language,
      title: trans.title,
      description: trans.description || null
    }));
  }

  const settings = await settingsRepo.updateSettings(mappedData);
  return normalizeSettings(settings, 'tr', true);
};

module.exports = {
  getSettings,
  updateSettings
};
