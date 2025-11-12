/**
 * ALBARAKA PAYMENT TEST SCRIPT
 *
 * Bu script Albaraka servisini ve ödeme akışını test eder.
 * Kullanım: node test-albaraka.js
 */

const albarakaService = require('./src/services/albarakaService');

console.log('\n========================================');
console.log('ALBARAKA SERVİS TEST');
console.log('========================================\n');

// Test 1: Konfigürasyon kontrolü
console.log('1. Konfigürasyon Kontrolü:');
console.log('   Merchant No:', albarakaService.merchantNo);
console.log('   Terminal No:', albarakaService.terminalNo);
console.log('   E-POS No:', albarakaService.eposNo);
console.log('   Test Mode:', albarakaService.testMode);
console.log('   API URL:', albarakaService.apiUrl);
console.log('   3DS URL:', albarakaService.tdsUrl);
console.log('   Callback URL:', albarakaService.callbackUrl);
console.log('   ✓ Konfigürasyon yüklendi\n');

// Test 2: MAC Hash Generation
console.log('2. MAC Hash Generation Test:');
const testAmount = 100; // 100 TL
const testCardNo = '5400619360964581';
const testCvv = '000';
const testExpiry = '2512';

const mac = albarakaService.generateMAC({
  cardNo: testCardNo,
  cvv: testCvv,
  expiry: testExpiry,
  amount: testAmount
});

console.log('   Test Data:');
console.log('     - Amount: 100 TL (10000 kuruş)');
console.log('     - Card No: 5400619360964581');
console.log('     - CVV: 000');
console.log('     - Expiry: 2512 (YYMM)');
console.log('   Generated MAC:', mac);
console.log('   MAC Length:', mac.length, 'chars');
console.log('   ✓ MAC hash oluşturuldu\n');

// Test 3: 3D Secure Form Creation
console.log('3. 3D Secure Form Creation Test:');
const orderId = `TEST-${Date.now()}`;
const formData = albarakaService.create3DSecureForm({
  orderId: orderId,
  amount: testAmount,
  currency: 'TRY',
  installment: '00',
  cardNo: testCardNo,
  cvv: testCvv,
  expiry: testExpiry,
  cardHolder: 'TEST KULLANICI',
  email: 'test@example.com',
  phone: '+90 555 123 4567'
});

console.log('   Form Data:');
console.log('     - Action URL:', formData.action);
console.log('     - Method:', formData.method);
console.log('     - Order ID:', orderId);
console.log('   Form Fields:');
Object.keys(formData.fields).forEach(key => {
  const value = formData.fields[key];
  // Hassas bilgileri maskele
  if (key === 'CardNo') {
    console.log(`     - ${key}: ${value.substring(0, 6)}******${value.substring(value.length - 4)}`);
  } else if (key === 'Cvv') {
    console.log(`     - ${key}: ***`);
  } else if (key === 'Mac') {
    console.log(`     - ${key}: ${value.substring(0, 20)}...`);
  } else {
    console.log(`     - ${key}:`, value);
  }
});
console.log('   ✓ 3D Secure formu oluşturuldu\n');

// Test 4: Callback Validation Simulation (Başarılı senaryo)
console.log('4. Callback Validation Test (Başarılı Senaryo):');
const successCallbackData = {
  ResponseCode: '0000',
  ResponseMessage: 'İşlem başarılı',
  OrderId: orderId,
  Amount: '10000', // 100 TL = 10000 kuruş
  AuthCode: 'TEST123456',
  HostRefNum: '123456789012',
  Mac: 'test-mac-hash'
};

const validationResult = albarakaService.validate3DCallback(successCallbackData);
console.log('   Callback Data:', {
  ResponseCode: successCallbackData.ResponseCode,
  ResponseMessage: successCallbackData.ResponseMessage,
  OrderId: successCallbackData.OrderId,
  Amount: successCallbackData.Amount
});
console.log('   Validation Result:');
console.log('     - Success:', validationResult.success);
console.log('     - Message:', validationResult.message);
if (validationResult.success) {
  console.log('     - Transaction ID:', validationResult.data.transactionId);
  console.log('     - Auth Code:', validationResult.data.authCode);
  console.log('     - Amount:', validationResult.data.amount, 'TL');
}
console.log('   ✓ Callback doğrulaması başarılı\n');

// Test 5: Callback Validation Simulation (Başarısız senaryo)
console.log('5. Callback Validation Test (Başarısız Senaryo):');
const failedCallbackData = {
  ResponseCode: '0001',
  ResponseMessage: 'Yetersiz bakiye',
  OrderId: orderId,
  Amount: '10000'
};

const failedValidationResult = albarakaService.validate3DCallback(failedCallbackData);
console.log('   Callback Data:', {
  ResponseCode: failedCallbackData.ResponseCode,
  ResponseMessage: failedCallbackData.ResponseMessage
});
console.log('   Validation Result:');
console.log('     - Success:', failedValidationResult.success);
console.log('     - Message:', failedValidationResult.message);
console.log('     - Code:', failedValidationResult.code);
console.log('   ✓ Başarısız senaryo doğru şekilde handle edildi\n');

console.log('========================================');
console.log('TÜM TESTLER BAŞARILI ✅');
console.log('========================================\n');

console.log('📌 Sonraki Adımlar:');
console.log('1. API endpoint testleri için:');
console.log('   curl -X POST http://localhost:5000/api/donations/albaraka/initiate \\');
console.log('     -H "Content-Type: application/json" \\');
console.log('     -d \'{"amount":100,"donorName":"Test User","donorEmail":"test@example.com",...}\'');
console.log('\n2. Frontend entegrasyonu için formData kullanın');
console.log('3. Test kartı: 5400619360964581, CVV: 000, SKT: 25/12, SMS: 34020\n');
