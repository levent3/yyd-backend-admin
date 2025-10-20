const prisma = require('../../../config/prismaClient');

// ========== ADMIN OPERATIONS ==========

const findAll = async (filters = {}) => {
  const where = {};

  // Filters
  if (filters.status) where.status = filters.status;
  if (filters.pageType) where.pageType = filters.pageType;
  if (filters.isActive !== undefined) where.isActive = filters.isActive;
  if (filters.isPublic !== undefined) where.isPublic = filters.isPublic;

  // Search
  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { slug: { contains: filters.search, mode: 'insensitive' } },
      { content: { contains: filters.search, mode: 'insensitive' } },
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
    },
    orderBy: filters.orderBy || { displayOrder: 'asc' },
    skip: filters.skip || 0,
    take: filters.take || 50,
  });

  const total = await prisma.page.count({ where });

  return { pages, total };
};

const findById = (id) => {
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
    },
  });
};

const findBySlug = (slug) => {
  return prisma.page.findUnique({
    where: { slug },
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

const create = (data) => {
  return prisma.page.create({
    data: {
      title: data.title,
      slug: data.slug,
      content: data.content || null,
      excerpt: data.excerpt || null,
      metaTitle: data.metaTitle || null,
      metaDescription: data.metaDescription || null,
      metaKeywords: data.metaKeywords || null,
      pageType: data.pageType || 'general',
      status: data.status || 'draft',
      isPublic: data.isPublic !== undefined ? data.isPublic : true,
      isActive: data.isActive !== undefined ? data.isActive : true,
      displayOrder: data.displayOrder || 0,
      featuredImage: data.featuredImage || null,
      publishedAt: data.status === 'published' ? new Date() : null,
      authorId: data.authorId || null,
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
  const updateData = {};

  if (data.title !== undefined) updateData.title = data.title;
  if (data.slug !== undefined) updateData.slug = data.slug;
  if (data.content !== undefined) updateData.content = data.content;
  if (data.excerpt !== undefined) updateData.excerpt = data.excerpt;
  if (data.metaTitle !== undefined) updateData.metaTitle = data.metaTitle;
  if (data.metaDescription !== undefined) updateData.metaDescription = data.metaDescription;
  if (data.metaKeywords !== undefined) updateData.metaKeywords = data.metaKeywords;
  if (data.pageType !== undefined) updateData.pageType = data.pageType;
  if (data.status !== undefined) {
    updateData.status = data.status;
    // If status changed to published, set publishedAt
    if (data.status === 'published' && !data.publishedAt) {
      updateData.publishedAt = new Date();
    }
  }
  if (data.isPublic !== undefined) updateData.isPublic = data.isPublic;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;
  if (data.displayOrder !== undefined) updateData.displayOrder = data.displayOrder;
  if (data.featuredImage !== undefined) updateData.featuredImage = data.featuredImage;

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

  if (filters.pageType) where.pageType = filters.pageType;

  const pages = await prisma.page.findMany({
    where,
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      pageType: true,
      displayOrder: true,
      featuredImage: true,
      publishedAt: true,
    },
    orderBy: { displayOrder: 'asc' },
  });

  return pages;
};

const findPublicBySlug = (slug) => {
  return prisma.page.findFirst({
    where: {
      slug,
      status: 'published',
      isPublic: true,
      isActive: true,
    },
    select: {
      id: true,
      title: true,
      slug: true,
      content: true,
      excerpt: true,
      metaTitle: true,
      metaDescription: true,
      metaKeywords: true,
      pageType: true,
      featuredImage: true,
      publishedAt: true,
      author: {
        select: {
          fullName: true,
        },
      },
    },
  });
};

const findPublicByType = (pageType) => {
  return prisma.page.findMany({
    where: {
      pageType,
      status: 'published',
      isPublic: true,
      isActive: true,
    },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      displayOrder: true,
      featuredImage: true,
      publishedAt: true,
    },
    orderBy: { displayOrder: 'asc' },
  });
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
};
