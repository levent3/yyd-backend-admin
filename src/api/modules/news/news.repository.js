const prisma = require('../../../config/prismaClient');

const findMany = (options = {}) => {
  const { skip, take, where, orderBy } = options;

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
      }
    },
    orderBy: orderBy || { createdAt: 'desc' }
  });
};

const count = (where = {}) => prisma.news.count({ where });

const findById = (id) => {
  return prisma.news.findUnique({
    where: { id },
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

const findBySlug = (slug) => {
  return prisma.news.findUnique({
    where: { slug },
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
  const { skip, take } = options;

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
      }
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
