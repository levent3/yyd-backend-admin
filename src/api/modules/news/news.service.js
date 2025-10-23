const newsRepo = require('./news.repository');
const { parsePagination, createPaginatedResponse } = require('../../../utils/pagination');
const {
  formatEntityWithTranslation,
  generateSlug
} = require('../../../utils/translationHelper');

const getAllNews = async (queryParams = {}) => {
  const { page, limit, status, authorId, language = 'tr' } = queryParams;
  const { skip, limit: take } = parsePagination(page, limit);

  // Build where clause
  const where = {};
  if (status) where.status = status;
  if (authorId) where.authorId = parseInt(authorId);

  const [news, total] = await Promise.all([
    newsRepo.findMany({ skip, take, where, language }),
    newsRepo.count(where),
  ]);

  // Format her bir haberi çevirisiyle birlikte
  const formattedNews = news.map(item =>
    formatEntityWithTranslation(item, language, false)
  );

  return createPaginatedResponse(formattedNews, total, parseInt(page) || 1, take);
};

const getNewsById = async (id, language = 'tr') => {
  // Admin paneli için tüm dillerdeki translations'ları getir (language=null)
  const news = await newsRepo.findById(id, null);
  return formatEntityWithTranslation(news, language, true);
};

const getNewsBySlug = async (slug, language = 'tr') => {
  const news = await newsRepo.findBySlug(slug, language);
  return formatEntityWithTranslation(news, language, true);
};

const createNews = async (data) => {
  // translations array: [{ language: 'tr', title: '...', summary: '...', content: '...' }]
  const { translations, ...rest } = data;

  if (!translations || translations.length === 0) {
    throw new Error('En az bir çeviri gereklidir');
  }

  // Her bir translation için slug generate et
  const translationsWithSlug = translations.map(trans => ({
    language: trans.language,
    title: trans.title,
    slug: trans.slug || generateSlug(trans.title),
    summary: trans.summary || null,
    content: trans.content || null
  }));

  const mappedData = {
    imageUrl: rest.imageUrl || null,
    status: rest.status || 'draft',
    publishedAt: rest.status === 'published' && !rest.publishedAt
      ? new Date()
      : (rest.publishedAt ? new Date(rest.publishedAt) : null),
    authorId: rest.authorId || null,
    translations: {
      create: translationsWithSlug
    }
  };

  try {
    return await newsRepo.create(mappedData);
  } catch (error) {
    // Unique constraint hatası için özel mesaj
    if (error.code === 'P2002' && error.meta?.target?.includes('slug')) {
      const customError = new Error('Bu slug başka bir haberde kullanılıyor. Lütfen farklı bir başlık girin.');
      customError.statusCode = 400;
      throw customError;
    }
    throw error;
  }
};

const updateNews = async (id, data) => {
  const { translations, ...rest } = data;
  const mappedData = {};

  // Dil-bağımsız alanları güncelle
  if (rest.imageUrl !== undefined) {
    mappedData.imageUrl = rest.imageUrl;
  }

  if (rest.status !== undefined) {
    mappedData.status = rest.status;

    // If changing to published and no publishedAt, set it now
    if (rest.status === 'published' && !rest.publishedAt) {
      mappedData.publishedAt = new Date();
    }
  }

  if (rest.publishedAt !== undefined) {
    mappedData.publishedAt = rest.publishedAt ? new Date(rest.publishedAt) : null;
  }

  // Translations güncelleme (varsa)
  if (translations && translations.length > 0) {
    const translationUpdates = translations.map(trans => ({
      where: {
        newsId_language: {
          newsId: id,
          language: trans.language
        }
      },
      create: {
        language: trans.language,
        title: trans.title,
        slug: trans.slug || generateSlug(trans.title),
        summary: trans.summary || null,
        content: trans.content || null
      },
      update: {
        title: trans.title,
        slug: trans.slug || generateSlug(trans.title),
        summary: trans.summary || null,
        content: trans.content || null
      }
    }));

    mappedData.translations = {
      upsert: translationUpdates
    };
  }

  try {
    return await newsRepo.update(id, mappedData);
  } catch (error) {
    // Unique constraint hatası için özel mesaj
    if (error.code === 'P2002' && error.meta?.target?.includes('slug')) {
      const customError = new Error('Bu slug başka bir haberde kullanılıyor. Lütfen farklı bir başlık girin.');
      customError.statusCode = 400;
      throw customError;
    }
    throw error;
  }
};

const deleteNews = (id) => {
  return newsRepo.deleteById(id);
};

const getPublishedNews = async (queryParams = {}) => {
  const { page, limit, language = 'tr' } = queryParams;
  const { skip, limit: take } = parsePagination(page, limit);

  const where = {
    status: 'published',
    publishedAt: { lte: new Date() }
  };

  const [news, total] = await Promise.all([
    newsRepo.findPublished({ skip, take, language }),
    newsRepo.count(where),
  ]);

  // Format her bir haberi çevirisiyle birlikte
  const formattedNews = news.map(item =>
    formatEntityWithTranslation(item, language, false)
  );

  return createPaginatedResponse(formattedNews, total, parseInt(page) || 1, take);
};

module.exports = {
  getAllNews,
  getNewsById,
  getNewsBySlug,
  createNews,
  updateNews,
  deleteNews,
  getPublishedNews
};
