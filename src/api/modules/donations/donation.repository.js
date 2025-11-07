const prisma = require('../../../config/prismaClient');
const { includeTranslations } = require('../../../utils/translationHelper');

// ========== DONATIONS ==========

const findMany = (options = {}) => {
  const { skip, take, where, orderBy } = options;
  return prisma.donation.findMany({
    skip,
    take,
    where,
    include: {
      donor: true,
      project: true,
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
  if (filters.projectId) where.projectId = parseInt(filters.projectId);
  if (filters.donorId) where.donorId = parseInt(filters.donorId);

  return prisma.donation.findMany({
    where,
    include: {
      donor: true,
      project: true,
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
      project: true,
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
      projectId: data.projectId,
      // Yeni field'lar - Adanmış Bağış
      isDedicated: data.isDedicated || false,
      dedicatedTo: data.dedicatedTo || null,
      dedicationType: data.dedicationType || null,
      dedicationMessage: data.dedicationMessage || null,
      // Kurban Bağışı
      isSacrifice: data.isSacrifice || false,
      sacrificeType: data.sacrificeType || null,
      shareCount: data.shareCount || 1,
      sharePrice: data.sharePrice || null,
      // SMS Bağış
      smsShortCode: data.smsShortCode || null,
      smsKeyword: data.smsKeyword || null,
    },
    include: {
      donor: true,
      project: true,
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

  // Sacrifice fields
  if (data.isSacrifice !== undefined) updateData.isSacrifice = data.isSacrifice;
  if (data.sacrificeType !== undefined) updateData.sacrificeType = data.sacrificeType;
  if (data.shareCount !== undefined) updateData.shareCount = data.shareCount;
  if (data.sharePrice !== undefined) updateData.sharePrice = data.sharePrice;

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

// Proje toplamını güncelle (eski updateCampaignTotal)
const updateProjectTotal = async (projectId) => {
  const total = await prisma.donation.aggregate({
    where: {
      projectId: parseInt(projectId),
      paymentStatus: 'completed',
    },
    _sum: {
      amount: true,
    },
    _count: true,
  });

  await prisma.project.update({
    where: { id: parseInt(projectId) },
    data: {
      collectedAmount: total._sum.amount || 0,
      donorCount: total._count || 0,
    },
  });

  return total._sum.amount || 0;
};

// ========== DONATION CAMPAIGNS - REMOVED ==========
// NOT: Campaign fonksiyonları kaldırıldı.
// Projeler artık direkt olarak kampanya görevi görüyor.
// Campaign endpoint'leri için /api/projects kullanın.

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
        include: { project: true },
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
      branchCode: data.branchCode,
      currency: data.currency || 'TRY',
      isActive: data.isActive !== undefined ? data.isActive : true,
      displayOrder: data.displayOrder ? parseInt(data.displayOrder, 10) : 0,
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
      branchCode: data.branchCode,
      currency: data.currency,
      isActive: data.isActive,
      displayOrder: data.displayOrder !== undefined ? parseInt(data.displayOrder, 10) : undefined,
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
  updateProjectTotal,

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
