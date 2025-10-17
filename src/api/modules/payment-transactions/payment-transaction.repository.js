const prisma = require('../../../config/prismaClient');

const findMany = (options = {}) => {
  const { skip, take, where, orderBy } = options;
  return prisma.paymentTransaction.findMany({
    skip,
    take,
    where,
    include: {
      donation: {
        include: {
          donor: true,
          campaign: true
        }
      },
      recurringDonation: {
        include: {
          donor: true,
          campaign: true
        }
      }
    },
    orderBy: orderBy || { createdAt: 'desc' }
  });
};

const count = (where = {}) => {
  return prisma.paymentTransaction.count({ where });
};

const findById = (id) => {
  return prisma.paymentTransaction.findUnique({
    where: { id },
    include: {
      donation: {
        include: {
          donor: true,
          campaign: true
        }
      },
      recurringDonation: {
        include: {
          donor: true,
          campaign: true
        }
      }
    }
  });
};

const create = (data) => {
  return prisma.paymentTransaction.create({
    data,
    include: {
      donation: true,
      recurringDonation: true
    }
  });
};

const update = (id, data) => {
  return prisma.paymentTransaction.update({
    where: { id },
    data,
    include: {
      donation: true,
      recurringDonation: true
    }
  });
};

const deleteById = (id) => {
  return prisma.paymentTransaction.delete({ where: { id } });
};

// Get transactions by donation
const findByDonationId = (donationId) => {
  return prisma.paymentTransaction.findMany({
    where: { donationId },
    orderBy: { createdAt: 'desc' }
  });
};

// Get transactions by recurring donation
const findByRecurringDonationId = (recurringDonationId) => {
  return prisma.paymentTransaction.findMany({
    where: { recurringDonationId },
    orderBy: { createdAt: 'desc' }
  });
};

// Get transactions by payment gateway
const findByPaymentGateway = (gateway) => {
  return prisma.paymentTransaction.findMany({
    where: { paymentGateway: gateway },
    orderBy: { createdAt: 'desc' },
    take: 100
  });
};

// Get failed transactions
const getFailedTransactions = (limit = 50) => {
  return prisma.paymentTransaction.findMany({
    where: {
      status: 'failed'
    },
    include: {
      donation: {
        include: {
          donor: true
        }
      },
      recurringDonation: {
        include: {
          donor: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: limit
  });
};

// Get pending transactions
const getPendingTransactions = () => {
  return prisma.paymentTransaction.findMany({
    where: {
      status: 'pending'
    },
    include: {
      donation: true,
      recurringDonation: true
    },
    orderBy: { createdAt: 'asc' }
  });
};

// Get statistics
const getStatistics = async (startDate, endDate) => {
  const where = {};

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }

  const [total, success, failed, pending] = await Promise.all([
    prisma.paymentTransaction.count({ where }),
    prisma.paymentTransaction.count({ where: { ...where, status: 'success' } }),
    prisma.paymentTransaction.count({ where: { ...where, status: 'failed' } }),
    prisma.paymentTransaction.count({ where: { ...where, status: 'pending' } })
  ]);

  const totalAmount = await prisma.paymentTransaction.aggregate({
    where: { ...where, status: 'success' },
    _sum: {
      amount: true
    }
  });

  const averageAmount = await prisma.paymentTransaction.aggregate({
    where: { ...where, status: 'success' },
    _avg: {
      amount: true
    }
  });

  return {
    total,
    success,
    failed,
    pending,
    successRate: total > 0 ? ((success / total) * 100).toFixed(2) : 0,
    totalAmount: totalAmount._sum.amount || 0,
    averageAmount: averageAmount._avg.amount || 0
  };
};

// Get statistics by gateway
const getStatisticsByGateway = async () => {
  const gateways = await prisma.paymentTransaction.groupBy({
    by: ['paymentGateway'],
    _count: {
      id: true
    },
    _sum: {
      amount: true
    },
    where: {
      status: 'success'
    }
  });

  return gateways.map(gateway => ({
    gateway: gateway.paymentGateway,
    count: gateway._count.id,
    totalAmount: gateway._sum.amount || 0
  }));
};

module.exports = {
  findMany,
  count,
  findById,
  create,
  update,
  deleteById,
  findByDonationId,
  findByRecurringDonationId,
  findByPaymentGateway,
  getFailedTransactions,
  getPendingTransactions,
  getStatistics,
  getStatisticsByGateway
};
