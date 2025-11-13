/**
 * BIN ROUTING TEST SCRIPT
 *
 * Bu script, toplu bağış endpoint'i üzerinden BIN-based VPOS routing'i test eder
 *
 * TEST SENARYOLARI:
 * 1. Albaraka'ya gitmesi gereken kart (BIN: 540061 - isVirtualPosActive=true)
 * 2. Türkiye Finans'a gitmesi gereken kart (BIN: 521848 - isVirtualPosActive=false)
 */

const axios = require('axios');

// API base URL
const BASE_URL = 'http://localhost:5000/api/donations';

// Test kartları
const TEST_CARDS = {
  albaraka: {
    cardNo: '5400619340701616',  // BIN: 540061 (Albaraka gerçek test kartı)
    cvv: '000',
    expiry: '07/28',  // 202807 -> 07/28
    cardHolder: 'TEST ALBARAKA USER',
    expectedVpos: 'albaraka',
    smsCode: '34020'
  },
  turkiyeFinans: {
    cardNo: '5218487962459752',  // BIN: 521848 (TF test kartı)
    cvv: '000',
    expiry: '12/25',
    cardHolder: 'TEST TURKIYE FINANS USER',
    expectedVpos: 'turkiye_finans'
  }
};

// Test bağışçı bilgileri
const TEST_DONOR = {
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  phone: '5551234567'
};

// Test bağış sepeti
const TEST_DONATIONS = [
  {
    projectId: 1,
    amount: 100,
    donationType: 'general',
    isSacrifice: false
  }
];

/**
 * Test fonksiyonu - Tek bir kartı test eder
 */
async function testCardRouting(cardName, cardInfo) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`🧪 TEST: ${cardName.toUpperCase()}`);
  console.log(`${'='.repeat(80)}\n`);

  console.log('📋 KART BİLGİLERİ:');
  console.log(`   Kart No: ${cardInfo.cardNo}`);
  console.log(`   BIN: ${cardInfo.cardNo.substring(0, 6)}`);
  console.log(`   CVV: ${cardInfo.cvv}`);
  console.log(`   Expiry: ${cardInfo.expiry}`);
  console.log(`   Kart Sahibi: ${cardInfo.cardHolder}`);
  if (cardInfo.smsCode) {
    console.log(`   SMS Şifre: ${cardInfo.smsCode}`);
  }
  console.log(`   Beklenen VPOS: ${cardInfo.expectedVpos}\n`);

  console.log('📋 BAĞIŞ BİLGİLERİ:');
  console.log(`   Bağışçı: ${TEST_DONOR.firstName} ${TEST_DONOR.lastName}`);
  console.log(`   Email: ${TEST_DONOR.email}`);
  console.log(`   Telefon: ${TEST_DONOR.phone}`);
  console.log(`   Sepet Tutarı: ${TEST_DONATIONS.reduce((sum, d) => sum + d.amount, 0)} TL`);
  console.log(`   Ürün Sayısı: ${TEST_DONATIONS.length}\n`);

  // Request payload
  const payload = {
    donations: TEST_DONATIONS,
    donor: TEST_DONOR,
    card: {
      cardNo: cardInfo.cardNo,
      cvv: cardInfo.cvv,
      expiry: cardInfo.expiry,
      cardHolder: cardInfo.cardHolder
    },
    isRecurring: false
  };

  console.log('📤 REQUEST PAYLOAD:');
  console.log(JSON.stringify(payload, null, 2));
  console.log('\n📡 Sending POST request to:', `${BASE_URL}/bulk-initiate\n`);

  try {
    const response = await axios.post(`${BASE_URL}/bulk-initiate`, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ RESPONSE STATUS:', response.status);
    console.log('✅ RESPONSE SUCCESS:', response.data.success);
    console.log('\n📥 RESPONSE DATA:');
    console.log(JSON.stringify(response.data, null, 2));

    // Analiz
    console.log('\n🔍 ANALİZ:');

    if (response.data.success) {
      const formData = response.data.data.formData;
      const orderId = response.data.data.orderId;
      const totalAmount = response.data.data.totalAmount;

      console.log(`   ✅ Order ID: ${orderId}`);
      console.log(`   ✅ Toplam Tutar: ${totalAmount} TL`);
      console.log(`   ✅ Oluşturulan Bağış Sayısı: ${response.data.data.donationCount}`);

      // VPOS type'ı form action'dan anlayabiliriz
      const actionUrl = formData.action;
      console.log(`   ✅ Form Action URL: ${actionUrl}`);

      if (actionUrl.includes('albarakaturk') || actionUrl.includes('yapikredi')) {
        console.log(`   ✅ VPOS TİPİ: ALBARAKA (Yapıkredi altyapısı)`);
        if (cardInfo.expectedVpos === 'albaraka') {
          console.log(`   ✅✅✅ SONUÇ: BAŞARILI - Doğru VPOS'a yönlendirildi! ✅✅✅`);
        } else {
          console.log(`   ❌❌❌ SONUÇ: HATA - Yanlış VPOS'a yönlendirildi! (Beklenen: ${cardInfo.expectedVpos})`);
        }
      } else if (actionUrl.includes('turkiye') || actionUrl.includes('finans') || actionUrl.includes('torus') || actionUrl.includes('asseco')) {
        console.log(`   ✅ VPOS TİPİ: TÜRKİYE FİNANS (Payten/Asseco altyapısı)`);
        if (cardInfo.expectedVpos === 'turkiye_finans') {
          console.log(`   ✅✅✅ SONUÇ: BAŞARILI - Doğru VPOS'a yönlendirildi! ✅✅✅`);
        } else {
          console.log(`   ❌❌❌ SONUÇ: HATA - Yanlış VPOS'a yönlendirildi! (Beklenen: ${cardInfo.expectedVpos})`);
        }
      } else {
        console.log(`   ⚠️  VPOS TİPİ: BELİRSİZ (URL analizi yapılamadı)`);
        console.log(`   ℹ️  Form action'ı manuel kontrol edin: ${actionUrl}`);
      }

      console.log(`\n   📋 FORM FIELDS (ilk birkaç alan):`);
      const fieldKeys = Object.keys(formData.fields).slice(0, 10);
      fieldKeys.forEach(key => {
        console.log(`      ${key}: ${formData.fields[key]}`);
      });
      if (Object.keys(formData.fields).length > 10) {
        console.log(`      ... (${Object.keys(formData.fields).length - 10} alan daha var)`);
      }

    } else {
      console.log(`   ❌ İşlem başarısız: ${response.data.message}`);
    }

  } catch (error) {
    console.error('\n❌ HATA OLUŞTU!');
    console.error('Error Message:', error.message);

    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error Details:', error);
    }
  }
}

/**
 * Ana test runner
 */
async function runAllTests() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                   🏦 BIN ROUTING TEST - DUAL VPOS SYSTEM                   ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════╝');
  console.log('\n');
  console.log('📌 AMAÇ: BIN koduna göre VPOS routing\'in doğru çalıştığını test etmek\n');
  console.log('📌 TEST KARTLARI:');
  console.log('   1️⃣  Albaraka Kartı (540061) → Albaraka VPOS (isVirtualPosActive=true)');
  console.log('      💳 5400619340701616 | Exp: 07/28 | CVV: 000 | SMS: 34020');
  console.log('   2️⃣  Türkiye Finans Kartı (521848) → Türkiye Finans VPOS (isVirtualPosActive=false)');
  console.log('      💳 5218487962459752 | Exp: 12/25 | CVV: 000\n');
  console.log('📌 ENDPOINT: POST /api/donations/bulk-initiate\n');

  // Test 1: Albaraka
  await testCardRouting('Albaraka VPOS Test', TEST_CARDS.albaraka);

  // Biraz bekle
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test 2: Türkiye Finans
  await testCardRouting('Türkiye Finans VPOS Test', TEST_CARDS.turkiyeFinans);

  console.log(`\n${'='.repeat(80)}`);
  console.log('🎉 TÜM TESTLER TAMAMLANDI!');
  console.log(`${'='.repeat(80)}\n`);
  console.log('💡 SONRAKI ADIMLAR:');
  console.log('   • Eğer testler başarılıysa, 3D Secure sayfalarını tarayıcıda test edebilirsiniz');
  console.log('   • Log dosyalarında VPOS selection detaylarını kontrol edin');
  console.log('   • Database\'de Donation kayıtlarını kontrol edin\n');
}

// Run tests
runAllTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
