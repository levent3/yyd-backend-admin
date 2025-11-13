/**
 * Albaraka Bulk Payment Transaction Test
 *
 * Test Kartları: Albaraka Türk Test Ortamı
 * CVV: 000
 * SMS Şifre: 34020
 *
 * KURBAN HİSSEDAR MANTIĞI:
 * - Hissedarlar telefon numarası ile kaydedilir (TCKN değil)
 * - Bir kişi birden fazla hisse alabilir
 * - Örnek: 3 hisse → 1 kişiye 2 hisse + 1 kişiye 1 hisse
 *
 * GERÇEK PROJELER:
 * - Project ID 1: "deneme" (Sağlık) - Normal bağış
 * - Project ID 3: "Nafile Kurban Bağışı" (Kurban) - Kurban bağışı
 */

const axios = require('axios');

const API_URL = 'http://localhost:5000';

// Albaraka Test Kartları (Gerçek test kartları)
const ALBARAKA_TEST_CARDS = [
  { cardNo: '4506349043174632', expiry: '0229', name: 'VISA TEST 1' },
  { cardNo: '4506349089054813', expiry: '0728', name: 'VISA TEST 2' },
  { cardNo: '4506349025539513', expiry: '0329', name: 'VISA TEST 3' },
  { cardNo: '4506349068067059', expiry: '0828', name: 'VISA TEST 4' },
  { cardNo: '4506344230780754', expiry: '1028', name: 'VISA TEST 5' },
  { cardNo: '5400619340701616', expiry: '0728', name: 'MASTERCARD 1' },
  { cardNo: '5400611063484835', expiry: '0528', name: 'MASTERCARD 2' },
  { cardNo: '5400611072814659', expiry: '0829', name: 'MASTERCARD 3' }
];

// Test donorları
const TEST_DONORS = [
  {
    firstName: 'Mehmet',
    lastName: 'Yılmaz',
    email: 'mehmet.yilmaz@test.com',
    phone: '+905551234567'
  },
  {
    firstName: 'Ayşe',
    lastName: 'Kaya',
    email: 'ayse.kaya@test.com',
    phone: '+905559876543'
  },
  {
    firstName: 'Ali',
    lastName: 'Demir',
    email: 'ali.demir@test.com',
    phone: '+905551112233'
  }
];

// Test senaryoları
const TEST_SCENARIOS = {
  // Senaryo 1: Kurban (3 hisse, 3 farklı kişi) + Normal Bağış
  kurbanThreePeople: {
    name: 'Kurban (3 Hisse → 3 Farklı Kişi) + Normal Bağış',
    donations: [
      {
        amount: 12000,
        projectId: 3, // Nafile Kurban Bağışı
        isSacrifice: true,
        sacrificeType: 'nafile',
        shareCount: 3,
        sharePrice: 4000,
        shareholders: [
          {
            shareNumber: 1,
            fullName: 'Mehmet Yılmaz',
            phoneNumber: '+905551234567',
            address: 'İstanbul/Kadıköy',
            note: 'Rahmetli babam adına'
          },
          {
            shareNumber: 2,
            fullName: 'Fatma Yılmaz',
            phoneNumber: '+905559876543',
            address: 'Ankara/Çankaya',
            note: 'Rahmetli annem adına'
          },
          {
            shareNumber: 3,
            fullName: 'Ali Demir',
            phoneNumber: '+905551112233',
            address: 'İzmir/Bornova',
            note: 'Kardeşim adına'
          }
        ],
        message: 'Hayırlı olsun inşallah',
        isAnonymous: false
      },
      {
        amount: 500,
        projectId: 1, // deneme (Sağlık)
        isSacrifice: false,
        message: 'Allah razı olsun',
        isAnonymous: false
      }
    ],
    expectedTotal: 12500,
    expectedCount: 2
  },

  // Senaryo 2: Kurban (3 hisse → AYNI kişi)
  kurbanSamePerson: {
    name: 'Kurban (3 Hisse → Aynı Kişi)',
    donations: [
      {
        amount: 12000,
        projectId: 3, // Nafile Kurban Bağışı
        isSacrifice: true,
        sacrificeType: 'vacip',
        shareCount: 3,
        sharePrice: 4000,
        shareholders: [
          {
            shareNumber: 1,
            fullName: 'Mehmet Yılmaz',
            phoneNumber: '+905551234567',
            address: 'İstanbul/Kadıköy',
            note: 'Hisse 1'
          },
          {
            shareNumber: 2,
            fullName: 'Mehmet Yılmaz',
            phoneNumber: '+905551234567',
            address: 'İstanbul/Kadıköy',
            note: 'Hisse 2'
          },
          {
            shareNumber: 3,
            fullName: 'Mehmet Yılmaz',
            phoneNumber: '+905551234567',
            address: 'İstanbul/Kadıköy',
            note: 'Hisse 3'
          }
        ],
        message: '3 hissenin tamamı bana',
        isAnonymous: false
      }
    ],
    expectedTotal: 12000,
    expectedCount: 1
  },

  // Senaryo 3: Kurban (3 hisse → 2 kişi: 2 hisse birisi, 1 hisse birisi)
  kurbanTwoPeople: {
    name: 'Kurban (3 Hisse → 2 Kişi: 2+1 Dağılım)',
    donations: [
      {
        amount: 12000,
        projectId: 3, // Nafile Kurban Bağışı
        isSacrifice: true,
        sacrificeType: 'nafile',
        shareCount: 3,
        sharePrice: 4000,
        shareholders: [
          {
            shareNumber: 1,
            fullName: 'Mehmet Yılmaz',
            phoneNumber: '+905551234567',
            address: 'İstanbul/Kadıköy',
            note: 'Babam adına - Hisse 1'
          },
          {
            shareNumber: 2,
            fullName: 'Mehmet Yılmaz',
            phoneNumber: '+905551234567',
            address: 'İstanbul/Kadıköy',
            note: 'Babam adına - Hisse 2'
          },
          {
            shareNumber: 3,
            fullName: 'Ayşe Kaya',
            phoneNumber: '+905559876543',
            address: 'Ankara/Çankaya',
            note: 'Annem adına'
          }
        ],
        message: '2 hisse babama, 1 hisse anneme',
        isAnonymous: false
      }
    ],
    expectedTotal: 12000,
    expectedCount: 1
  },

  // Senaryo 4: Tam Kurban (7 hisse - karışık dağılım)
  fullKurbanMixed: {
    name: 'Tam Kurban (7 Hisse → Karışık: 3+2+2)',
    donations: [
      {
        amount: 28000,
        projectId: 3, // Nafile Kurban Bağışı
        isSacrifice: true,
        sacrificeType: 'vacip',
        shareCount: 7,
        sharePrice: 4000,
        shareholders: [
          // 3 hisse → Mehmet Yılmaz
          {
            shareNumber: 1,
            fullName: 'Mehmet Yılmaz',
            phoneNumber: '+905551234567',
            note: 'Hisse 1'
          },
          {
            shareNumber: 2,
            fullName: 'Mehmet Yılmaz',
            phoneNumber: '+905551234567',
            note: 'Hisse 2'
          },
          {
            shareNumber: 3,
            fullName: 'Mehmet Yılmaz',
            phoneNumber: '+905551234567',
            note: 'Hisse 3'
          },
          // 2 hisse → Ayşe Kaya
          {
            shareNumber: 4,
            fullName: 'Ayşe Kaya',
            phoneNumber: '+905559876543',
            note: 'Hisse 4'
          },
          {
            shareNumber: 5,
            fullName: 'Ayşe Kaya',
            phoneNumber: '+905559876543',
            note: 'Hisse 5'
          },
          // 2 hisse → Ali Demir
          {
            shareNumber: 6,
            fullName: 'Ali Demir',
            phoneNumber: '+905551112233',
            note: 'Hisse 6'
          },
          {
            shareNumber: 7,
            fullName: 'Ali Demir',
            phoneNumber: '+905551112233',
            note: 'Hisse 7'
          }
        ],
        message: 'Tam kurban - 3 kişi arası dağıtım (3+2+2)',
        isAnonymous: false
      }
    ],
    expectedTotal: 28000,
    expectedCount: 1
  },

  // Senaryo 5: Kurban HİSSEDARSIZ (telefon numarası girilmemiş)
  kurbanNoShareholders: {
    name: 'Kurban (Hissedarsız)',
    donations: [
      {
        amount: 8000,
        projectId: 3, // Nafile Kurban Bağışı
        isSacrifice: true,
        sacrificeType: 'nafile',
        shareCount: 2,
        sharePrice: 4000,
        shareholders: null, // Hissedar bilgisi yok
        message: 'Hissedarları sonra ekleyeceğim',
        isAnonymous: false
      }
    ],
    expectedTotal: 8000,
    expectedCount: 1
  },

  // Senaryo 6: Sadece Normal Bağış (Kurban yok)
  normalOnly: {
    name: 'Sadece Normal Bağış (Kurban Yok)',
    donations: [
      {
        amount: 250,
        projectId: 1, // deneme (Sağlık)
        isSacrifice: false,
        message: 'Sağlık projesi için',
        isAnonymous: false
      }
    ],
    expectedTotal: 250,
    expectedCount: 1
  },

  // Senaryo 7: 2 Kurban + 1 Normal (Kompleks)
  multipleKurban: {
    name: 'Çoklu Kurban (2 Kurban + 1 Normal)',
    donations: [
      {
        amount: 8000,
        projectId: 3, // Kurban 1
        isSacrifice: true,
        sacrificeType: 'nafile',
        shareCount: 2,
        sharePrice: 4000,
        shareholders: [
          {
            shareNumber: 1,
            fullName: 'Mehmet Yılmaz',
            phoneNumber: '+905551234567',
            note: 'Kurban 1 - Hisse 1'
          },
          {
            shareNumber: 2,
            fullName: 'Mehmet Yılmaz',
            phoneNumber: '+905551234567',
            note: 'Kurban 1 - Hisse 2'
          }
        ],
        message: 'İlk kurban',
        isAnonymous: false
      },
      {
        amount: 4000,
        projectId: 3, // Kurban 2
        isSacrifice: true,
        sacrificeType: 'akika',
        shareCount: 1,
        sharePrice: 4000,
        shareholders: [
          {
            shareNumber: 1,
            fullName: 'Ayşe Kaya',
            phoneNumber: '+905559876543',
            note: 'Yeni doğan bebeğim için akika'
          }
        ],
        message: 'Akika kurbanı',
        isAnonymous: false
      },
      {
        amount: 100,
        projectId: 1, // Normal bağış
        isSacrifice: false,
        message: 'Ek bağış',
        isAnonymous: false
      }
    ],
    expectedTotal: 12100,
    expectedCount: 3
  }
};

// Yardımcı fonksiyon: Random seçim
function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Test fonksiyonu
async function runBulkPaymentTest(scenarioKey) {
  const scenario = TEST_SCENARIOS[scenarioKey];
  const card = getRandomItem(ALBARAKA_TEST_CARDS);
  const donor = getRandomItem(TEST_DONORS);

  console.log('\n' + '='.repeat(80));
  console.log(`🧪 TEST: ${scenario.name}`);
  console.log('='.repeat(80));
  console.log(`💳 Kart: ${card.name} (${card.cardNo.substring(0, 6)}...${card.cardNo.slice(-4)})`);
  console.log(`👤 Donor: ${donor.firstName} ${donor.lastName} (${donor.email})`);
  console.log(`📦 Bağış Sayısı: ${scenario.donations.length}`);
  console.log(`💰 Toplam Tutar: ${scenario.expectedTotal} TL`);

  // Kurban detayları
  const kurbanDonations = scenario.donations.filter(d => d.isSacrifice);
  if (kurbanDonations.length > 0) {
    console.log(`\n🐑 Kurban Detayları:`);
    kurbanDonations.forEach((kurban, idx) => {
      console.log(`   Kurban ${idx + 1}:`);
      console.log(`     Hisse Sayısı: ${kurban.shareCount}`);
      console.log(`     Hisse Fiyatı: ${kurban.sharePrice} TL`);
      console.log(`     Toplam: ${kurban.amount} TL`);

      if (kurban.shareholders && kurban.shareholders.length > 0) {
        const uniquePhones = [...new Set(kurban.shareholders.map(s => s.phoneNumber))];
        console.log(`     Hissedar Sayısı: ${uniquePhones.length} kişi`);

        // Kişi başına hisse dağılımı
        const distribution = {};
        kurban.shareholders.forEach(s => {
          if (!distribution[s.fullName]) {
            distribution[s.fullName] = 0;
          }
          distribution[s.fullName]++;
        });

        console.log(`     Hisse Dağılımı:`);
        Object.entries(distribution).forEach(([name, count]) => {
          console.log(`       - ${name}: ${count} hisse`);
        });
      } else {
        console.log(`     Hissedarlar: Girilmemiş`);
      }
    });
  }

  console.log('');

  try {
    const startTime = Date.now();

    const response = await axios.post(`${API_URL}/api/donations/bulk-initiate`, {
      donations: scenario.donations,
      donor: donor,
      card: {
        cardNo: card.cardNo,
        cvv: '000',
        expiry: card.expiry,
        cardHolder: `${donor.firstName.toUpperCase()} ${donor.lastName.toUpperCase()}`
      },
      isRecurring: false
    });

    const duration = Date.now() - startTime;

    console.log('✅ BAŞARILI!');
    console.log(`⏱️  Süre: ${duration}ms`);
    console.log('');
    console.log('📊 Response Detayları:');
    console.log(`   Order ID: ${response.data.data.orderId}`);
    console.log(`   Toplam Tutar: ${response.data.data.totalAmount} TL`);
    console.log(`   Donation Sayısı: ${response.data.data.donationCount}`);
    console.log('');
    console.log('   Donations:');
    response.data.data.donations.forEach((d, i) => {
      console.log(`   ${i + 1}. ${d.amount} TL - ${d.isSacrifice ? `Kurban (${d.shareCount} hisse)` : 'Normal Bağış'}`);
    });
    console.log('');
    console.log('🔐 3D Secure Form:');
    console.log(`   Action URL: ${response.data.data.formData.action}`);
    console.log('');
    console.log('📝 NOT: 3D Secure sayfasında SMS şifresi: 34020');
    console.log('');

    // Validation
    if (response.data.data.totalAmount !== scenario.expectedTotal) {
      console.log('⚠️  WARNING: Toplam tutar beklenenle eşleşmiyor!');
      console.log(`   Beklenen: ${scenario.expectedTotal}, Gelen: ${response.data.data.totalAmount}`);
    }

    if (response.data.data.donationCount !== scenario.expectedCount) {
      console.log('⚠️  WARNING: Donation sayısı beklenenle eşleşmiyor!');
      console.log(`   Beklenen: ${scenario.expectedCount}, Gelen: ${response.data.data.donationCount}`);
    }

    return { success: true, orderId: response.data.data.orderId, duration };

  } catch (error) {
    console.log('❌ HATA!');
    console.log('');

    if (error.response) {
      console.log(`HTTP Status: ${error.response.status}`);
      console.log(`Mesaj: ${error.response.data.message || 'Bilinmeyen hata'}`);
      if (error.response.data.error) {
        console.log(`Detay: ${error.response.data.error}`);
      }
    } else {
      console.log(`Hata: ${error.message}`);
    }

    return { success: false, error: error.message };
  }
}

// Database'deki son kayıtları kontrol et
async function checkDatabaseRecords(orderId) {
  console.log('\n📊 DATABASE KONTROLÜ');
  console.log('='.repeat(80));

  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const donations = await prisma.donation.findMany({
      where: { orderId },
      select: {
        id: true,
        orderId: true,
        amount: true,
        isSacrifice: true,
        shareCount: true,
        shareholders: true,
        paymentStatus: true,
        createdAt: true,
        donor: {
          select: {
            fullName: true,
            email: true
          }
        },
        project: {
          select: {
            id: true,
            translations: {
              where: { language: 'tr' },
              select: { title: true }
            }
          }
        }
      }
    });

    console.log(`✅ ${donations.length} donation kaydı bulundu:\n`);

    donations.forEach((d, i) => {
      const projectTitle = d.project?.translations?.[0]?.title || 'N/A';
      console.log(`${i + 1}. ID: ${d.id.substring(0, 8)}...`);
      console.log(`   Proje: ${projectTitle} (ID: ${d.project?.id})`);
      console.log(`   Amount: ${d.amount} TL`);
      console.log(`   Type: ${d.isSacrifice ? `Kurban (${d.shareCount} hisse)` : 'Normal'}`);
      console.log(`   Status: ${d.paymentStatus}`);
      console.log(`   Donor: ${d.donor.fullName} (${d.donor.email})`);
      console.log(`   Created: ${d.createdAt.toISOString()}`);

      if (d.shareholders) {
        const shareholders = JSON.parse(d.shareholders);
        console.log(`   Shareholders: ${shareholders.length} kayıt`);

        // Kişi başına grup
        const groupedByPerson = {};
        shareholders.forEach(s => {
          const key = `${s.fullName} (${s.phoneNumber})`;
          if (!groupedByPerson[key]) {
            groupedByPerson[key] = [];
          }
          groupedByPerson[key].push(s.shareNumber);
        });

        Object.entries(groupedByPerson).forEach(([person, shares]) => {
          console.log(`     - ${person}: ${shares.length} hisse (Hisse No: ${shares.join(', ')})`);
        });
      }
      console.log('');
    });

    await prisma.$disconnect();

  } catch (error) {
    console.log(`❌ Database kontrolü başarısız: ${error.message}`);
  }
}

// Tüm testleri çalıştır
async function runAllTests() {
  console.log('\n🚀 ALBARAKA BULK PAYMENT TRANSACTION TESTS');
  console.log('='.repeat(80));
  console.log('📅 Test Tarihi: ' + new Date().toLocaleString('tr-TR'));
  console.log('🌐 API URL: ' + API_URL);
  console.log('💳 Test Kartları: ' + ALBARAKA_TEST_CARDS.length + ' adet');
  console.log('👥 Test Donor: ' + TEST_DONORS.length + ' adet');
  console.log('🧪 Test Senaryoları: ' + Object.keys(TEST_SCENARIOS).length + ' adet');

  const results = [];

  // Her senaryoyu sırayla test et
  for (const [key, scenario] of Object.entries(TEST_SCENARIOS)) {
    console.log('\n\n');
    const result = await runBulkPaymentTest(key);
    results.push({ name: scenario.name, ...result });

    if (result.success) {
      await checkDatabaseRecords(result.orderId);
    }

    await sleep(3000); // 3 saniye bekle
  }

  // SONUÇLAR
  console.log('\n\n');
  console.log('='.repeat(80));
  console.log('📊 TEST SONUÇLARI');
  console.log('='.repeat(80));

  results.forEach((r, i) => {
    const status = r.success ? '✅ BAŞARILI' : '❌ BAŞARISIZ';
    const duration = r.duration ? ` (${r.duration}ms)` : '';
    console.log(`${i + 1}. ${r.name}: ${status}${duration}`);
  });

  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;

  console.log('');
  console.log(`Toplam: ${results.length} test`);
  console.log(`✅ Başarılı: ${successCount}`);
  console.log(`❌ Başarısız: ${failCount}`);
  console.log('');

  process.exit(failCount > 0 ? 1 : 0);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Komut satırı argümanlarını işle
const args = process.argv.slice(2);

if (args.length > 0) {
  const scenarioKey = args[0];

  if (scenarioKey === '--list') {
    console.log('\n📋 Mevcut Test Senaryoları:\n');
    Object.entries(TEST_SCENARIOS).forEach(([key, scenario]) => {
      console.log(`  ${key}`);
      console.log(`    ${scenario.name}`);
      console.log(`    Toplam: ${scenario.expectedTotal} TL, Donation: ${scenario.expectedCount} adet\n`);
    });
    process.exit(0);
  }

  if (!TEST_SCENARIOS[scenarioKey]) {
    console.error(`❌ Hata: '${scenarioKey}' senaryosu bulunamadı.`);
    console.log('\n💡 Kullanım: node test-bulk-payment-albaraka.js [senaryo_key]');
    console.log('💡 Tüm senaryoları listelemek için: node test-bulk-payment-albaraka.js --list\n');
    process.exit(1);
  }

  // Tek test çalıştır
  runBulkPaymentTest(scenarioKey)
    .then(result => {
      if (result.success) {
        return checkDatabaseRecords(result.orderId);
      }
    })
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Test failed:', error);
      process.exit(1);
    });
} else {
  // Tüm testleri çalıştır
  runAllTests().catch(error => {
    console.error('Test suite failed:', error);
    process.exit(1);
  });
}
