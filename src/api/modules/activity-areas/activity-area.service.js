const activityAreaRepo = require('./activity-area.repository');
const { parsePagination, createPaginatedResponse } = require('../../../utils/pagination');
const {
  formatEntityWithTranslation,
  generateSlug
} = require('../../../utils/translationHelper');

const getAllActivityAreas = async (queryParams = {}) => {
  const { page, limit, isActive, language = 'tr' } = queryParams;
  const { skip, limit: take } = parsePagination(page, limit);

  // Build where clause
  const where = {};
  if (isActive !== undefined) where.isActive = isActive === 'true';

  const [activityAreas, total] = await Promise.all([
    // Admin paneli için tüm dillerdeki translations'ları getir (language=null)
    activityAreaRepo.findMany({ skip, take, where, language: null }),
    activityAreaRepo.count(where),
  ]);

  // Format her bir faaliyet alanını TÜM translations ile birlikte (includeAllTranslations=true)
  const formattedActivityAreas = activityAreas.map(item =>
    formatEntityWithTranslation(item, language, true)
  );

  return createPaginatedResponse(formattedActivityAreas, total, parseInt(page) || 1, take);
};

const getActivityAreaById = async (id, language = 'tr') => {
  // Admin paneli için tüm dillerdeki translations'ları getir (language=null)
  const activityArea = await activityAreaRepo.findById(id, null);
  return formatEntityWithTranslation(activityArea, language, true);
};

const getActivityAreaBySlug = async (slug, language = 'tr') => {
  const activityArea = await activityAreaRepo.findBySlug(slug, language);
  return formatEntityWithTranslation(activityArea, language, true);
};

const createActivityArea = async (data) => {
  // translations array: [{ language: 'tr', title: '...', description: '...', content: '...' }]
  const { translations, ...rest } = data;

  if (!translations || translations.length === 0) {
    throw new Error('En az bir çeviri gereklidir');
  }

  // Her bir translation için slug generate et
  const translationsWithSlug = translations.map(trans => ({
    language: trans.language,
    title: trans.title,
    slug: trans.slug || generateSlug(trans.title),
    description: trans.description || null,
    content: trans.content || null,
    metaTitle: trans.metaTitle || null,
    metaDescription: trans.metaDescription || null
  }));

  const mappedData = {
    icon: rest.icon || null,
    displayOrder: rest.displayOrder !== undefined ? rest.displayOrder : 0,
    isActive: rest.isActive !== undefined ? rest.isActive : true,
    translations: {
      create: translationsWithSlug
    }
  };

  try {
    return await activityAreaRepo.create(mappedData);
  } catch (error) {
    // Unique constraint hatası için özel mesaj
    if (error.code === 'P2002' && error.meta?.target?.includes('slug')) {
      const customError = new Error('Bu slug başka bir faaliyet alanında kullanılıyor. Lütfen farklı bir başlık girin.');
      customError.statusCode = 400;
      throw customError;
    }
    throw error;
  }
};

const updateActivityArea = async (id, data) => {
  const { translations, ...rest } = data;
  const mappedData = {};

  // Dil-bağımsız alanları güncelle
  if (rest.icon !== undefined) {
    mappedData.icon = rest.icon;
  }

  if (rest.displayOrder !== undefined) {
    mappedData.displayOrder = rest.displayOrder;
  }

  if (rest.isActive !== undefined) {
    mappedData.isActive = rest.isActive;
  }

  // Translations güncelleme (varsa)
  if (translations && translations.length > 0) {
    const translationUpdates = translations.map(trans => ({
      where: {
        activityAreaId_language: {
          activityAreaId: id,
          language: trans.language
        }
      },
      create: {
        language: trans.language,
        title: trans.title,
        slug: trans.slug || generateSlug(trans.title),
        description: trans.description || null,
        content: trans.content || null,
        metaTitle: trans.metaTitle || null,
        metaDescription: trans.metaDescription || null
      },
      update: {
        title: trans.title,
        slug: trans.slug || generateSlug(trans.title),
        description: trans.description || null,
        content: trans.content || null,
        metaTitle: trans.metaTitle || null,
        metaDescription: trans.metaDescription || null
      }
    }));

    mappedData.translations = {
      upsert: translationUpdates
    };
  }

  try {
    return await activityAreaRepo.update(id, mappedData);
  } catch (error) {
    // Unique constraint hatası için özel mesaj
    if (error.code === 'P2002' && error.meta?.target?.includes('slug')) {
      const customError = new Error('Bu slug başka bir faaliyet alanında kullanılıyor. Lütfen farklı bir başlık girin.');
      customError.statusCode = 400;
      throw customError;
    }
    throw error;
  }
};

const deleteActivityArea = (id) => {
  return activityAreaRepo.deleteById(id);
};

const getActiveActivityAreas = async (queryParams = {}) => {
  const { page, limit, language = 'tr' } = queryParams;
  const { skip, limit: take } = parsePagination(page, limit);

  const where = {
    isActive: true
  };

  const [activityAreas, total] = await Promise.all([
    activityAreaRepo.findActive({ skip, take, language }),
    activityAreaRepo.count(where),
  ]);

  // Format her bir faaliyet alanını çevirisiyle birlikte
  const formattedActivityAreas = activityAreas.map(item =>
    formatEntityWithTranslation(item, language, false)
  );

  return createPaginatedResponse(formattedActivityAreas, total, parseInt(page) || 1, take);
};

// ========== PAGE BUILDER METHODS ==========

const updateBuilderData = async (id, language, builderData) => {
  const activityArea = await activityAreaRepo.findById(id);
  if (!activityArea) {
    throw { status: 404, message: 'Activity Area not found' };
  }
  return await activityAreaRepo.updateBuilderData(id, language, builderData);
};

const getBuilderData = async (id, language = 'tr') => {
  const activityArea = await activityAreaRepo.findById(id, language);
  if (!activityArea) {
    throw { status: 404, message: 'Activity Area not found' };
  }

  const translation = activityArea.translations.find(t => t.language === language);
  return {
    builderData: translation?.builderData || null,
    builderHtml: translation?.builderHtml || null,
    builderCss: translation?.builderCss || null,
    usePageBuilder: translation?.usePageBuilder || false,
  };
};

module.exports = {
  getAllActivityAreas,
  getActivityAreaById,
  getActivityAreaBySlug,
  createActivityArea,
  updateActivityArea,
  deleteActivityArea,
  getActiveActivityAreas,
  updateBuilderData,
  getBuilderData
};
