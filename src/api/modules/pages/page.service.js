const pageRepository = require('./page.repository');

// ========== ADMIN SERVICES ==========

const getAllPages = async (filters) => {
  return await pageRepository.findAll(filters);
};

const getPageById = async (id) => {
  const page = await pageRepository.findById(id);
  if (!page) {
    throw { status: 404, message: 'Page not found' };
  }
  return page;
};

const getPageBySlug = async (slug) => {
  const page = await pageRepository.findBySlug(slug);
  if (!page) {
    throw { status: 404, message: 'Page not found' };
  }
  return page;
};

const createPage = async (data, userId) => {
  // Validate required fields
  if (!data.title) {
    throw { status: 400, message: 'Page title is required' };
  }
  if (!data.slug) {
    throw { status: 400, message: 'Page slug is required' };
  }

  // Check if slug already exists
  const existingPage = await pageRepository.findBySlug(data.slug);
  if (existingPage) {
    throw { status: 409, message: 'A page with this slug already exists' };
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

  // If slug is being updated, check for duplicates
  if (data.slug && data.slug !== page.slug) {
    const existingPage = await pageRepository.findBySlug(data.slug);
    if (existingPage) {
      throw { status: 409, message: 'A page with this slug already exists' };
    }
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
  return await pageRepository.findPublic(filters);
};

const getPublicPageBySlug = async (slug) => {
  const page = await pageRepository.findPublicBySlug(slug);
  if (!page) {
    throw { status: 404, message: 'Page not found' };
  }
  return page;
};

const getPublicPagesByType = async (pageType) => {
  return await pageRepository.findPublicByType(pageType);
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
};
