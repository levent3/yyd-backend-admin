/**
 * Translation Helper Utilities
 * Çok dilli içerik yönetimi için yardımcı fonksiyonlar
 */

/**
 * Tercih edilen dilde çeviriyi döndürür
 * Fallback sırası: İstenen dil → Türkçe → İngilizce → İlk çeviri
 *
 * @param {Array} translations - Çeviri dizisi
 * @param {String} preferredLanguage - İstenilen dil kodu (tr, en, ar)
 * @returns {Object|null} - Bulunan çeviri veya null
 */
const getPreferredTranslation = (translations, preferredLanguage = 'tr') => {
  if (!translations || translations.length === 0) {
    return null;
  }

  // 1. İstenen dili bul
  let translation = translations.find(t => t.language === preferredLanguage);
  if (translation) return translation;

  // 2. Türkçe'yi dene (fallback)
  if (preferredLanguage !== 'tr') {
    translation = translations.find(t => t.language === 'tr');
    if (translation) return translation;
  }

  // 3. İngilizce'yi dene (fallback)
  if (preferredLanguage !== 'en') {
    translation = translations.find(t => t.language === 'en');
    if (translation) return translation;
  }

  // 4. İlk çeviriyi döndür
  return translations[0];
};

/**
 * Slug ile çeviri bul (dil parametresiyle)
 *
 * @param {Array} translations - Çeviri dizisi
 * @param {String} slug - Aranan slug
 * @param {String} language - Dil kodu (opsiyonel)
 * @returns {Object|null} - Bulunan çeviri veya null
 */
const getTranslationBySlug = (translations, slug, language = null) => {
  if (!translations || translations.length === 0) {
    return null;
  }

  // Eğer dil belirtilmişse, önce o dilde ara
  if (language) {
    const translation = translations.find(
      t => t.slug === slug && t.language === language
    );
    if (translation) return translation;
  }

  // Dil belirtilmemişse veya bulunamadıysa, slug ile herhangi bir dilde ara
  return translations.find(t => t.slug === slug);
};

/**
 * Include query objesine translation ekleme helper'ı
 *
 * @param {String} language - Dil kodu (opsiyonel)
 * @param {Object} baseInclude - Mevcut include objesi
 * @returns {Object} - Güncellenmiş include objesi
 */
const includeTranslations = (language = null, baseInclude = {}) => {
  const translationQuery = language
    ? {
        where: { language },
        orderBy: { language: 'asc' }
      }
    : {
        orderBy: { language: 'asc' }
      };

  return {
    ...baseInclude,
    translations: translationQuery
  };
};

/**
 * Entity'yi çevirisi ile birlikte format et
 * Eski API uyumluluğu için translation'daki alanları üst seviyeye taşır
 *
 * @param {Object} entity - Entity (news, project, vb.)
 * @param {String} preferredLanguage - Tercih edilen dil
 * @param {Boolean} includeAllTranslations - Tüm çevirileri dahil et
 * @returns {Object} - Formatlanmış entity
 */
const formatEntityWithTranslation = (
  entity,
  preferredLanguage = 'tr',
  includeAllTranslations = false
) => {
  if (!entity) return null;

  const { translations, ...rest } = entity;

  // Tercih edilen çeviriyi bul
  const preferredTranslation = getPreferredTranslation(translations, preferredLanguage);

  if (!preferredTranslation) {
    return {
      ...rest,
      translations: includeAllTranslations ? translations : [],
      translation: null
    };
  }

  // Eski API uyumluluğu: translation alanlarını üst seviyeye taşı
  return {
    ...rest,
    // Translation'dan gelen alanlar
    title: preferredTranslation.title,
    slug: preferredTranslation.slug,
    content: preferredTranslation.content,
    description: preferredTranslation.description,
    summary: preferredTranslation.summary,
    excerpt: preferredTranslation.excerpt,
    metaTitle: preferredTranslation.metaTitle,
    metaDescription: preferredTranslation.metaDescription,
    metaKeywords: preferredTranslation.metaKeywords,
    // Team Member için ek alanlar
    fullName: preferredTranslation.fullName,
    biography: preferredTranslation.biography,
    education: preferredTranslation.education,
    experience: preferredTranslation.experience,
    // HomeSlider için ek alanlar
    subtitle: preferredTranslation.subtitle,
    buttonText: preferredTranslation.buttonText,
    buttonLink: preferredTranslation.buttonLink,
    // Çeviri bilgisi
    translation: preferredTranslation,
    // Tüm çevirileri de dahil et (isteğe bağlı)
    translations: includeAllTranslations ? translations : undefined
  };
};

/**
 * Slug helper - Türkçe karakterleri dönüştür
 *
 * @param {String} title - Başlık
 * @returns {String} - Slug
 */
const generateSlug = (title) => {
  if (!title) return '';
  return title
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

module.exports = {
  getPreferredTranslation,
  getTranslationBySlug,
  includeTranslations,
  formatEntityWithTranslation,
  generateSlug
};
