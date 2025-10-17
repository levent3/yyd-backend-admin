const prisma = require('../../../config/prismaClient');

// ========== DONATIONS ==========

const findMany = (options = {}) => {
  const { skip, take, where, orderBy } = options;
  return prisma.donation.findMany({
    skip,
    take,
    where,
    include: {
      donor: true,
      campaign: true,
      paymentTransactions: {
        orderBy: { createdAt: 'desc' },
        take: 5
      }
    },
    orderBy: orderBy || { createdAt: 'desc' },
  });
};

const count = (where = {}) => {
  return prisma.donation.count({ where });
};

const getAllDonations = (filters = {}) => {
  const where = {};

  if (filters.status) where.paymentStatus = filters.status;
  if (filters.paymentMethod) where.paymentMethod = filters.paymentMethod;
  if (filters.campaignId) where.campaignId = parseInt(filters.campaignId);
  if (filters.donorId) where.donorId = parseInt(filters.donorId);

  return prisma.donation.findMany({
    where,
    include: {
      donor: true,
      campaign: true,
      paymentTransactions: {
        orderBy: { createdAt: 'desc' },
        take: 3
      }
    },
    orderBy: { createdAt: 'desc' },
  });
};

const getDonationById = (id) => {
  return prisma.donation.findUnique({
    where: { id },
    include: {
      donor: true,
      campaign: true,
      paymentTransactions: {
        orderBy: { createdAt: 'desc' }
      }
    },
  });
};

const createDonation = (data) => {
  return prisma.donation.create({
    data: {
      amount: data.amount,
      currency: data.currency || 'TRY',
      paymentMethod: data.paymentMethod,
      paymentStatus: data.paymentStatus || 'pending',
      transactionId: data.transactionId,
      paymentGateway: data.paymentGateway,
      gatewayResponse: data.gatewayResponse,
      donorName: data.donorName,
      donorEmail: data.donorEmail,
      donorPhone: data.donorPhone,
      message: data.message,
      isAnonymous: data.isAnonymous || false,
      receiptUrl: data.receiptUrl,
      installment: data.installment || 1,
      repeatCount: data.repeatCount || 1,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      donorId: data.donorId,
      campaignId: data.campaignId,
      // Yeni field'lar - Adanmış Bağış
      isDedicated: data.isDedicated || false,
      dedicatedTo: data.dedicatedTo || null,
      dedicationType: data.dedicationType || null,
      dedicationMessage: data.dedicationMessage || null,
      // SMS Bağış
      smsShortCode: data.smsShortCode || null,
      smsKeyword: data.smsKeyword || null,
    },
    include: {
      donor: true,
      campaign: true,
    },
  });
};

const updateDonation = (id, data) => {
  // Sadece gönderilen field'ları güncelle
  const updateData = {};

  // Payment fields
  if (data.paymentStatus !== undefined) updateData.paymentStatus = data.paymentStatus;
  if (data.transactionId !== undefined) updateData.transactionId = data.transactionId;
  if (data.paymentGateway !== undefined) updateData.paymentGateway = data.paymentGateway;
  if (data.gatewayResponse !== undefined) updateData.gatewayResponse = data.gatewayResponse;
  if (data.receiptSent !== undefined) updateData.receiptSent = data.receiptSent;
  if (data.receiptUrl !== undefined) updateData.receiptUrl = data.receiptUrl;
  if (data.completedAt !== undefined) updateData.completedAt = data.completedAt;
  if (data.failedAt !== undefined) updateData.failedAt = data.failedAt;

  // Dedication fields
  if (data.isDedicated !== undefined) updateData.isDedicated = data.isDedicated;
  if (data.dedicatedTo !== undefined) updateData.dedicatedTo = data.dedicatedTo;
  if (data.dedicationType !== undefined) updateData.dedicationType = data.dedicationType;
  if (data.dedicationMessage !== undefined) updateData.dedicationMessage = data.dedicationMessage;

  // SMS fields
  if (data.smsShortCode !== undefined) updateData.smsShortCode = data.smsShortCode;
  if (data.smsKeyword !== undefined) updateData.smsKeyword = data.smsKeyword;

  return prisma.donation.update({
    where: { id },
    data: updateData,
  });
};

const deleteDonation = (id) => {
  return prisma.donation.delete({
    where: { id },
  });
};

// Kampanya toplamını güncelle
const updateCampaignTotal = async (campaignId) => {
  const total = await prisma.donation.aggregate({
    where: {
      campaignId: parseInt(campaignId),
      paymentStatus: 'completed',
    },
    _sum: {
      amount: true,
    },
  });

  await prisma.donationCampaign.update({
    where: { id: parseInt(campaignId) },
    data: { collectedAmount: total._sum.amount || 0 },
  });

  return total._sum.amount || 0;
};

// ========== DONATION CAMPAIGNS ==========

const getAllCampaigns = async (filters = {}) => {
  const where = {};

  if (filters.isActive !== undefined) where.isActive = filters.isActive === 'true';
  if (filters.category) where.category = filters.category;

  // Pagination parametreleri
  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 10;
  const skip = (page - 1) * limit;

  // Toplam kayıt sayısı
  const total = await prisma.donationCampaign.count({ where });

  // Veriyi çek
  const data = await prisma.donationCampaign.findMany({
    where,
    skip,
    take: limit,
    include: {
      project: true,
      settings: true, // Campaign ayarlarını dahil et
      _count: {
        select: { donations: true },
      },
    },
    orderBy: [
      { isFeatured: 'desc' },
      { displayOrder: 'asc' },
    ],
  });

  // Paginated response döndür
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

const getCampaignById = (id) => {
  return prisma.donationCampaign.findUnique({
    where: { id },
    include: {
      project: true,
      settings: true, // Campaign ayarlarını dahil et
      donations: {
        where: { paymentStatus: 'completed' },
        include: { donor: true },
      },
    },
  });
};

const getCampaignBySlug = (slug) => {
  return prisma.donationCampaign.findUnique({
    where: { slug },
    include: {
      project: true,
      settings: true, // Campaign ayarlarını dahil et
    },
  });
};

const createCampaign = (data) => {
  return prisma.donationCampaign.create({
    data: {
      title: data.title,
      slug: data.slug,
      description: data.description,
      targetAmount: data.targetAmount,
      imageUrl: data.imageUrl,
      category: data.category,
      isActive: data.isActive !== undefined ? data.isActive : true,
      isFeatured: data.isFeatured || false,
      displayOrder: data.displayOrder || 0,
      startDate: data.startDate,
      endDate: data.endDate,
      projectId: data.projectId,
    },
  });
};

const updateCampaign = (id, data) => {
  return prisma.donationCampaign.update({
    where: { id },
    data: {
      title: data.title,
      slug: data.slug,
      description: data.description,
      targetAmount: data.targetAmount,
      imageUrl: data.imageUrl,
      category: data.category,
      isActive: data.isActive,
      isFeatured: data.isFeatured,
      displayOrder: data.displayOrder,
      startDate: data.startDate,
      endDate: data.endDate,
      projectId: data.projectId,
    },
  });
};

const deleteCampaign = (id) => {
  return prisma.donationCampaign.delete({
    where: { id },
  });
};

// ========== DONORS ==========

const getAllDonors = () => {
  return prisma.donor.findMany({
    include: {
      _count: {
        select: { donations: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

const getDonorById = (id) => {
  return prisma.donor.findUnique({
    where: { id },
    include: {
      donations: {
        include: { campaign: true },
        orderBy: { createdAt: 'desc' },
      },
      recurringDonations: true,
    },
  });
};

const getDonorByEmail = (email) => {
  return prisma.donor.findUnique({
    where: { email },
    include: {
      donations: true,
      recurringDonations: true,
    },
  });
};

const createDonor = (data) => {
  return prisma.donor.create({
    data: {
      fullName: data.fullName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      address: data.address,
      city: data.city,
      country: data.country || 'Türkiye',
      taxNumber: data.taxNumber,
    },
  });
};

const updateDonor = (id, data) => {
  return prisma.donor.update({
    where: { id },
    data: {
      fullName: data.fullName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      address: data.address,
      city: data.city,
      country: data.country,
      taxNumber: data.taxNumber,
    },
  });
};

// ========== BANK ACCOUNTS ==========

const getAllBankAccounts = () => {
  return prisma.bankAccount.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: 'asc' },
  });
};

const getBankAccountById = (id) => {
  return prisma.bankAccount.findUnique({
    where: { id },
  });
};

const createBankAccount = (data) => {
  return prisma.bankAccount.create({
    data: {
      bankName: data.bankName,
      accountName: data.accountName,
      iban: data.iban,
      swift: data.swift,
      accountNumber: data.accountNumber,
      branch: data.branch,
      currency: data.currency || 'TRY',
      isActive: data.isActive !== undefined ? data.isActive : true,
      displayOrder: data.displayOrder || 0,
    },
  });
};

const updateBankAccount = (id, data) => {
  return prisma.bankAccount.update({
    where: { id },
    data: {
      bankName: data.bankName,
      accountName: data.accountName,
      iban: data.iban,
      swift: data.swift,
      accountNumber: data.accountNumber,
      branch: data.branch,
      currency: data.currency,
      isActive: data.isActive,
      displayOrder: data.displayOrder,
    },
  });
};

const deleteBankAccount = (id) => {
  return prisma.bankAccount.delete({
    where: { id },
  });
};

module.exports = {
  // Donations
  findMany,
  count,
  getAllDonations,
  getDonationById,
  createDonation,
  updateDonation,
  deleteDonation,
  updateCampaignTotal,

  // Campaigns
  getAllCampaigns,
  getCampaignById,
  getCampaignBySlug,
  createCampaign,
  updateCampaign,
  deleteCampaign,

  // Donors
  getAllDonors,
  getDonorById,
  getDonorByEmail,
  createDonor,
  updateDonor,

  // Bank Accounts
  getAllBankAccounts,
  getBankAccountById,
  createBankAccount,
  updateBankAccount,
  deleteBankAccount,
};
