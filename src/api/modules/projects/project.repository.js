const prisma = require('../../../config/prismaClient');
const { includeTranslations } = require('../../../utils/translationHelper');

const findMany = (options = {}) => {
  const { skip, take, where, orderBy, language } = options;
  return prisma.project.findMany({
    skip,
    take,
    where,
    orderBy: orderBy || { displayOrder: 'asc' },
    // N+1 query problemini önlemek için optimize edilmiş include
    include: {
      author: {
        select: { id: true, fullName: true }
      },
      galleryItems: {
        take: 3, // Liste için sadece ilk 3 görsel yeterli
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          fileUrl: true,
          mediaType: true
        }
      },
      settings: true, // Proje ayarlarını da dahil et (bağış formu için gerekli)
      ...includeTranslations(language)
    }
  });
};

const count = (where = {}) => prisma.project.count({ where });

const findById = (id, language = null) => prisma.project.findUnique({
  where: { id: parseInt(id) },
  include: {
    author: {
      select: { id: true, fullName: true }
    },
    galleryItems: {
      take: 10,
      orderBy: { createdAt: 'desc' }
    },
    settings: true, // Proje ayarlarını da dahil et (bağış formu için gerekli)
    ...includeTranslations(language)
  }
});

const findBySlug = (slug, language = 'tr') => {
  // Slug artık translation'da, önce translation'ı bulmalıyız
  return prisma.project.findFirst({
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
        select: { id: true, fullName: true }
      },
      galleryItems: {
        take: 10,
        orderBy: { createdAt: 'desc' }
      },
      settings: true, // Proje ayarlarını da dahil et (bağış formu için gerekli)
      ...includeTranslations()
    }
  });
};

const findByShortCode = (shortCode, language = 'tr') => {
  // shortCode ana Project tablosunda
  return prisma.project.findUnique({
    where: { shortCode },
    include: {
      author: {
        select: { id: true, fullName: true }
      },
      galleryItems: {
        take: 10,
        orderBy: { createdAt: 'desc' }
      },
      settings: true, // Proje ayarlarını da dahil et (bağış formu için gerekli)
      ...includeTranslations(language)
    }
  });
};

const create = (data) => prisma.project.create({ data });
const update = (id, data) => prisma.project.update({ where: { id: parseInt(id) }, data });
const deleteById = (id) => prisma.project.delete({ where: { id: parseInt(id) } });

// ========== PAGE BUILDER OPERATIONS ==========

const updateBuilderData = async (projectId, language, builderData) => {
  const { builderData: data, builderHtml, builderCss } = builderData;

  // Check if translation exists
  const existingTranslation = await prisma.projectTranslation.findFirst({
    where: {
      projectId: parseInt(projectId),
      language: language,
    },
  });

  if (existingTranslation) {
    // Update existing translation
    return await prisma.projectTranslation.update({
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
    throw new Error(`Translation for language '${language}' does not exist for project ${projectId}`);
  }
};

module.exports = {
  findMany,
  count,
  findById,
  findBySlug,
  findByShortCode,
  create,
  update,
  deleteById,
  updateBuilderData
};
