/**
 * Donation Controller
 *
 * REFACTORING NOTU:
 * -----------------
 * Bu controller artık generic controllerFactory kullanıyor.
 *
 * ÖZEL DURUM: Bu modül 4 farklı entity içeriyor:
 * 1. Donations (Bağışlar)
 * 2. Campaigns (Kampanyalar)
 * 3. Donors (Bağışçılar)
 * 4. BankAccounts (Banka Hesapları)
 *
 * Her biri için ayrı factory controller oluşturuldu.
 * Cache invalidation pattern'leri afterCreate/Update/Delete hook'larında yapılıyor.
 */

const donationService = require('./donation.service');
const { createCRUDController } = require('../../../utils/controllerFactory');
const { invalidateCache } = require('../../middlewares/cacheMiddleware');

// Lazy load payment services to avoid startup crash if env vars missing
let albarakaService = null;
const getAlbarakaService = () => {
  if (!albarakaService) {
    albarakaService = require('../../../services/albarakaService');
  }
  return albarakaService;
};

// Lazy load Türkiye Finans Service
let turkiyeFinansService = null;
const getTurkiyeFinansService = () => {
  if (!turkiyeFinansService) {
    turkiyeFinansService = require('../../../services/turkiyeFinansService');
  }
  return turkiyeFinansService;
};

// VPOS Router
const vposRouter = require('../../../services/vposRouterService');

// ========== 1. DONATIONS (Bağışlar) ==========

const donationServiceAdapter = {
  getAll: (query) => donationService.getAllDonations(query),
  getById: (id) => donationService.getDonationById(id),
  create: (data) => donationService.createDonation(data),
  update: (id, data) => donationService.updateDonation(id, data),
  delete: (id) => donationService.deleteDonation(id),
};

const donationController = createCRUDController(donationServiceAdapter, {
  entityName: 'Bağış',
  entityNamePlural: 'Bağışlar',
  // Cache invalidation: Bağış oluşturulunca/güncellenince/silinince istatistikler değişir
  cachePatterns: [
    'cache:/api/projects*', // Campaign yerine project cache
    'cache:/api/dashboard*',
  ],
});

// ========== 2. CAMPAIGNS - REMOVED ==========
// NOT: Campaign controller'ları kaldırıldı.
// Projeler artık direkt olarak kampanya görevi görüyor.
// Campaign endpoint'leri için /api/projects kullanın.

// ========== 3. DONORS (Bağışçılar) ==========

const donorServiceAdapter = {
  getAll: () => donationService.getAllDonors(),
  getById: (id) => donationService.getDonorById(id),
  create: (data) => donationService.createDonor(data),
  update: (id, data) => donationService.updateDonor(id, data),
  delete: null, // Donor delete yok
};

const donorController = createCRUDController(donorServiceAdapter, {
  entityName: 'Bağışçı',
  entityNamePlural: 'Bağışçılar',
});

// ========== 4. BANK ACCOUNTS (Banka Hesapları) ==========

const bankAccountServiceAdapter = {
  getAll: () => donationService.getAllBankAccounts(),
  getById: (id) => donationService.getBankAccountById(id),
  create: (data) => donationService.createBankAccount(data),
  update: (id, data) => donationService.updateBankAccount(id, data),
  delete: (id) => donationService.deleteBankAccount(id),
};

const bankAccountController = createCRUDController(bankAccountServiceAdapter, {
  entityName: 'Banka hesabı',
  entityNamePlural: 'Banka hesapları',
});

// ========== ÖZEL METODLAR ==========

// GET /api/donations/donors/email/:email - Donor by email
const getDonorByEmail = async (req, res, next) => {
  try {
    const donor = await donationService.getDonorByEmail(req.params.email);
    if (!donor) {
      return res.status(404).json({ message: 'Bağışçı bulunamadı' });
    }
    res.status(200).json(donor);
  } catch (error) {
    next(error);
  }
};

// ========== UNIFIED PAYMENT ENDPOINT ==========

/**
 * POST /api/donations/initiate - Unified payment initiation with automatic VPOS routing
 *
 * Bu endpoint:
 * 1. Kart BIN'ini kontrol eder
 * 2. isVirtualPosActive = true ise → Albaraka VPOS
 * 3. isVirtualPosActive = false veya BIN bulunamadıysa → Türkiye Finans VPOS (default)
 * 4. Düzenli ödeme ise → HER ZAMAN Türkiye Finans VPOS
 */
const initiatePayment = async (req, res, next) => {
  try {
    const {
      amount,
      projectId,
      donorName,
      donorEmail,
      donorPhone,
      cardNo,
      cvv,
      expiry,
      cardHolder,
      isAnonymous,
      message,
      currency = 'TRY',
      installment = '00',
      isRecurring = false, // Düzenli ödeme mi?
      // Kurban Bağışı
      isSacrifice = false,
      sacrificeType = null,
      shareCount = 1,
      sharePrice = null,
      shareholders = null // Array of shareholder objects
    } = req.body;

    // Validasyon
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Geçerli bir bağış tutarı giriniz'
      });
    }

    if (!cardNo || !cvv || !expiry || !cardHolder) {
      return res.status(400).json({
        success: false,
        message: 'Kart bilgileri eksik'
      });
    }

    if (!donorName || !donorEmail) {
      return res.status(400).json({
        success: false,
        message: 'Bağışçı bilgileri eksik'
      });
    }

    // 1. VPOS Routing - Hangi VPOS kullanılacak?
    const vposSelection = await vposRouter.selectVPOS(cardNo, isRecurring);

    console.log('VPOS Selection:', {
      vposType: vposSelection.vposType,
      bankName: vposSelection.bankInfo?.name || 'N/A',
      reason: vposSelection.reason
    });

    // 2. Seçilen VPOS'a göre işlem yap
    if (vposSelection.vposType === vposRouter.VPOS_TYPES.ALBARAKA) {
      // Albaraka VPOS'a yönlendir
      return initiateAlbarakaPayment(req, res, next);
    } else {
      // Türkiye Finans VPOS'a yönlendir
      return initiateTurkiyeFinansPayment(req, res, next);
    }

  } catch (error) {
    console.error('Unified Payment Initiation Error:', error);
    next(error);
  }
};

/**
 * POST /api/donations/turkiye-finans/initiate - Türkiye Finans VPOS payment
 *
 * Placeholder function - Türkiye Finans entegrasyonu tamamlanınca implement edilecek
 */
const initiateTurkiyeFinansPayment = async (req, res, next) => {
  try {
    // TODO: Türkiye Finans service entegrasyonu
    return res.status(501).json({
      success: false,
      message: 'Türkiye Finans VPOS entegrasyonu henüz tamamlanmadı',
      vposType: 'turkiye_finans',
      note: 'Bu endpoint yakında aktif olacak'
    });
  } catch (error) {
    console.error('Türkiye Finans Payment Initiation Error:', error);
    next(error);
  }
};

// ========== ALBARAKA PAYMENT ENDPOINTS ==========

/**
 * POST /api/donations/albaraka/initiate - Albaraka 3D Secure ödeme başlatma
 *
 * Bu endpoint, bağış yapma işlemini başlatır ve Albaraka 3D Secure formunu döner.
 * Frontend bu formu HTML olarak render edip otomatik submit edecek.
 */
const initiateAlbarakaPayment = async (req, res, next) => {
  try {
    const {
      amount,
      projectId,
      donorName,
      donorEmail,
      donorPhone,
      cardNo,
      cvv,
      expiry,
      cardHolder,
      isAnonymous,
      message,
      currency = 'TRY',
      installment = '00',
      // Kurban Bağışı
      isSacrifice = false,
      sacrificeType = null,
      shareCount = 1,
      sharePrice = null,
      shareholders = null
    } = req.body;

    // Validasyon
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Geçerli bir bağış tutarı giriniz'
      });
    }

    if (!cardNo || !cvv || !expiry || !cardHolder) {
      return res.status(400).json({
        success: false,
        message: 'Kart bilgileri eksik'
      });
    }

    if (!donorName || !donorEmail) {
      return res.status(400).json({
        success: false,
        message: 'Bağışçı bilgileri eksik'
      });
    }

    // Kurban Bağışı Validasyonu
    if (isSacrifice) {
      // Hisse sayısı kontrolü (1-7 arası)
      if (shareCount < 1 || shareCount > 7) {
        return res.status(400).json({
          success: false,
          message: 'Hisse sayısı 1 ile 7 arasında olmalıdır'
        });
      }

      // Hisse fiyatı kontrolü
      if (!sharePrice || sharePrice <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Hisse fiyatı belirtilmelidir'
        });
      }

      // Tutar doğrulama: amount = shareCount × sharePrice
      const expectedAmount = shareCount * sharePrice;
      if (parseFloat(amount) !== expectedAmount) {
        return res.status(400).json({
          success: false,
          message: `Tutar hatalı. Beklenen: ${expectedAmount} TL (${shareCount} hisse × ${sharePrice} TL)`
        });
      }

      // Shareholders validasyonu
      if (shareholders) {
        if (!Array.isArray(shareholders)) {
          return res.status(400).json({
            success: false,
            message: 'Hissedarlar array formatında olmalıdır'
          });
        }

        // Hissedar sayısı shareCount ile eşleşmeli
        if (shareholders.length > shareCount) {
          return res.status(400).json({
            success: false,
            message: `En fazla ${shareCount} hissedar girilebilir`
          });
        }

        // Her hissedar için zorunlu alan kontrolü
        for (const shareholder of shareholders) {
          if (!shareholder.shareNumber || !shareholder.fullName) {
            return res.status(400).json({
              success: false,
              message: 'Her hissedar için hisse numarası ve ad-soyad zorunludur'
            });
          }

          // Hisse numarası 1-7 arası olmalı
          if (shareholder.shareNumber < 1 || shareholder.shareNumber > 7) {
            return res.status(400).json({
              success: false,
              message: 'Hisse numarası 1 ile 7 arasında olmalıdır'
            });
          }
        }
      }
    }

    // 1. Donor oluştur veya bul
    let donor = await donationService.getDonorByEmail(donorEmail);
    if (!donor) {
      donor = await donationService.createDonor({
        fullName: donorName,
        email: donorEmail,
        phoneNumber: donorPhone
      });
    }

    // 2. Unique orderId oluştur (timestamp + random)
    const orderId = `YYD-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    // 3. Donation kaydı oluştur (status: pending)
    const donation = await donationService.createDonation({
      amount: parseFloat(amount),
      currency,
      projectId: projectId ? parseInt(projectId) : null,
      donorId: donor.id,
      paymentMethod: 'credit_card',
      paymentStatus: 'pending',
      paymentGateway: 'albaraka',
      isAnonymous: isAnonymous || false,
      message: message || null,
      donorName,
      donorEmail,
      donorPhone,
      orderId, // Albaraka orderId
      cardBin: cardNo.substring(0, 6), // İlk 6 hane
      cardLastFour: cardNo.substring(cardNo.length - 4), // Son 4 hane
      // Kurban Bağışı
      isSacrifice,
      sacrificeType,
      shareCount: shareCount ? parseInt(shareCount) : 1,
      sharePrice: sharePrice ? parseFloat(sharePrice) : null,
      shareholders: shareholders || null
    });

    // 4. Albaraka 3D Secure Form oluştur
    const albaraka = getAlbarakaService();
    const formData = albaraka.create3DSecureForm({
      orderId,
      amount: parseFloat(amount),
      currency,
      installment,
      cardNo,
      cvv,
      expiry,
      cardHolder,
      email: donorEmail,
      phone: donorPhone
    });

    // 5. Response döndür (Frontend bu formu render edip submit edecek)
    res.status(200).json({
      success: true,
      message: '3D Secure ödeme formu oluşturuldu',
      data: {
        donationId: donation.id,
        orderId,
        formData // { action, method, fields }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Albaraka Payment Initiation Error:', error);
    next(error);
  }
};

/**
 * POST /api/donations/bulk-initiate - Bulk Payment (SEPET)
 * Sepetteki tüm bağışları tek ödemede işler
 */
const initiateBulkPayment = async (req, res, next) => {
  try {
    const {
      donations,  // Array of donation items
      donor,      // { name, email, phone }
      card,       // { cardNo, cvv, expiry, cardHolder }
      isRecurring = false
    } = req.body;

    // 1. Validasyon
    if (!donations || !Array.isArray(donations) || donations.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'En az 1 bağış seçilmelidir'
      });
    }

    if (!donor || !donor.firstName || !donor.lastName || !donor.email || !donor.phone) {
      return res.status(400).json({
        success: false,
        message: 'Bağışçı bilgileri eksik (firstName, lastName, email, phone gerekli)'
      });
    }

    if (!card || !card.cardNo || !card.cvv || !card.expiry || !card.cardHolder) {
      return res.status(400).json({
        success: false,
        message: 'Kart bilgileri eksik'
      });
    }

    // 2. Toplam tutar hesapla
    const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);

    if (totalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Toplam tutar 0 TL olamaz'
      });
    }

    // 3. VPOS Routing
    const vposSelection = await vposRouter.selectVPOS(card.cardNo, isRecurring);
    console.log('VPOS Selection (Bulk):', vposSelection);

    // 4. Şu an sadece Albaraka destekleniyor
    if (vposSelection.vposType !== 'albaraka') {
      return res.status(501).json({
        success: false,
        message: 'Türkiye Finans VPOS entegrasyonu henüz tamamlanmadı',
        vposType: vposSelection.vposType
      });
    }

    // 5. Donor oluştur/bul
    let donorRecord = await donationService.getDonorByEmail(donor.email);
    if (!donorRecord) {
      donorRecord = await donationService.createDonor({
        fullName: `${donor.firstName} ${donor.lastName}`,
        email: donor.email,
        phoneNumber: donor.phone
      });
    }

    // 6. ORTAK orderId (TÜM bağışlar için aynı)
    const mainOrderId = `YYD-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    // 7. Her donation için kayıt (status: pending)
    const createdDonations = [];
    for (const donationData of donations) {
      const donation = await donationService.createDonation({
        amount: parseFloat(donationData.amount),
        currency: 'TRY',
        projectId: donationData.projectId ? parseInt(donationData.projectId) : null,
        donorId: donorRecord.id,
        paymentMethod: 'credit_card',
        paymentStatus: 'pending',
        paymentGateway: 'albaraka',
        isAnonymous: donationData.isAnonymous || false,
        message: donationData.message || null,
        donorName: `${donor.firstName} ${donor.lastName}`,
        donorEmail: donor.email,
        donorPhone: donor.phone,
        orderId: mainOrderId,  // ← AYNI orderId!
        cardBin: card.cardNo.substring(0, 6),
        cardLastFour: card.cardNo.substring(card.cardNo.length - 4),
        // Kurban
        isSacrifice: donationData.isSacrifice || false,
        sacrificeType: donationData.sacrificeType || null,
        shareCount: donationData.shareCount ? parseInt(donationData.shareCount) : 1,
        sharePrice: donationData.sharePrice ? parseFloat(donationData.sharePrice) : null,
        shareholders: donationData.shareholders || null
      });

      createdDonations.push(donation);
    }

    // 8. TEK 3D Secure Form (TOPLAM tutar)
    const albaraka = getAlbarakaService();
    const formData = albaraka.create3DSecureForm({
      orderId: mainOrderId,
      amount: totalAmount,  // ← Sepet toplamı
      currency: 'TRY',
      installment: '00',
      cardNo: card.cardNo,
      cvv: card.cvv,
      expiry: card.expiry,
      cardHolder: card.cardHolder,
      email: donor.email,
      phone: donor.phone
    });

    // 9. Response
    return res.status(200).json({
      success: true,
      message: 'Sepet ödemesi için 3D Secure formu oluşturuldu',
      data: {
        orderId: mainOrderId,
        totalAmount,
        donationCount: createdDonations.length,
        donations: createdDonations.map(d => ({
          id: d.id,
          projectId: d.projectId,
          amount: d.amount,
          isSacrifice: d.isSacrifice
        })),
        formData
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Bulk Payment Initiation Error:', error);
    next(error);
  }
};

/**
 * POST /api/donations/albaraka/callback - Albaraka 3D Secure callback
 *
 * Albaraka bu endpoint'e 3D Secure doğrulaması sonrasında POST eder.
 * Ödeme başarılı ise donation status'u 'completed' olarak güncellenir.
 *
 * BULK PAYMENT DESTEĞI: Aynı orderId'ye sahip TÜM donations güncellenir
 */
const handleAlbarakaCallback = async (req, res, next) => {
  try {
    const callbackData = req.body;

    console.log('Albaraka Callback Data:', callbackData);

    // 1. Callback'i doğrula
    const albaraka = getAlbarakaService();
    const validationResult = albaraka.validate3DCallback(callbackData);

    if (!validationResult.success) {
      // Ödeme başarısız
      const { orderId } = callbackData;

      // TÜM donations'ları failed yap (bulk payment desteği)
      if (orderId) {
        const donations = await donationService.getAllDonations({ orderId });

        if (donations.data && donations.data.length > 0) {
          for (const donation of donations.data) {
            await donationService.updateDonationPaymentStatus(
              donation.id,
              'failed',
              {
                gatewayResponse: callbackData,
                errorMessage: validationResult.message
              }
            );
          }
        }
      }

      // Frontend'e hata sayfasına yönlendir
      return res.redirect(`${process.env.ALBARAKA_FAIL_URL}?error=${encodeURIComponent(validationResult.message)}`);
    }

    // 2. Ödeme başarılı - Donation'ı güncelle
    const { orderId, amount, authCode, hostRefNum, transactionId, mac } = validationResult.data;

    // Donation'ı orderId ile bul
    const donations = await donationService.getAllDonations({ orderId });

    if (!donations.data || donations.data.length === 0) {
      console.error('Donation not found for orderId:', orderId);
      return res.redirect(`${process.env.ALBARAKA_FAIL_URL}?error=Bağış kaydı bulunamadı`);
    }

    // 3. TÜM donations'ları completed yap (bulk payment desteği)
    for (const donation of donations.data) {
      await donationService.updateDonation(donation.id, {
        paymentStatus: 'completed',
        completedAt: new Date(),
        transactionId: transactionId || hostRefNum,
        authCode,
        hostRefNum,
        mac,
        gatewayResponse: callbackData
      });
    }

    const donation = donations.data[0]; // İlk donation'ı redirect için kullan

    // 4. Frontend'e başarı sayfasına yönlendir
    res.redirect(`${process.env.ALBARAKA_SUCCESS_URL}?orderId=${orderId}&amount=${amount}`);

  } catch (error) {
    console.error('Albaraka Callback Error:', error);
    // Frontend'e hata sayfasına yönlendir
    res.redirect(`${process.env.ALBARAKA_FAIL_URL}?error=${encodeURIComponent(error.message)}`);
  }
};

// ========== EXPORT ==========

module.exports = {
  // Donations (Bağışlar)
  getAllDonations: donationController.getAll,
  getDonationById: donationController.getById,
  createDonation: donationController.create,
  updateDonation: donationController.update,
  deleteDonation: donationController.delete,

  // Donors (Bağışçılar)
  getAllDonors: donorController.getAll,
  getDonorById: donorController.getById,
  getDonorByEmail, // Özel metod
  createDonor: donorController.create,
  updateDonor: donorController.update,

  // Bank Accounts (Banka Hesapları)
  getAllBankAccounts: bankAccountController.getAll,
  getBankAccountById: bankAccountController.getById,
  createBankAccount: bankAccountController.create,
  updateBankAccount: bankAccountController.update,
  deleteBankAccount: bankAccountController.delete,

  // Payment Endpoints (Ödeme)
  initiatePayment, // Unified payment endpoint (BIN routing)
  initiateBulkPayment, // Sepet ödemeleri için (bulk donations)
  initiateAlbarakaPayment, // Albaraka-specific
  initiateTurkiyeFinansPayment, // Türkiye Finans-specific
  handleAlbarakaCallback,
};
