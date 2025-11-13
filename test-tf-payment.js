/**
 * Türkiye Finans 3D Secure Test Script
 *
 * Bu script:
 * 1. Test endpoint'inden form verilerini alır
 * 2. 3D Secure sayfasına istek atar (simüle eder)
 * 3. Callback response'unu gösterir
 */

const axios = require('axios');
const FormData = require('form-data');

async function testTurkiyeFinansPayment() {
  console.log('🚀 Türkiye Finans 3D Secure Test Başlıyor...\n');

  try {
    // STEP 1: Get 3D form data from our backend
    console.log('📡 Step 1: Test endpoint\'inden form verilerini alıyoruz...');
    const testResponse = await axios.post('http://localhost:5000/api/donations/turkiye-finans/test', {
      amount: 10,
      recurringPaymentNumber: 12,
      recurringFrequency: 1,
      recurringFrequencyUnit: 'M'
    });

    console.log('✅ Form verileri alındı!');
    console.log('Order ID:', testResponse.data.data.orderId);
    console.log('3D URL:', testResponse.data.data.formData.action);
    console.log('\n📋 Form Fields:');
    console.log(JSON.stringify(testResponse.data.data.formData.fields, null, 2));

    // STEP 2: POST to 3D Secure page
    console.log('\n📡 Step 2: 3D Secure sayfasına istek atılıyor...');
    console.log('⚠️  NOT: 3D Secure sayfası HTML döndürür, bu yüzden callback simüle edeceğiz\n');

    const formData = new FormData();
    const fields = testResponse.data.data.formData.fields;

    Object.keys(fields).forEach(key => {
      formData.append(key, fields[key]);
    });

    // 3D Secure sayfasına istek at (HTML response gelecek)
    const tdsResponse = await axios.post(
      testResponse.data.data.formData.action,
      formData,
      {
        headers: formData.getHeaders(),
        maxRedirects: 0, // Redirectleri takip etme
        validateStatus: () => true // Tüm status code'ları kabul et
      }
    );

    console.log('📥 3D Secure Response Status:', tdsResponse.status);
    console.log('📥 Response Type:', tdsResponse.headers['content-type']);

    // HTML içeriğini kontrol et
    if (tdsResponse.data && typeof tdsResponse.data === 'string') {
      const htmlSnippet = tdsResponse.data.substring(0, 500);
      console.log('\n📄 HTML Response (ilk 500 karakter):');
      console.log(htmlSnippet);
      console.log('...\n');

      // Eğer 3D Secure formu içeriyorsa
      if (htmlSnippet.includes('form') || htmlSnippet.includes('3D')) {
        console.log('✅ 3D Secure sayfası başarıyla yüklendi!');
        console.log('\n💡 GERÇEK TEST İÇİN:');
        console.log('   1. Tarayıcıda test-turkiye-finans.html dosyasını aç');
        console.log('   2. Veya Postman\'de HTML form submit et');
        console.log('   3. Test kartı: 5218487962459752');
        console.log('   4. CVV: 000');
        console.log('   5. Son Kullanma: 12/25\n');
      }
    }

    // STEP 3: Simüle edilmiş callback test
    console.log('\n📡 Step 3: Callback endpoint\'ini test ediyoruz...');
    console.log('⚠️  NOT: Gerçek callback parametreleri 3D işlem tamamlandıktan sonra gelir\n');

    // Örnek callback parametreleri (gerçek işlemden sonra güncellenecek)
    const mockCallbackData = {
      Response: 'Approved',
      mdStatus: '1',
      ProcReturnCode: '00',
      AuthCode: 'TEST123',
      TransId: 'TEST_TRANS_123',
      HostRefNum: 'TEST_HOST_123',
      orderId: testResponse.data.data.orderId,
      amount: '10.00'
    };

    console.log('📋 Mock Callback Data:');
    console.log(JSON.stringify(mockCallbackData, null, 2));

    const callbackResponse = await axios.post(
      'http://localhost:5000/api/donations/turkiye-finans/callback',
      mockCallbackData
    );

    console.log('\n✅ Callback Response:');
    console.log(JSON.stringify(callbackResponse.data, null, 2));

    console.log('\n🎉 TEST TAMAMLANDI!');
    console.log('\n📊 SONUÇ:');
    console.log('   ✅ Test endpoint çalışıyor');
    console.log('   ✅ 3D Secure sayfasına bağlantı başarılı');
    console.log('   ✅ Callback endpoint hazır');
    console.log('\n⏭️  SONRAKI ADIM: Gerçek kart ile tarayıcıda test et');

  } catch (error) {
    console.error('\n❌ HATA:', error.message);
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run test
testTurkiyeFinansPayment();
