/**
 * Türkiye Finans Sanal POS Service (Placeholder)
 *
 * Bu servis Türkiye Finans VPOS entegrasyonu için hazırlanmıştır.
 * Entegrasyon tamamlanınca buraya implement edilecek.
 *
 * VPOS Tipi: Ana/Default VPOS
 * - Tüm işlemler varsayılan olarak buradan yapılır
 * - Düzenli ödemeler HER ZAMAN buradan yapılır
 * - BIN listesinde olmayan kartlar buradan işlenir
 */

class TurkiyeFinansService {
  constructor() {
    // TODO: Türkiye Finans VPOS config
    this.merchantNo = process.env.TURKIYE_FINANS_MERCHANT_NO;
    this.terminalNo = process.env.TURKIYE_FINANS_TERMINAL_NO;
    this.apiUrl = process.env.TURKIYE_FINANS_API_URL;
  }

  /**
   * 3D Secure payment initiation
   * @param {Object} params - Payment parameters
   * @returns {Object} - 3D Secure form data
   */
  create3DSecureForm(params) {
    // TODO: Türkiye Finans 3D Secure form implementation
    throw new Error('Türkiye Finans VPOS entegrasyonu henüz tamamlanmadı');
  }

  /**
   * 3D Secure callback validation
   * @param {Object} callbackData - Callback data from Türkiye Finans
   * @returns {Object} - Validation result
   */
  validate3DCallback(callbackData) {
    // TODO: Türkiye Finans callback validation
    throw new Error('Türkiye Finans VPOS entegrasyonu henüz tamamlanmadı');
  }
}

module.exports = new TurkiyeFinansService();
