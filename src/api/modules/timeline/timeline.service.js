const timelineRepo = require('./timeline.repository');
const { parsePagination, createPaginatedResponse } = require('../../../utils/pagination');
const { formatEntityWithTranslation, generateSlug } = require('../../../utils/translationHelper');

const getAllTimelines = async (queryParams = {}) => {
  const { page, limit, year, isActive, language = 'tr' } = queryParams;
  const { skip, limit: take } = parsePagination(page, limit);

  // Build where clause
  const where = {};
  if (year) where.year = parseInt(year);
  if (isActive !== undefined) where.isActive = isActive === 'true';

  const [timelines, total] = await Promise.all([
    timelineRepo.findMany({ skip, take, where, language }),
    timelineRepo.count(where),
  ]);

  // Format her bir timeline'ı çevirisiyle birlikte
  const formattedTimelines = timelines.map(item =>
    formatEntityWithTranslation(item, language, false)
  );

  return createPaginatedResponse(formattedTimelines, total, parseInt(page) || 1, take);
};

const getTimelineById = async (id, language = 'tr') => {
  // Admin paneli için tüm dillerdeki translations'ları getir (language=null)
  const timeline = await timelineRepo.findById(id, null);
  return formatEntityWithTranslation(timeline, language, true);
};

const getTimelinesByYear = async (year, language = 'tr') => {
  const timelines = await timelineRepo.findByYear(parseInt(year), language);
  return timelines.map(item => formatEntityWithTranslation(item, language, true));
};

const createTimeline = async (data) => {
  const { translations, ...rest } = data;

  if (!translations || translations.length === 0) {
    const error = new Error('En az bir çeviri gereklidir');
    error.statusCode = 400;
    throw error;
  }

  // Translations'ı map et
  const translationsData = translations.map(trans => ({
    language: trans.language,
    title: trans.title,
    description: trans.description || null
  }));

  const mappedData = {
    year: parseInt(rest.year),
    displayOrder: rest.displayOrder || 0,
    isActive: rest.isActive !== undefined ? rest.isActive : true,
    translations: {
      create: translationsData
    }
  };

  try {
    return await timelineRepo.create(mappedData);
  } catch (error) {
    throw error;
  }
};

const updateTimeline = async (id, data) => {
  const { translations, ...rest } = data;
  const mappedData = {};

  // Dil-bağımsız alanları güncelle
  if (rest.year !== undefined) {
    mappedData.year = parseInt(rest.year);
  }
  if (rest.displayOrder !== undefined) {
    mappedData.displayOrder = parseInt(rest.displayOrder);
  }
  if (rest.isActive !== undefined) {
    mappedData.isActive = rest.isActive;
  }

  // Translations güncelleme (varsa)
  if (translations && translations.length > 0) {
    const translationUpdates = translations.map(trans => ({
      where: {
        timelineId_language: {
          timelineId: id,
          language: trans.language
        }
      },
      create: {
        language: trans.language,
        title: trans.title,
        description: trans.description || null
      },
      update: {
        title: trans.title,
        description: trans.description || null
      }
    }));

    mappedData.translations = {
      upsert: translationUpdates
    };
  }

  try {
    return await timelineRepo.update(id, mappedData);
  } catch (error) {
    throw error;
  }
};

const deleteTimeline = (id) => timelineRepo.deleteById(id);

module.exports = {
  getAllTimelines,
  getTimelineById,
  getTimelinesByYear,
  createTimeline,
  updateTimeline,
  deleteTimeline
};
