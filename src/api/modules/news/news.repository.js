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
    where: { id },
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
    where: { id },
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
  return prisma.news.delete({ where: { id } });
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

module.exports = {
  findMany,
  count,
  findById,
  findBySlug,
  create,
  update,
  deleteById,
  findPublished
};
