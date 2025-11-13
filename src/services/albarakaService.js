/**
 * ALBARAKA SANAL POS SERVİSİ
 *
 * 3D Secure ödeme entegrasyonu için Albaraka Türk API'si
 * Doküman: Albaraka_Sanal_Pos_Entegrasyonu_20210421.docx
 */

const crypto = require('crypto');
const axios = require('axios');

class AlbarakaService {
  constructor() {
    // Test Credentials
    this.merchantNo = process.env.ALBARAKA_MERCHANT_NO;
    this.terminalNo = process.env.ALBARAKA_TERMINAL_NO;
    this.eposNo = process.env.ALBARAKA_EPOS_NO;
    this.encKey = process.env.ALBARAKA_ENCKEY;

    // URLs
    this.apiUrl = process.env.ALBARAKA_API_URL;
    this.tdsUrl = process.env.ALBARAKA_3DS_URL;
    this.callbackUrl = process.env.ALBARAKA_CALLBACK_URL;

    // Mode
    this.testMode = process.env.ALBARAKA_TEST_MODE === 'true';

    // Validate required config
    this._validateConfig();
  }

  /**
   * Config validation
   */
  _validateConfig() {
    const required = [
      'merchantNo', 'terminalNo', 'eposNo', 'encKey',
      'apiUrl', 'tdsUrl', 'callbackUrl'
    ];

    for (const field of required) {
      if (!this[field]) {
        throw new Error(`Albaraka Config Error: ${field} is required`);
      }
    }
  }

  /**
   * MAC (Message Authentication Code) Oluşturma
   *
   * Formula: SHA256(merchantNo + terminalNo + cardNo + cvv + expiry + amount + encKey)
   *
   * @param {Object} params
   * @param {string} params.cardNo - Kart numarası (boş olabilir)
   * @param {string} params.cvv - CVV (boş olabilir)
   * @param {string} params.expiry - Son kullanma (YYMM formatında, boş olabilir)
   * @param {number} params.amount - Tutar (TL cinsinden)
   * @returns {string} Base64 encoded SHA256 hash
   */
  generateMAC(params) {
    const {
      cardNo = '',
      cvv = '',
      expiry = '',
      amount
    } = params;

    // Amount'u kuruş cinsine çevir (10.50 TL = 1050 kuruş)
    const amountInKurus = Math.round(amount * 100).toString();

    // MAC input string: merchantNo + terminalNo + cardNo + cvv + expiry + amount + encKey
    const macData = `${this.merchantNo}${this.terminalNo}${cardNo}${cvv}${expiry}${amountInKurus}${this.encKey}`;

    // SHA256 hash ve Base64 encode
    const hash = crypto
      .createHash('sha256')
      .update(macData, 'utf8')
      .digest('base64');

    return hash;
  }

  /**
   * 3D Secure HTML Form Parametreleri Oluşturma
   *
   * Bu parametreler ile bir HTML form oluşturup Albaraka'nın 3D Secure sayfasına POST edilecek
   *
   * @param {Object} params - Ödeme bilgileri
   * @returns {Object} - { action, method, fields }
   */
  create3DSecureForm(params) {
    const {
      orderId,          // Unique sipariş numarası
      amount,           // Tutar (TL)
      currency = 'TRY', // Para birimi
      installment = '00', // Taksit (00 = peşin)
      cardNo,           // Kart numarası
      cvv,              // CVV
      expiry,           // Son kullanma (YYMM)
      cardHolder,       // Kart sahibi
      email,            // Email (opsiyonel)
      phone             // Telefon (opsiyonel)
    } = params;

    // MAC oluştur
    const mac = this.generateMAC({ cardNo, cvv, expiry, amount });

    // Amount'u kuruş cinsine çevir
    const amountInKurus = Math.round(amount * 100).toString();

    // HTML Form Parametreleri (Albaraka dokümanına göre)
    const formData = {
      // Zorunlu Alanlar
      MerchantNo: this.merchantNo,
      TerminalNo: this.terminalNo,
      PosnetID: this.eposNo,
      OrderId: orderId,
      TransactionType: 'Sale', // İşlem tipi: Sale (Satış), Auth (Otorizasyon), Point (Puan)
      Amount: amountInKurus,
      Currency: currency,
      Installment: installment,
      Language: 'TR', // TR = Türkçe, EN = İngilizce

      // Kart Bilgileri
      CardNo: cardNo,
      Cvv: cvv,
      ExpireDate: expiry,
      CardHolder: cardHolder,

      // MAC Hash
      Mac: mac,
      MacParams: 'MerchantNo:TerminalNo:CardNo:Cvv:ExpireDate:Amount', // MAC parametreleri

      // Callback URLs
      MerchantReturnURL: this.callbackUrl,
      SuccessURL: process.env.ALBARAKA_SUCCESS_URL,
      FailURL: process.env.ALBARAKA_FAIL_URL,

      // Opsiyonel
      Email: email || '',
      Phone: phone || '',

      // 3D Secure Ayarları
      OpenANewWindow: '0', // Yeni pencere açılsın mı? (0 = aynı pencere, 1 = yeni pencere)
      UseOOS: '0', // Ortak Ödeme Sayfası kullanılsın mı? (0 = hayır, 1 = evet)
      TxnState: 'INITIAL', // İşlem durumu (ilk çağrı için INITIAL olmalı)
      UseJokerVadaa: '0' // Joker Vadaa kampanyası kullanılsın mı? (0 = hayır, 1 = evet)
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
   * Albaraka'dan dönen callback verilerini doğrula
   *
   * @param {Object} callbackData - Albaraka'dan POST ile gelen veriler
   * @returns {Object} - { success, message, data }
   */
  validate3DCallback(callbackData) {
    const {
      ResponseCode,
      ResponseMessage,
      OrderId,
      Amount,
      AuthCode,
      HostRefNum,
      MdStatus, // 3D Secure doğrulama durumu
      MdErrorMessage, // 3D Secure hata mesajı
      ECI, // E-Commerce Indicator
      CAVV, // Cardholder Authentication Verification Value
      SecureTransactionId, // 3D Secure işlem ID
      Mac: receivedMac,
      ...rest
    } = callbackData;

    // 1. MdStatus kontrolü (3D Secure doğrulama durumu)
    // Albaraka dökümanına göre: sadece MdStatus=1 Full 3D işlem olarak kabul edilmelidir
    if (MdStatus !== '1') {
      let errorMessage = 'Ödeme doğrulaması başarısız';

      switch(MdStatus) {
        case '0':
          errorMessage = 'Kart doğrulama başarısız';
          break;
        case '2':
        case '3':
          errorMessage = 'Kart sahibi veya bankası 3D Secure sistemine kayıtlı değil (Half 3D)';
          break;
        case '4':
          errorMessage = 'Doğrulama denemesi yapıldı, kart sahibi sisteme daha sonra kayıt olmayı seçti';
          break;
        case '5':
          errorMessage = 'Doğrulama yapılamıyor';
          break;
        case '6':
          errorMessage = '3D Secure hatası';
          break;
        case '7':
          errorMessage = 'Sistem hatası';
          break;
        case '8':
          errorMessage = 'Bilinmeyen kart numarası';
          break;
        case '9':
          errorMessage = 'Üye İşyeri 3D-Secure sistemine kayıtlı değil';
          break;
        default:
          errorMessage = MdErrorMessage || 'Bilinmeyen doğrulama hatası';
      }

      return {
        success: false,
        message: errorMessage,
        code: MdStatus,
        mdStatus: MdStatus,
        data: callbackData
      };
    }

    // 2. Response Code kontrolü (0000 = başarılı)
    if (ResponseCode !== '0000') {
      return {
        success: false,
        message: ResponseMessage || 'Ödeme başarısız',
        code: ResponseCode,
        mdStatus: MdStatus,
        data: callbackData
      };
    }

    // TODO: MAC doğrulaması
    // Not: Albaraka'nın callback MAC'i farklı formülle oluşturulabilir
    // Formula: SHA256(ECI + CAVV + MdStatus + MdErrorMessage + MD + SecureTransactionId + encKey)
    // Dokümanı kontrol ederek eklenecek

    return {
      success: true,
      message: 'Ödeme başarılı (Full 3D)',
      data: {
        orderId: OrderId,
        amount: parseFloat(Amount) / 100, // Kuruştan TL'ye
        authCode: AuthCode,
        hostRefNum: HostRefNum,
        transactionId: HostRefNum, // hostRefNum transaction ID olarak kullanılır
        mdStatus: MdStatus, // 3D doğrulama durumu
        eci: ECI, // E-Commerce Indicator
        cavv: CAVV, // Cardholder Authentication Verification Value
        secureTransactionId: SecureTransactionId, // 3D Secure işlem ID
        mac: receivedMac,
        rawData: callbackData
      }
    };
  }

  /**
   * Non-3D Satış (Direkt API çağrısı - 3D Secure olmadan)
   *
   * NOT: Türkiye'de 3D Secure zorunlu, bu sadece test/özel durumlar için
   *
   * @param {Object} params - Ödeme bilgileri
   * @returns {Promise<Object>} - API response
   */
  async directSale(params) {
    const endpoint = `${this.apiUrl}/Sale`;

    const requestData = {
      MerchantNo: this.merchantNo,
      TerminalNo: this.terminalNo,
      PosnetID: this.eposNo,
      OrderId: params.orderId,
      Amount: Math.round(params.amount * 100),
      Currency: params.currency || 'TRY',
      CardNo: params.cardNo,
      Cvv: params.cvv,
      ExpireDate: params.expiry,
      Installment: params.installment || '00'
    };

    try {
      const response = await axios.post(endpoint, requestData, {
        headers: {
          'Content-Type': 'application/json',
          'X-MERCHANT-ID': this.merchantNo,
          'X-TERMINAL-ID': this.terminalNo,
          'X-POSNET-ID': this.eposNo,
          'X-CORRELATION-ID': params.orderId
        }
      });

      return {
        success: response.data.ResponseCode === '0000',
        data: response.data
      };
    } catch (error) {
      throw new Error(`Albaraka Sale Error: ${error.message}`);
    }
  }

  /**
   * İşlem Sorgulama
   *
   * Bir siparişin durumunu sorgula
   *
   * @param {string} orderId - Sipariş numarası
   * @returns {Promise<Object>}
   */
  async inquiryTransaction(orderId) {
    const endpoint = `${this.apiUrl}/TransactionInquiry`;

    const requestData = {
      MerchantNo: this.merchantNo,
      TerminalNo: this.terminalNo,
      OrderId: orderId
    };

    try {
      const response = await axios.post(endpoint, requestData, {
        headers: {
          'Content-Type': 'application/json',
          'X-MERCHANT-ID': this.merchantNo,
          'X-TERMINAL-ID': this.terminalNo,
          'X-POSNET-ID': this.eposNo,
          'X-CORRELATION-ID': `INQ-${orderId}`
        }
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      throw new Error(`Albaraka Inquiry Error: ${error.message}`);
    }
  }

  /**
   * İptal İşlemi (Void - Gün sonu öncesi)
   *
   * @param {string} transactionId - HostRefNum
   * @param {number} amount - İptal tutarı (TL)
   * @returns {Promise<Object>}
   */
  async void(transactionId, amount) {
    const endpoint = `${this.apiUrl}/Void`;

    const requestData = {
      MerchantNo: this.merchantNo,
      TerminalNo: this.terminalNo,
      HostRefNum: transactionId,
      Amount: Math.round(amount * 100)
    };

    try {
      const response = await axios.post(endpoint, requestData, {
        headers: {
          'Content-Type': 'application/json',
          'X-MERCHANT-ID': this.merchantNo,
          'X-TERMINAL-ID': this.terminalNo,
          'X-POSNET-ID': this.eposNo,
          'X-CORRELATION-ID': `VOID-${transactionId}`
        }
      });

      return {
        success: response.data.ResponseCode === '0000',
        data: response.data
      };
    } catch (error) {
      throw new Error(`Albaraka Void Error: ${error.message}`);
    }
  }

  /**
   * İade İşlemi (Refund - Gün sonu sonrası)
   *
   * @param {string} transactionId - HostRefNum
   * @param {number} amount - İade tutarı (TL)
   * @returns {Promise<Object>}
   */
  async refund(transactionId, amount) {
    const endpoint = `${this.apiUrl}/Refund`;

    const requestData = {
      MerchantNo: this.merchantNo,
      TerminalNo: this.terminalNo,
      HostRefNum: transactionId,
      Amount: Math.round(amount * 100)
    };

    try {
      const response = await axios.post(endpoint, requestData, {
        headers: {
          'Content-Type': 'application/json',
          'X-MERCHANT-ID': this.merchantNo,
          'X-TERMINAL-ID': this.terminalNo,
          'X-POSNET-ID': this.eposNo,
          'X-CORRELATION-ID': `REFUND-${transactionId}`
        }
      });

      return {
        success: response.data.ResponseCode === '0000',
        data: response.data
      };
    } catch (error) {
      throw new Error(`Albaraka Refund Error: ${error.message}`);
    }
  }
}

// Singleton instance
module.exports = new AlbarakaService();
