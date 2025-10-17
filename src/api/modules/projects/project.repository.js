const prisma = require('../../../config/prismaClient');

const findMany = (options = {}) => {
  const { skip, take, where, orderBy } = options;
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
      donationCampaigns: {
        take: 2, // Liste için sadece ilk 2 kampanya
        where: { isActive: true },
        select: {
          id: true,
          title: true,
          slug: true,
          targetAmount: true,
          collectedAmount: true
        }
      }
    }
  });
};

const count = (where = {}) => prisma.project.count({ where });

const findById = (id) => prisma.project.findUnique({
  where: { id },
  include: {
    author: {
      select: { id: true, fullName: true }
    },
    galleryItems: {
      take: 10,
      orderBy: { createdAt: 'desc' }
    },
    donationCampaigns: {
      where: { isActive: true }
    }
  }
});

const findBySlug = (slug) => prisma.project.findUnique({
  where: { slug },
  include: {
    author: {
      select: { id: true, fullName: true }
    },
    galleryItems: {
      take: 10,
      orderBy: { createdAt: 'desc' }
    },
    donationCampaigns: {
      where: { isActive: true }
    }
  }
});

const create = (data) => prisma.project.create({ data });
const update = (id, data) => prisma.project.update({ where: { id }, data });
const deleteById = (id) => prisma.project.delete({ where: { id } });

module.exports = { findMany, count, findById, findBySlug, create, update, deleteById };