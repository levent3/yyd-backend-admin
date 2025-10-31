const prisma = require('../../../config/prismaClient');

// ========== DONATION STATISTICS ==========

const getDonationStatistics = async () => {
  const [total, completed, pending, failed, totalAmount, completedAmount, monthlyTotal] =
    await Promise.all([
      // Toplam bağış sayısı
      prisma.donation.count(),

      // Tamamlanan bağış sayısı
      prisma.donation.count({
        where: { paymentStatus: 'completed' },
      }),

      // Bekleyen bağış sayısı
      prisma.donation.count({
        where: { paymentStatus: 'pending' },
      }),

      // Başarısız bağış sayısı
      prisma.donation.count({
        where: { paymentStatus: 'failed' },
      }),

      // Toplam bağış tutarı
      prisma.donation.aggregate({
        _sum: { amount: true },
      }),

      // Tamamlanan bağış tutarı
      prisma.donation.aggregate({
        where: { paymentStatus: 'completed' },
        _sum: { amount: true },
      }),

      // Bu ayki bağış sayısı
      prisma.donation.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
    ]);

  return {
    totalCount: total,
    completedCount: completed,
    pendingCount: pending,
    failedCount: failed,
    totalAmount: totalAmount._sum.amount || 0,
    completedAmount: completedAmount._sum.amount || 0,
    monthlyCount: monthlyTotal,
  };
};

// ========== CAMPAIGN STATISTICS ==========
// NOT: DonationCampaign modeli kaldırıldı, artık kullanılmıyor
// Geriye dönük uyumluluk için boş değerler döndürüyoruz

const getCampaignStatistics = async () => {
  return {
    totalCount: 0,
    activeCount: 0,
    completedCount: 0,
    featuredCount: 0,
  };
};

// ========== DONOR STATISTICS ==========

const getDonorStatistics = async () => {
  const [total, monthlyNew] = await Promise.all([
    prisma.donor.count(),
    prisma.donor.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    }),
  ]);

  return {
    totalCount: total,
    monthlyNewCount: monthlyNew,
  };
};

// ========== PROJECT STATISTICS ==========

const getProjectStatistics = async () => {
  const [total, active, completed] = await Promise.all([
    prisma.project.count(),
    prisma.project.count({ where: { status: 'active' } }),
    prisma.project.count({ where: { status: 'completed' } }),
  ]);

  return {
    totalCount: total,
    activeCount: active,
    completedCount: completed,
  };
};

// ========== VOLUNTEER STATISTICS ==========

const getVolunteerStatistics = async () => {
  const [total, pending, approved] = await Promise.all([
    prisma.volunteer.count(),
    prisma.volunteer.count({ where: { status: 'new' } }),
    prisma.volunteer.count({ where: { status: 'approved' } }),
  ]);

  return {
    totalCount: total,
    pendingCount: pending,
    approvedCount: approved,
  };
};

// ========== CONTACT STATISTICS ==========

const getContactStatistics = async () => {
  const [total, unread] = await Promise.all([
    prisma.contactMessage.count(),
    prisma.contactMessage.count({ where: { status: 'new' } }),
  ]);

  return {
    totalCount: total,
    unreadCount: unread,
  };
};

// ========== DONATION CHART DATA ==========

const getDonationChartData = async (period, limit) => {
  const now = new Date();
  let groupBy;
  let startDate;

  switch (period) {
    case 'daily':
      // Son X gün
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - limit);
      groupBy = 'day';
      break;
    case 'weekly':
      // Son X hafta
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - limit * 7);
      groupBy = 'week';
      break;
    case 'yearly':
      // Son X yıl
      startDate = new Date(now);
      startDate.setFullYear(startDate.getFullYear() - limit);
      groupBy = 'year';
      break;
    case 'monthly':
    default:
      // Son X ay
      startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - limit);
      groupBy = 'month';
      break;
  }

  // Prisma ile gruplandırma
  const donations = await prisma.donation.findMany({
    where: {
      createdAt: { gte: startDate },
      paymentStatus: 'completed',
    },
    select: {
      createdAt: true,
      amount: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  // Manuel gruplama (Prisma'da DATE_TRUNC yok, raw SQL alternatif)
  const grouped = {};

  donations.forEach((donation) => {
    const date = new Date(donation.createdAt);
    let key;

    if (groupBy === 'day') {
      key = date.toISOString().split('T')[0]; // YYYY-MM-DD
    } else if (groupBy === 'week') {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay()); // Haftanın ilk günü
      key = weekStart.toISOString().split('T')[0];
    } else if (groupBy === 'month') {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
    } else if (groupBy === 'year') {
      key = String(date.getFullYear()); // YYYY
    }

    if (!grouped[key]) {
      grouped[key] = { date: key, count: 0, amount: 0 };
    }

    grouped[key].count++;
    grouped[key].amount += donation.amount;
  });

  return Object.values(grouped).slice(-limit);
};

// ========== RECENT DATA ==========

const getRecentDonations = async (limit) => {
  return await prisma.donation.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      project: {
        include: {
          translations: {
            where: { language: 'tr' },
            take: 1
          }
        }
      },
      donor: { select: { fullName: true } },
    },
  });
};

const getRecentVolunteers = async (limit) => {
  return await prisma.volunteer.findMany({
    take: limit,
    orderBy: { submittedAt: 'desc' },
  });
};

const getRecentContacts = async (limit) => {
  return await prisma.contactMessage.findMany({
    take: limit,
    orderBy: { submittedAt: 'desc' },
  });
};

// ========== TOP CAMPAIGNS ==========
// NOT: DonationCampaign yerine artık Project kullanıyoruz

const getTopCampaigns = async (limit) => {
  return await prisma.project.findMany({
    take: limit,
    where: { isActive: true },
    orderBy: { collectedAmount: 'desc' },
    include: {
      translations: {
        where: { language: 'tr' },
        take: 1
      },
      _count: {
        select: { donations: true },
      },
    },
  });
};

// ========== TOP DONORS ==========

const getTopDonors = async (limit) => {
  // Prisma ile aggregate by donorId
  const topDonors = await prisma.donation.groupBy({
    by: ['donorId'],
    where: {
      paymentStatus: 'completed',
      donorId: { not: null },
    },
    _sum: { amount: true },
    _count: { id: true },
    orderBy: { _sum: { amount: 'desc' } },
    take: limit,
  });

  // Donor bilgilerini çek
  const donorIds = topDonors.map((d) => d.donorId);
  const donors = await prisma.donor.findMany({
    where: { id: { in: donorIds } },
  });

  // Merge data
  return topDonors.map((td) => {
    const donor = donors.find((d) => d.id === td.donorId);
    return {
      donor,
      totalAmount: td._sum.amount,
      totalDonations: td._count.id,
    };
  });
};

module.exports = {
  getDonationStatistics,
  getCampaignStatistics,
  getDonorStatistics,
  getProjectStatistics,
  getVolunteerStatistics,
  getContactStatistics,
  getDonationChartData,
  getRecentDonations,
  getRecentVolunteers,
  getRecentContacts,
  getTopCampaigns,
  getTopDonors,
};
