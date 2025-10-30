const successStoryRepo = require('./success-story.repository');
const { parsePagination, createPaginatedResponse } = require('../../../utils/pagination');
const { formatEntityWithTranslation } = require('../../../utils/translationHelper');

const getAllSuccessStories = async (queryParams = {}) => {
  const { page, limit, location, projectId, campaignId, isActive, isFeatured, language } = queryParams;
  const { skip, limit: take } = parsePagination(page, limit);

  const where = {};
  if (location) where.location = location;
  if (projectId) where.projectId = parseInt(projectId);
  if (campaignId) where.campaignId = parseInt(campaignId);
  if (isActive !== undefined) where.isActive = isActive === 'true';
  if (isFeatured !== undefined) where.isFeatured = isFeatured === 'true';

  const [stories, total] = await Promise.all([
    successStoryRepo.findMany({ skip, take, where }),
    successStoryRepo.count(where),
  ]);

  const formattedStories = stories.map(story => formatEntityWithTranslation(story, language));
  return createPaginatedResponse(formattedStories, total, parseInt(page) || 1, take);
};

const getSuccessStoryById = async (id, language) => {
  const story = await successStoryRepo.findById(id);
  if (!story) {
    const error = new Error('Başarı hikayesi bulunamadı');
    error.statusCode = 404;
    throw error;
  }
  return formatEntityWithTranslation(story, language);
};

const getSuccessStoryBySlug = async (slug, language) => {
  const story = await successStoryRepo.findBySlug(slug, language);
  if (!story) {
    const error = new Error('Başarı hikayesi bulunamadı');
    error.statusCode = 404;
    throw error;
  }
  return formatEntityWithTranslation(story, language);
};

const createSuccessStory = async (data) => {
  const { translations, images, ...storyData } = data;

  const mappedData = {
    coverImage: storyData.coverImage || null,
    images: images || null,
    location: storyData.location || null,
    country: storyData.country || null,
    projectId: storyData.projectId ? parseInt(storyData.projectId) : null,
    campaignId: storyData.campaignId ? parseInt(storyData.campaignId) : null,
    isActive: storyData.isActive !== undefined ? storyData.isActive : true,
    isFeatured: storyData.isFeatured !== undefined ? storyData.isFeatured : false,
    displayOrder: storyData.displayOrder ? parseInt(storyData.displayOrder) : 0,
    publishedAt: storyData.publishedAt ? new Date(storyData.publishedAt).toISOString() : null
  };

  if (translations && Array.isArray(translations)) {
    mappedData.translations = {
      create: translations.map(t => ({
        language: t.language,
        title: t.title,
        slug: t.slug,
        summary: t.summary || null,
        content: t.content || null,
        metaTitle: t.metaTitle || null,
        metaDescription: t.metaDescription || null
      }))
    };
  }

  return await successStoryRepo.create(mappedData);
};

const updateSuccessStory = async (id, data) => {
  await getSuccessStoryById(id);

  const { translations, images, ...storyData } = data;
  const mappedData = {};

  if (storyData.coverImage !== undefined) mappedData.coverImage = storyData.coverImage;
  if (images !== undefined) mappedData.images = images;
  if (storyData.location !== undefined) mappedData.location = storyData.location;
  if (storyData.country !== undefined) mappedData.country = storyData.country;
  if (storyData.projectId !== undefined) mappedData.projectId = storyData.projectId ? parseInt(storyData.projectId) : null;
  if (storyData.campaignId !== undefined) mappedData.campaignId = storyData.campaignId ? parseInt(storyData.campaignId) : null;
  if (storyData.isActive !== undefined) mappedData.isActive = storyData.isActive;
  if (storyData.isFeatured !== undefined) mappedData.isFeatured = storyData.isFeatured;
  if (storyData.displayOrder !== undefined) mappedData.displayOrder = parseInt(storyData.displayOrder);
  if (storyData.publishedAt !== undefined) {
    mappedData.publishedAt = storyData.publishedAt
      ? new Date(storyData.publishedAt).toISOString()
      : null;
  }

  if (translations && Array.isArray(translations)) {
    mappedData.translations = {
      deleteMany: {},
      create: translations.map(t => ({
        language: t.language,
        title: t.title,
        slug: t.slug,
        summary: t.summary || null,
        content: t.content || null,
        metaTitle: t.metaTitle || null,
        metaDescription: t.metaDescription || null
      }))
    };
  }

  return await successStoryRepo.update(id, mappedData);
};

const deleteSuccessStory = async (id) => {
  await getSuccessStoryById(id);
  return await successStoryRepo.deleteById(id);
};

const getSuccessStoriesByLocation = async (location, language) => {
  const stories = await successStoryRepo.findActiveByLocation(location);
  return stories.map(story => formatEntityWithTranslation(story, language));
};

const getAllActiveSuccessStories = async (language) => {
  const stories = await successStoryRepo.findAllActive();
  return stories.map(story => formatEntityWithTranslation(story, language));
};

const getFeaturedSuccessStories = async (language) => {
  const stories = await successStoryRepo.findFeatured();
  return stories.map(story => formatEntityWithTranslation(story, language));
};

module.exports = {
  getAllSuccessStories,
  getSuccessStoryById,
  getSuccessStoryBySlug,
  createSuccessStory,
  updateSuccessStory,
  deleteSuccessStory,
  getSuccessStoriesByLocation,
  getAllActiveSuccessStories,
  getFeaturedSuccessStories
};
