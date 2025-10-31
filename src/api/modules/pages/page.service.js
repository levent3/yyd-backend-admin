const pageRepository = require('./page.repository');
const { formatEntityWithTranslation } = require('../../../utils/translationHelper');

// ========== ADMIN SERVICES ==========

const getAllPages = async (filters) => {
  const language = filters.language || 'tr';
  const result = await pageRepository.findAll(filters);

  // Format her bir sayfayı çevirisiyle birlikte
  const formattedPages = result.pages.map(page =>
    formatEntityWithTranslation(page, language, false)
  );

  return {
    pages: formattedPages,
    total: result.total
  };
};

const getPageById = async (id, language = 'tr') => {
  const page = await pageRepository.findById(id, language);
  if (!page) {
    throw { status: 404, message: 'Page not found' };
  }
  return formatEntityWithTranslation(page, language, true);
};

const getPageBySlug = async (slug, language = 'tr') => {
  const page = await pageRepository.findBySlug(slug, language);
  if (!page) {
    throw { status: 404, message: 'Page not found' };
  }
  return formatEntityWithTranslation(page, language, true);
};

const createPage = async (data, userId) => {
  // Validate required fields
  if (!data.translations || data.translations.length === 0) {
    throw { status: 400, message: 'En az bir çeviri gereklidir' };
  }

  // Add author ID
  data.authorId = userId;

  return await pageRepository.create(data);
};

const updatePage = async (id, data) => {
  // Check if page exists
  const page = await pageRepository.findById(id);
  if (!page) {
    throw { status: 404, message: 'Page not found' };
  }

  return await pageRepository.update(id, data);
};

const deletePage = async (id) => {
  // Check if page exists
  const page = await pageRepository.findById(id);
  if (!page) {
    throw { status: 404, message: 'Page not found' };
  }

  return await pageRepository.deleteById(id);
};

// ========== PUBLIC SERVICES ==========

const getPublicPages = async (filters) => {
  const language = filters.language || 'tr';
  const pages = await pageRepository.findPublic(filters);

  // Format her bir sayfayı çevirisiyle birlikte
  return pages.map(page => formatEntityWithTranslation(page, language, false));
};

const getPublicPageBySlug = async (slug, language = 'tr') => {
  const page = await pageRepository.findPublicBySlug(slug, language);
  if (!page) {
    throw { status: 404, message: 'Page not found' };
  }
  return formatEntityWithTranslation(page, language, true);
};

const getPublicPagesByType = async (pageType, language = 'tr') => {
  const pages = await pageRepository.findPublicByType(pageType, language);

  // Format her bir sayfayı çevirisiyle birlikte
  return pages.map(page => formatEntityWithTranslation(page, language, false));
};

// ========== PAGE BUILDER SERVICES ==========

const updateBuilderData = async (id, language, builderData) => {
  // Check if page exists
  const page = await pageRepository.findById(id);
  if (!page) {
    throw { status: 404, message: 'Page not found' };
  }

  // Update builder data for specific language translation
  return await pageRepository.updateBuilderData(id, language, builderData);
};

const getBuilderData = async (id, language = 'tr') => {
  const page = await pageRepository.findById(id, language);
  if (!page) {
    throw { status: 404, message: 'Page not found' };
  }

  // Return builder data from translation
  const translation = page.translations.find(t => t.language === language);
  return {
    builderData: translation?.builderData || null,
    builderHtml: translation?.builderHtml || null,
    builderCss: translation?.builderCss || null,
  };
};

module.exports = {
  getAllPages,
  getPageById,
  getPageBySlug,
  createPage,
  updatePage,
  deletePage,
  getPublicPages,
  getPublicPageBySlug,
  getPublicPagesByType,
  updateBuilderData,
  getBuilderData,
};
