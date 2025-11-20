const prisma = require('../../../config/prismaClient');
const { includeTranslations } = require('../../../utils/translationHelper');

const findMany = (options = {}) => {
  const { skip, take, where, orderBy, language } = options;

  return prisma.news.findMany({
    skip,
    take,
    where,
    include: {
      author: {
        select: {
          id: true,
          fullName: true,
          email: true
        }
      },
      ...includeTranslations(language)
    },
    orderBy: orderBy || { createdAt: 'desc' }
  });
};

const count = (where = {}) => prisma.news.count({ where });

const findById = (id, language = null) => {
  return prisma.news.findUnique({
    where: { id: parseInt(id) },
    include: {
      author: {
        select: {
          id: true,
          fullName: true,
          email: true
        }
      },
      ...includeTranslations(language)
    }
  });
};

const findBySlug = (slug, language = 'tr') => {
  // Slug artık translation'da, önce translation'ı bulmalıyız
  return prisma.news.findFirst({
    where: {
      translations: {
        some: {
          slug: slug,
          ...(language && { language })
        }
      }
    },
    include: {
      author: {
        select: {
          id: true,
          fullName: true,
          email: true
        }
      },
      ...includeTranslations()
    }
  });
};

const create = (data) => {
  return prisma.news.create({
    data,
    include: {
      author: {
        select: {
          id: true,
          fullName: true,
          email: true
        }
      }
    }
  });
};

const update = (id, data) => {
  return prisma.news.update({
    where: { id: parseInt(id) },
    data,
    include: {
      author: {
        select: {
          id: true,
          fullName: true,
          email: true
        }
      }
    }
  });
};

const deleteById = (id) => {
  return prisma.news.delete({ where: { id: parseInt(id) } });
};

// Get published news for public access
const findPublished = (options = {}) => {
  const { skip, take, language } = options;

  return prisma.news.findMany({
    skip,
    take,
    where: {
      status: 'published',
      publishedAt: {
        lte: new Date()
      }
    },
    include: {
      author: {
        select: {
          id: true,
          fullName: true
        }
      },
      ...includeTranslations(language)
    },
    orderBy: {
      publishedAt: 'desc'
    }
  });
};

// ========== PAGE BUILDER OPERATIONS ==========

const updateBuilderData = async (newsId, language, builderData) => {
  const { builderData: data, builderHtml, builderCss } = builderData;

  // Check if translation exists
  const existingTranslation = await prisma.newsTranslation.findFirst({
    where: {
      newsId: parseInt(newsId),
      language: language,
    },
  });

  if (existingTranslation) {
    // Update existing translation
    return await prisma.newsTranslation.update({
      where: {
        id: existingTranslation.id,
      },
      data: {
        builderData: data,
        builderHtml: builderHtml,
        builderCss: builderCss,
        usePageBuilder: true, // Automatically enable page builder when saving
        updatedAt: new Date(),
      },
    });
  } else {
    // If translation doesn't exist, throw error (translations should be created first)
    throw new Error(`Translation for language '${language}' does not exist for news ${newsId}`);
  }
};

module.exports = {
  findMany,
  count,
  findById,
  findBySlug,
  create,
  update,
  deleteById,
  findPublished,
  updateBuilderData
};
