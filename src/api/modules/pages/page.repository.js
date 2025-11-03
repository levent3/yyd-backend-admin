const prisma = require('../../../config/prismaClient');
const { includeTranslations } = require('../../../utils/translationHelper');

// ========== ADMIN OPERATIONS ==========

const findAll = async (filters = {}) => {
  const where = {};
  const language = filters.language || 'tr';

  // Filters
  if (filters.status) where.status = filters.status;
  if (filters.pageType) where.pageType = filters.pageType;
  if (filters.isActive !== undefined) where.isActive = filters.isActive;
  if (filters.isPublic !== undefined) where.isPublic = filters.isPublic;

  // Search - artık translation'larda arayacağız
  if (filters.search) {
    where.OR = [
      { translations: { some: { title: { contains: filters.search, mode: 'insensitive' } } } },
      { translations: { some: { content: { contains: filters.search, mode: 'insensitive' } } } },
    ];
  }

  const pages = await prisma.page.findMany({
    where,
    include: {
      author: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
      ...includeTranslations(language)
    },
    orderBy: filters.orderBy || { displayOrder: 'asc' },
    skip: filters.skip || 0,
    take: filters.take || 50,
  });

  const total = await prisma.page.count({ where });

  return { pages, total };
};

const findById = (id, language = 'tr') => {
  return prisma.page.findUnique({
    where: { id: parseInt(id) },
    include: {
      author: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
      ...includeTranslations(language)
    },
  });
};

const findBySlug = (slug, language = 'tr') => {
  // Slug artık translation'da, önce translation'ı bulmalıyız
  return prisma.page.findFirst({
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
          email: true,
        },
      },
      ...includeTranslations()
    },
  });
};

const create = (data) => {
  const { generateSlug } = require('../../../utils/translationHelper');

  // translations array: [{ language: 'tr', title: '...', content: '...', ... }]
  const { translations, ...rest } = data;

  if (!translations || translations.length === 0) {
    throw new Error('En az bir çeviri gereklidir');
  }

  // Her bir translation için slug generate et
  const translationsWithSlug = translations.map(trans => ({
    language: trans.language,
    title: trans.title,
    slug: trans.slug || generateSlug(trans.title),
    content: trans.content || null,
    excerpt: trans.excerpt || null,
    metaTitle: trans.metaTitle || null,
    metaDescription: trans.metaDescription || null,
    metaKeywords: trans.metaKeywords || null
  }));

  return prisma.page.create({
    data: {
      pageType: rest.pageType || 'general',
      status: rest.status || 'draft',
      isPublic: rest.isPublic !== undefined ? rest.isPublic : true,
      isActive: rest.isActive !== undefined ? rest.isActive : true,
      displayOrder: parseInt(rest.displayOrder) || 0,
      featuredImage: rest.featuredImage || null,
      publishedAt: rest.status === 'published' ? new Date() : null,
      authorId: rest.authorId || null,
      translations: {
        create: translationsWithSlug
      }
    },
    include: {
      author: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
  });
};

const update = (id, data) => {
  const { generateSlug } = require('../../../utils/translationHelper');
  const { translations, ...rest } = data;

  const updateData = {};

  // Dil-bağımsız alanları güncelle
  if (rest.pageType !== undefined) updateData.pageType = rest.pageType;
  if (rest.status !== undefined) {
    updateData.status = rest.status;
    // If status changed to published, set publishedAt
    if (rest.status === 'published' && !rest.publishedAt) {
      updateData.publishedAt = new Date();
    }
  }
  if (rest.isPublic !== undefined) updateData.isPublic = rest.isPublic;
  if (rest.isActive !== undefined) updateData.isActive = rest.isActive;
  if (rest.displayOrder !== undefined) updateData.displayOrder = parseInt(rest.displayOrder) || 0;
  if (rest.featuredImage !== undefined) updateData.featuredImage = rest.featuredImage;

  // Translations güncelleme (varsa)
  if (translations && translations.length > 0) {
    const translationUpdates = translations.map(trans => ({
      where: {
        pageId_language: {
          pageId: parseInt(id),
          language: trans.language
        }
      },
      create: {
        language: trans.language,
        title: trans.title,
        slug: trans.slug || generateSlug(trans.title),
        content: trans.content || null,
        excerpt: trans.excerpt || null,
        metaTitle: trans.metaTitle || null,
        metaDescription: trans.metaDescription || null,
        metaKeywords: trans.metaKeywords || null
      },
      update: {
        title: trans.title,
        slug: trans.slug || generateSlug(trans.title),
        content: trans.content || null,
        excerpt: trans.excerpt || null,
        metaTitle: trans.metaTitle || null,
        metaDescription: trans.metaDescription || null,
        metaKeywords: trans.metaKeywords || null
      }
    }));

    updateData.translations = {
      upsert: translationUpdates
    };
  }

  return prisma.page.update({
    where: { id: parseInt(id) },
    data: updateData,
    include: {
      author: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
  });
};

const deleteById = (id) => {
  return prisma.page.delete({
    where: { id: parseInt(id) },
  });
};

// ========== PUBLIC OPERATIONS ==========

const findPublic = async (filters = {}) => {
  const where = {
    status: 'published',
    isPublic: true,
    isActive: true,
  };

  const language = filters.language || 'tr';

  if (filters.pageType) where.pageType = filters.pageType;

  const pages = await prisma.page.findMany({
    where,
    include: {
      ...includeTranslations(language)
    },
    orderBy: { displayOrder: 'asc' },
  });

  return pages;
};

const findPublicBySlug = (slug, language = 'tr') => {
  // Slug artık translation'da
  return prisma.page.findFirst({
    where: {
      translations: {
        some: {
          slug: slug,
          ...(language && { language })
        }
      },
      status: 'published',
      isPublic: true,
      isActive: true,
    },
    include: {
      author: {
        select: {
          fullName: true,
        },
      },
      ...includeTranslations()
    },
  });
};

const findPublicByType = (pageType, language = 'tr') => {
  return prisma.page.findMany({
    where: {
      pageType,
      status: 'published',
      isPublic: true,
      isActive: true,
    },
    include: {
      ...includeTranslations(language)
    },
    orderBy: { displayOrder: 'asc' },
  });
};

// ========== PAGE BUILDER OPERATIONS ==========

const updateBuilderData = async (pageId, language, builderData) => {
  const { builderData: data, builderHtml, builderCss } = builderData;

  // Önce translation var mı kontrol et
  const existingTranslation = await prisma.pageTranslation.findFirst({
    where: {
      pageId: parseInt(pageId),
      language: language,
    },
  });

  if (existingTranslation) {
    // Translation varsa güncelle
    return await prisma.pageTranslation.update({
      where: {
        id: existingTranslation.id,
      },
      data: {
        builderData: data || existingTranslation.builderData,
        builderHtml: builderHtml !== undefined ? builderHtml : existingTranslation.builderHtml,
        builderCss: builderCss !== undefined ? builderCss : existingTranslation.builderCss,
      },
    });
  } else {
    // Translation yoksa hata at (çünkü sayfa oluşturulurken translation oluşturulmalı)
    throw { status: 404, message: `Translation for language '${language}' not found` };
  }
};

module.exports = {
  findAll,
  findById,
  findBySlug,
  create,
  update,
  deleteById,
  findPublic,
  findPublicBySlug,
  findPublicByType,
  updateBuilderData,
};
