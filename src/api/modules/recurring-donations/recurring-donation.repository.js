const prisma = require('../../../config/prismaClient');

const findMany = (options = {}) => {
  const { skip, take, where, orderBy } = options;
  return prisma.recurringDonation.findMany({
    skip,
    take,
    where,
    include: {
      donor: true,
      campaign: true,
      paymentTransactions: {
        orderBy: { createdAt: 'desc' },
        take: 5 // Son 5 işlemi göster
      }
    },
    orderBy: orderBy || { createdAt: 'desc' }
  });
};

const count = (where = {}) => {
  return prisma.recurringDonation.count({ where });
};

const findById = (id) => {
  return prisma.recurringDonation.findUnique({
    where: { id },
    include: {
      donor: true,
      campaign: true,
      paymentTransactions: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });
};

const create = (data) => {
  return prisma.recurringDonation.create({
    data,
    include: {
      donor: true,
      campaign: true
    }
  });
};

const update = (id, data) => {
  return prisma.recurringDonation.update({
    where: { id },
    data,
    include: {
      donor: true,
      campaign: true
    }
  });
};

const deleteById = (id) => {
  return prisma.recurringDonation.delete({ where: { id } });
};

// Get active recurring donations
const getActiveRecurringDonations = () => {
  return prisma.recurringDonation.findMany({
    where: { status: 'active' },
    include: {
      donor: true,
      campaign: true
    },
    orderBy: { nextPaymentDate: 'asc' }
  });
};

// Get recurring donations by donor
const findByDonorId = (donorId) => {
  return prisma.recurringDonation.findMany({
    where: { donorId },
    include: {
      campaign: true,
      paymentTransactions: {
        orderBy: { createdAt: 'desc' },
        take: 10
      }
    },
    orderBy: { createdAt: 'desc' }
  });
};

// Get recurring donations by campaign
const findByCampaignId = (campaignId) => {
  return prisma.recurringDonation.findMany({
    where: { campaignId },
    include: {
      donor: true
    },
    orderBy: { createdAt: 'desc' }
  });
};

// Get due recurring donations (payment date is today or past)
const getDueRecurringDonations = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return prisma.recurringDonation.findMany({
    where: {
      status: 'active',
      nextPaymentDate: {
        lte: today
      }
    },
    include: {
      donor: true,
      campaign: true
    },
    orderBy: { nextPaymentDate: 'asc' }
  });
};

// Update next payment date
const updateNextPaymentDate = async (id, nextDate) => {
  return prisma.recurringDonation.update({
    where: { id },
    data: {
      nextPaymentDate: nextDate,
      lastPaymentDate: new Date(),
      totalPaymentsMade: {
        increment: 1
      }
    }
  });
};

// Increment failed attempts
const incrementFailedAttempts = async (id, failureReason) => {
  return prisma.recurringDonation.update({
    where: { id },
    data: {
      failedAttempts: {
        increment: 1
      },
      lastFailureReason: failureReason
    }
  });
};

// Reset failed attempts
const resetFailedAttempts = async (id) => {
  return prisma.recurringDonation.update({
    where: { id },
    data: {
      failedAttempts: 0,
      lastFailureReason: null
    }
  });
};

// Get statistics
const getStatistics = async () => {
  const [total, active, paused, cancelled] = await Promise.all([
    prisma.recurringDonation.count(),
    prisma.recurringDonation.count({ where: { status: 'active' } }),
    prisma.recurringDonation.count({ where: { status: 'paused' } }),
    prisma.recurringDonation.count({ where: { status: 'cancelled' } })
  ]);

  const totalMonthlyAmount = await prisma.recurringDonation.aggregate({
    where: {
      status: 'active',
      frequency: 'monthly'
    },
    _sum: {
      amount: true
    }
  });

  return {
    total,
    active,
    paused,
    cancelled,
    totalMonthlyAmount: totalMonthlyAmount._sum.amount || 0
  };
};

module.exports = {
  findMany,
  count,
  findById,
  create,
  update,
  deleteById,
  getActiveRecurringDonations,
  findByDonorId,
  findByCampaignId,
  getDueRecurringDonations,
  updateNextPaymentDate,
  incrementFailedAttempts,
  resetFailedAttempts,
  getStatistics
};
