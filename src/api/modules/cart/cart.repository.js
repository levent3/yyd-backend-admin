const prisma = require('../../../config/prismaClient');

const findMany = (options = {}) => {
  const { skip, take, where, orderBy } = options;
  return prisma.cartItem.findMany({
    skip,
    take,
    where,
    include: {
      campaign: true
    },
    orderBy: orderBy || { createdAt: 'desc' }
  });
};

const count = (where = {}) => {
  return prisma.cartItem.count({ where });
};

const findById = (id) => {
  return prisma.cartItem.findUnique({
    where: { id },
    include: {
      campaign: true
    }
  });
};

const create = (data) => {
  return prisma.cartItem.create({
    data,
    include: {
      campaign: true
    }
  });
};

const update = (id, data) => {
  return prisma.cartItem.update({
    where: { id },
    data,
    include: {
      campaign: true
    }
  });
};

const deleteById = (id) => {
  return prisma.cartItem.delete({ where: { id } });
};

// Get cart items by session ID
const findBySessionId = (sessionId) => {
  return prisma.cartItem.findMany({
    where: { sessionId },
    include: {
      campaign: true
    },
    orderBy: { createdAt: 'desc' }
  });
};

// Get cart items by campaign
const findByCampaignId = (campaignId) => {
  return prisma.cartItem.findMany({
    where: { campaignId },
    orderBy: { createdAt: 'desc' }
  });
};

// Delete all items in a session's cart
const deleteBySessionId = (sessionId) => {
  return prisma.cartItem.deleteMany({
    where: { sessionId }
  });
};

// Delete expired cart items
const deleteExpired = () => {
  const now = new Date();
  return prisma.cartItem.deleteMany({
    where: {
      expiresAt: {
        lte: now
      }
    }
  });
};

// Get cart total by session
const getCartTotal = async (sessionId) => {
  const result = await prisma.cartItem.aggregate({
    where: { sessionId },
    _sum: {
      amount: true
    },
    _count: {
      id: true
    }
  });

  return {
    totalAmount: result._sum.amount || 0,
    itemCount: result._count.id || 0
  };
};

// Check if cart item exists for session and campaign
const findBySessionAndCampaign = (sessionId, campaignId) => {
  return prisma.cartItem.findFirst({
    where: {
      sessionId,
      campaignId
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
  findBySessionId,
  findByCampaignId,
  deleteBySessionId,
  deleteExpired,
  getCartTotal,
  findBySessionAndCampaign
};
