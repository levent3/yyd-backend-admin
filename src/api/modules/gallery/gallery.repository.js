const prisma = require('../../../config/prismaClient');

const findMany = (options = {}) => {
  const { skip, take, where, orderBy } = options;
  return prisma.galleryItem.findMany({
    skip,
    take,
    where,
    include: {
      project: {
        select: {
          id: true,
          translations: {
            where: {
              language: 'tr' // Default Turkish translation
            },
            select: {
              title: true,
              slug: true
            }
          }
        }
      },
      uploader: {
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

const count = (where = {}) => {
  return prisma.galleryItem.count({ where });
};

const findById = (id) => {
  return prisma.galleryItem.findUnique({
    where: { id },
    include: {
      project: {
        select: {
          id: true,
          translations: {
            where: {
              language: 'tr'
            },
            select: {
              title: true,
              slug: true
            }
          }
        }
      },
      uploader: {
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
  return prisma.galleryItem.create({
    data,
    include: {
      project: {
        select: {
          id: true,
          translations: {
            where: {
              language: 'tr'
            },
            select: {
              title: true,
              slug: true
            }
          }
        }
      },
      uploader: {
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
  return prisma.galleryItem.update({
    where: { id },
    data,
    include: {
      project: {
        select: {
          id: true,
          title: true,
          slug: true
        }
      },
      uploader: {
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
  return prisma.galleryItem.delete({ where: { id } });
};

// Get public gallery items (for public website)
const findPublic = (filters = {}) => {
  const where = {};

  if (filters.mediaType) {
    where.mediaType = filters.mediaType;
  }

  if (filters.projectId) {
    where.projectId = parseInt(filters.projectId);
  }

  return prisma.galleryItem.findMany({
    where,
    include: {
      project: {
        select: {
          id: true,
          translations: {
            where: {
              language: 'tr'
            },
            select: {
              title: true,
              slug: true
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
};

module.exports = {
  findMany,
  count,
  findById,
  create,
  update,
  deleteById,
  findPublic
};
