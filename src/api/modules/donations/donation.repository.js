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
  const language = filters.language || 'tr';

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
      ...includeTranslations(language)
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

const getCampaignById = (id, language = 'tr') => {
  return prisma.donationCampaign.findUnique({
    where: { id },
    include: {
      project: true,
      settings: true, // Campaign ayarlarını dahil et
      donations: {
        where: { paymentStatus: 'completed' },
        include: { donor: true },
      },
      ...includeTranslations(language)
    },
  });
};

const getCampaignBySlug = (slug, language = 'tr') => {
  // Slug artık translation'da, önce translation'ı bulmalıyız
  return prisma.donationCampaign.findFirst({
    where: {
      translations: {
        some: {
          slug: slug,
          ...(language && { language })
        }
      }
    },
    include: {
      project: true,
      settings: true, // Campaign ayarlarını dahil et
      ...includeTranslations()
    },
  });
};

const createCampaign = (data) => {
  // Translations helper'dan generateSlug'ı import etmemiz gerekiyor
  const { generateSlug } = require('../../../utils/translationHelper');

  // translations array bekliyoruz: [{ language: 'tr', title: '...', description: '...' }]
  const { translations, ...rest } = data;

  if (!translations || translations.length === 0) {
    const error = new Error('Kampanya oluşturmak için en az bir çeviri gereklidir. translations array\'i boş olamaz.');
    error.statusCode = 400;
    throw error;
  }

  // Türkçe çeviri kontrolü
  const hasTurkish = translations.some(t => t.language === 'tr');
  if (!hasTurkish) {
    const error = new Error('Türkçe çeviri zorunludur. translations array\'inde language: "tr" olan bir öğe bulunmalıdır.');
    error.statusCode = 400;
    throw error;
  }

  // Her bir translation için slug generate et
  const translationsWithSlug = translations.map(trans => ({
    language: trans.language,
    title: trans.title,
    slug: trans.slug || generateSlug(trans.title),
    description: trans.description || null
  }));

  return prisma.donationCampaign.create({
    data: {
      targetAmount: rest.targetAmount,
      imageUrl: rest.imageUrl || null,
      category: rest.category || null,
      isActive: rest.isActive !== undefined ? rest.isActive : true,
      isFeatured: rest.isFeatured || false,
      displayOrder: rest.displayOrder || 0,
      startDate: rest.startDate ? new Date(rest.startDate) : null,
      endDate: rest.endDate ? new Date(rest.endDate) : null,
      projectId: rest.projectId || null,
      translations: {
        create: translationsWithSlug
      }
    },
  });
};

const updateCampaign = (id, data) => {
  const { generateSlug } = require('../../../utils/translationHelper');
  const { translations, ...rest } = data;

  const updateData = {};

  // Dil-bağımsız alanları güncelle
  if (rest.targetAmount !== undefined) {
    updateData.targetAmount = rest.targetAmount;
  }
  if (rest.imageUrl !== undefined) {
    updateData.imageUrl = rest.imageUrl;
  }
  if (rest.category !== undefined) {
    updateData.category = rest.category;
  }
  if (rest.isActive !== undefined) {
    updateData.isActive = rest.isActive;
  }
  if (rest.isFeatured !== undefined) {
    updateData.isFeatured = rest.isFeatured;
  }
  if (rest.displayOrder !== undefined) {
    updateData.displayOrder = rest.displayOrder;
  }
  if (rest.startDate !== undefined) {
    updateData.startDate = rest.startDate ? new Date(rest.startDate) : null;
  }
  if (rest.endDate !== undefined) {
    updateData.endDate = rest.endDate ? new Date(rest.endDate) : null;
  }
  if (rest.projectId !== undefined) {
    updateData.projectId = rest.projectId;
  }

  // Translations güncelleme (varsa)
  if (translations && translations.length > 0) {
    const translationUpdates = translations.map(trans => ({
      where: {
        campaignId_language: {
          campaignId: id,
          language: trans.language
        }
      },
      create: {
        language: trans.language,
        title: trans.title,
        slug: trans.slug || generateSlug(trans.title),
        description: trans.description || null
      },
      update: {
        title: trans.title,
        slug: trans.slug || generateSlug(trans.title),
        description: trans.description || null
      }
    }));

    updateData.translations = {
      upsert: translationUpdates
    };
  }

  return prisma.donationCampaign.update({
    where: { id },
    data: updateData,
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
