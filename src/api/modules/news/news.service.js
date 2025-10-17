const newsRepo = require('./news.repository');
const { parsePagination, createPaginatedResponse } = require('../../../utils/pagination');

// Helper function to generate slug from title
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

const getAllNews = async (queryParams = {}) => {
  const { page, limit, status, authorId } = queryParams;
  const { skip, limit: take } = parsePagination(page, limit);

  // Build where clause
  const where = {};
  if (status) where.status = status;
  if (authorId) where.authorId = parseInt(authorId);

  const [news, total] = await Promise.all([
    newsRepo.findMany({ skip, take, where }),
    newsRepo.count(where),
  ]);

  return createPaginatedResponse(news, total, parseInt(page) || 1, take);
};

const getNewsById = (id) => {
  return newsRepo.findById(id);
};

const getNewsBySlug = (slug) => {
  return newsRepo.findBySlug(slug);
};

const createNews = (data) => {
  const mappedData = {
    title: data.title,
    slug: data.slug || generateSlug(data.title),
    summary: data.summary || null,
    content: data.content || null,
    imageUrl: data.imageUrl || null,
    status: data.status || 'draft',
    publishedAt: data.status === 'published' && !data.publishedAt ? new Date() : (data.publishedAt ? new Date(data.publishedAt) : null),
    authorId: data.authorId
  };

  return newsRepo.create(mappedData);
};

const updateNews = (id, data) => {
  const mappedData = {};

  if (data.title !== undefined) {
    mappedData.title = data.title;
    mappedData.slug = data.slug || generateSlug(data.title);
  }

  if (data.summary !== undefined) {
    mappedData.summary = data.summary;
  }

  if (data.content !== undefined) {
    mappedData.content = data.content;
  }

  if (data.imageUrl !== undefined) {
    mappedData.imageUrl = data.imageUrl;
  }

  if (data.status !== undefined) {
    mappedData.status = data.status;

    // If changing to published and no publishedAt, set it now
    if (data.status === 'published' && !data.publishedAt) {
      mappedData.publishedAt = new Date();
    }
  }

  if (data.publishedAt !== undefined) {
    mappedData.publishedAt = data.publishedAt ? new Date(data.publishedAt) : null;
  }

  return newsRepo.update(id, mappedData);
};

const deleteNews = (id) => {
  return newsRepo.deleteById(id);
};

const getPublishedNews = async (queryParams = {}) => {
  const { page, limit } = queryParams;
  const { skip, limit: take } = parsePagination(page, limit);

  const where = {
    status: 'published',
    publishedAt: { lte: new Date() }
  };

  const [news, total] = await Promise.all([
    newsRepo.findPublished({ skip, take }),
    newsRepo.count(where),
  ]);

  return createPaginatedResponse(news, total, parseInt(page) || 1, take);
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
