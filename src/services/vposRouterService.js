/**
 * VPOS Router Service
 *
 * Bu servis, kart BIN koduna göre hangi sanal POS'un kullanılacağına karar verir.
 *
 * MANTIK:
 * 1. Türkiye Finans VPOS (Ana/Default VPOS)
 *    - Tüm işlemler varsayılan olarak buradan yapılır
 *    - Düzenli ödemeler HER ZAMAN buradan yapılır
 *
 * 2. Albaraka VPOS (Alternatif VPOS - Yapıkredi Altyapısı)
 *    - BIN listesinde bank.isVirtualPosActive = true olan kartlar
 *    - Sadece tek seferlik ödemeler için
 */

const binCodeService = require('../api/modules/bin-codes/bin-code.service');

// VPOS tipleri
const VPOS_TYPES = {
  TURKIYE_FINANS: 'turkiye_finans',
  ALBARAKA: 'albaraka'
};

/**
 * Kart BIN'ine göre VPOS seçimi yapar
 *
 * @param {string} cardNumber - Kart numarası (en az 6 hane)
 * @param {boolean} isRecurring - Düzenli ödeme mi?
 * @returns {Promise<Object>} - { vposType, bankInfo, reason }
 */
const selectVPOS = async (cardNumber, isRecurring = false) => {
  // 1. Düzenli ödeme kontrolü
  if (isRecurring) {
    return {
      vposType: VPOS_TYPES.TURKIYE_FINANS,
      bankInfo: null,
      reason: 'Düzenli ödemeler her zaman Türkiye Finans VPOS kullanır'
    };
  }

  // 2. BIN kodu çıkar (ilk 6 hane)
  const binCode = cardNumber.replace(/\s/g, '').substring(0, 6);

  if (binCode.length < 6) {
    throw new Error('Geçersiz kart numarası (en az 6 hane gerekli)');
  }

  // 3. BIN lookup
  let binCodeInfo;
  try {
    binCodeInfo = await binCodeService.getBinCodeByCode(binCode);
  } catch (error) {
    // BIN bulunamadı -> Default VPOS (Türkiye Finans)
    if (error.statusCode === 404) {
      return {
        vposType: VPOS_TYPES.TURKIYE_FINANS,
        bankInfo: null,
        reason: 'BIN kodu sistemde kayıtlı değil, varsayılan VPOS kullanılıyor'
      };
    }
    throw error;
  }

  // 4. Bank.isVirtualPosActive kontrolü
  const { bank } = binCodeInfo;

  if (!bank) {
    return {
      vposType: VPOS_TYPES.TURKIYE_FINANS,
      bankInfo: null,
      reason: 'Banka bilgisi bulunamadı, varsayılan VPOS kullanılıyor'
    };
  }

  // 5. Banka aktif değilse -> Default VPOS
  if (!bank.isActive) {
    return {
      vposType: VPOS_TYPES.TURKIYE_FINANS,
      bankInfo: bank,
      reason: 'Banka pasif durumda, varsayılan VPOS kullanılıyor'
    };
  }

  // 6. isVirtualPosActive = true ise -> Albaraka VPOS
  if (bank.isVirtualPosActive) {
    return {
      vposType: VPOS_TYPES.ALBARAKA,
      bankInfo: bank,
      reason: `${bank.name} bankası için alternatif VPOS (Albaraka) kullanılıyor`
    };
  }

  // 7. Default -> Türkiye Finans VPOS
  return {
    vposType: VPOS_TYPES.TURKIYE_FINANS,
    bankInfo: bank,
    reason: `${bank.name} bankası için varsayılan VPOS (Türkiye Finans) kullanılıyor`
  };
};

/**
 * Kart bilgilerinden sadece BIN'i döndürür (validation ile)
 * @param {string} cardNumber - Kart numarası
 * @returns {string} - BIN (ilk 6 hane)
 */
const extractBIN = (cardNumber) => {
  const cleaned = cardNumber.replace(/\s/g, '');
  if (cleaned.length < 6) {
    throw new Error('Geçersiz kart numarası');
  }
  return cleaned.substring(0, 6);
};

module.exports = {
  selectVPOS,
  extractBIN,
  VPOS_TYPES
};
