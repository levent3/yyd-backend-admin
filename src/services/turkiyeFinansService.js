/**
 * TÜRKİYE FİNANS SANAL POS SERVİSİ (Payten EST 3D)
 *
 * 3D Secure ödeme entegrasyonu için Türkiye Finans/Payten API'si
 * Platform: Payten (Asseco SEE)
 * Protokol: EST 3D
 *
 * VPOS Tipi: Ana/Default VPOS
 * - Tüm işlemler varsayılan olarak buradan yapılır
 * - Düzenli ödemeler HER ZAMAN buradan yapılır
 * - BIN listesinde olmayan kartlar buradan işlenir
 */

const crypto = require('crypto');
const axios = require('axios');

class TurkiyeFinansService {
  constructor() {
    // Credentials
    this.clientId = process.env.TURKIYE_FINANS_CLIENT_ID;
    this.storeKey = process.env.TURKIYE_FINANS_STORE_KEY;
    this.apiUser = process.env.TURKIYE_FINANS_API_USER;
    this.apiPassword = process.env.TURKIYE_FINANS_API_PASSWORD;

    // URLs
    this.apiUrl = process.env.TURKIYE_FINANS_API_URL;
    this.tdsUrl = process.env.TURKIYE_FINANS_3DS_URL;
    this.callbackUrl = process.env.TURKIYE_FINANS_CALLBACK_URL;

    // Mode
    this.testMode = process.env.TURKIYE_FINANS_TEST_MODE === 'true';

    // Validate required config
    this._validateConfig();
  }

  /**
   * Config validation
   */
  _validateConfig() {
    const required = [
      'clientId', 'storeKey', 'apiUser', 'apiPassword',
      'apiUrl', 'tdsUrl', 'callbackUrl'
    ];

    for (const field of required) {
      if (!this[field]) {
        throw new Error(`Turkiye Finans Config Error: ${field} is required`);
      }
    }
  }

  /**
   * Generate random string for hash
   * @returns {string}
   */
  generateRandomString() {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * HASH Hesaplama (EST 3D)
   *
   * Formula: BASE64(SHA1(clientid + oid + amount + okUrl + failUrl + rnd + storekey))
   *
   * @param {Object} params
   * @param {string} params.oid - Sipariş numarası
   * @param {number} params.amount - Tutar (TL cinsinden)
   * @param {string} params.okUrl - Başarılı callback URL
   * @param {string} params.failUrl - Başarısız callback URL
   * @param {string} params.rnd - Random string
   * @returns {string} Base64 encoded SHA1 hash
   */
  generateHash(params) {
    const {
      oid,
      amount,
      okUrl,
      failUrl,
      rnd
    } = params;

    // Amount'u 2 ondalık basamaklı string'e çevir (10.50 TL = "10.50")
    const amountStr = parseFloat(amount).toFixed(2);

    // Hash input string
    const hashData = `${this.clientId}${oid}${amountStr}${okUrl}${failUrl}${rnd}${this.storeKey}`;

    // SHA1 hash ve Base64 encode
    const hash = crypto
      .createHash('sha1')
      .update(hashData, 'utf8')
      .digest('base64');

    return hash;
  }

  /**
   * 3D Secure HTML Form Parametreleri Oluşturma
   *
   * Bu parametreler ile bir HTML form oluşturup Türkiye Finans'ın 3D Secure sayfasına POST edilecek
   *
   * @param {Object} params - Ödeme bilgileri
   * @returns {Object} - { action, method, fields }
   */
  create3DSecureForm(params) {
    const {
      orderId,                      // Unique sipariş numarası
      amount,                       // Tutar (TL)
      currency = '949',             // Para birimi (949 = TRY)
      installment = '',             // Taksit (boş = peşin)
      okUrl,                        // Başarılı callback URL
      failUrl,                      // Başarısız callback URL
      lang = 'tr',                  // Dil (tr/en)
      // Tekrarlayan ödeme parametreleri (opsiyonel)
      recurringPaymentNumber = null,  // Kaç kere tekrarlanacak (örn: 12)
      recurringFrequencyUnit = null,  // D: Gün, W: Hafta, M: Ay
      recurringFrequency = null,      // Aralık değeri (örn: 1 = her 1 ayda)
      // Ek bilgiler (opsiyonel)
      email = '',
      userId = '',
      extra = {}
    } = params;

    // Random string oluştur
    const rnd = this.generateRandomString();

    // Hash oluştur
    const hash = this.generateHash({
      oid: orderId,
      amount,
      okUrl,
      failUrl,
      rnd
    });

    // HTML Form Parametreleri (EST 3D standartları)
    const formData = {
      // Zorunlu Alanlar
      clientid: this.clientId,
      storetype: '3d_pay_hosting',   // 3D Secure tip
      amount: parseFloat(amount).toFixed(2),
      oid: orderId,
      okUrl: okUrl,
      failUrl: failUrl,
      currency: currency,
      rnd: rnd,
      hash: hash,
      lang: lang,

      // Taksit (boş ise peşin)
      ...(installment && { installment }),

      // Tekrarlayan Ödeme Parametreleri (varsa)
      ...(recurringPaymentNumber && { RecurringPaymentNumber: recurringPaymentNumber }),
      ...(recurringFrequencyUnit && { RecurringFrequencyUnit: recurringFrequencyUnit }),
      ...(recurringFrequency && { RecurringFrequency: recurringFrequency }),

      // Opsiyonel Alanlar
      ...(email && { email }),
      ...(userId && { userid: userId }),

      // Extra parametreler
      ...extra
    };

    return {
      action: this.tdsUrl,
      method: 'POST',
      fields: formData
    };
  }

  /**
   * 3D Secure Callback Doğrulama
   *
   * Türkiye Finans'tan dönen callback verilerini doğrula
   *
   * NOT: Response parametrelerini test ederek öğreneceğiz
   *
   * @param {Object} callbackData - Türkiye Finans'tan POST ile gelen veriler
   * @returns {Object} - { success, message, data }
   */
  validate3DCallback(callbackData) {
    // TODO: Bu kısmı test ederek tamamlayacağız
    // Şimdilik gelen tüm parametreleri loglayıp döndürelim

    console.log('=== TÜRKİYE FİNANS CALLBACK ===');
    console.log('Callback Data:', JSON.stringify(callbackData, null, 2));

    // Response parametrelerini analiz edeceğiz
    const {
      Response,
      mdStatus,
      ProcReturnCode,
      ErrMsg,
      AuthCode,
      TransId,
      HostRefNum,
      orderId,
      amount,
      ...rest
    } = callbackData;

    // Temel validasyon (test ederek güncelleyeceğiz)
    // EST 3D'de genellikle Response="Approved" başarılı demek
    if (Response === 'Approved' || ProcReturnCode === '00') {
      return {
        success: true,
        message: 'Ödeme başarılı',
        data: {
          orderId,
          amount: amount ? parseFloat(amount) : null,
          authCode: AuthCode,
          transactionId: TransId || HostRefNum,
          hostRefNum: HostRefNum,
          rawData: callbackData
        }
      };
    } else {
      return {
        success: false,
        message: ErrMsg || 'Ödeme başarısız',
        code: ProcReturnCode,
        data: callbackData
      };
    }
  }

  /**
   * Tekrarlayan Ödeme Güncelleme (XML API)
   *
   * İlk işlemden sonra sonraki ayların tutarını güncellemek için
   *
   * @param {Object} params
   * @param {string} params.recordId - Sipariş numarası (oid)
   * @param {number} params.newAmount - Yeni tutar (TL)
   * @returns {Promise<Object>}
   */
  async updateRecurringPayment(params) {
    const { recordId, newAmount } = params;

    const xmlRequest = `<?xml version="1.0" encoding="UTF-8"?>
<CC5Request>
    <Name>${this.apiUser}</Name>
    <Password>${this.apiPassword}</Password>
    <ClientId>${this.clientId}</ClientId>
    <Extra>
          <RECURRINGOPERATION>Update</RECURRINGOPERATION>
          <RECORDTYPE>Order</RECORDTYPE>
          <RECORDID>${recordId}</RECORDID>
          <AMOUNT>${parseFloat(newAmount).toFixed(2)}</AMOUNT>
    </Extra>
</CC5Request>`;

    try {
      const response = await axios.post(this.apiUrl, xmlRequest, {
        headers: {
          'Content-Type': 'text/xml; charset=UTF-8'
        }
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      throw new Error(`Turkiye Finans Update Error: ${error.message}`);
    }
  }
}

// Singleton instance
module.exports = new TurkiyeFinansService();
