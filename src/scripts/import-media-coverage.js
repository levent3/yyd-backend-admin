/**
 * Import Media Coverage from YYD website
 * Run: node src/scripts/import-media-coverage.js
 */

const prisma = require('../config/prismaClient');

const mediaCoverageData = [
  {
    "title": "Bugüne kadar hep oradaydı! Türkiye'den yeni akın başlıyor",
    "source": "HABER 7",
    "publishedAt": "2025-10-09",
    "externalUrl": "https://www.haber7.com/guncel/haber/3570154-bugune-kadar-hep-oradaydi-turkiyeden-yeni-akin-basliyor"
  },
  {
    "title": "Milyonlarca katarakt hastası için 'İyiliğe Bu Gözle Bakın' kampanyası",
    "source": "GÜNEŞ",
    "publishedAt": "2025-10-06",
    "externalUrl": "https://www.star.com.tr/saglik/milyonlarca-katarakt-hastasi-icin-iyilige-bu-gozle-bakin-kampanyasi-haber-1969439/"
  },
  {
    "title": "Milyonlarca katarakt hastası için 'İyiliğe Bu Gözle Bakın' kampanyası",
    "source": "STAR",
    "publishedAt": "2025-10-06",
    "externalUrl": "https://www.star.com.tr/saglik/milyonlarca-katarakt-hastasi-icin-iyilige-bu-gozle-bakin-kampanyasi-haber-1969439/"
  },
  {
    "title": "Milyonlarca katarakt hastası için 'İyiliğe Bu Gözle Bakın' kampanyası",
    "source": "24 TV",
    "publishedAt": "2025-10-06",
    "externalUrl": "https://www.yirmidort.tv/saglik/milyonlarca-katarakt-hastasi-icin-iyilige-bu-gozle-bakin-kampanyasi-244661"
  },
  {
    "title": "Gazze'deki çocukların yaşama hakları neden korunamadı?",
    "source": "Anadolu Ajansı",
    "publishedAt": "2025-10-01",
    "externalUrl": "https://www.aa.com.tr/tr/podcast/gazze-deki-cocuklarin-yasama-haklari-neden-korunamadi/3704126"
  },
  {
    "title": "Yeryüzü Doktorları her zorluğa rağmen Gazze'ye kurban eti ulaştırdı",
    "source": "GÜNEŞ",
    "publishedAt": "2025-09-24",
    "externalUrl": "https://www.gunes.com/dunya/yeryuzu-doktorlari-her-zorluga-ragmen-gazzeye-kurban-eti-ulastirdi-1221963"
  },
  {
    "title": "Genç doktorlardan anlamlı hareket, 'Çöpü değil yangını temizliyoruz'",
    "source": "HABER GLOBAL",
    "publishedAt": "2025-09-24",
    "externalUrl": "https://haberglobal.com.tr/gundem/genc-doktorlardan-anlamli-hareket-copu-degil-yangini-temizliyoruz-479823"
  },
  {
    "title": "Yeryüzü Doktorları Her Zorluğa Rağmen Gazze'ye Kurban Eti Ulaştırdı",
    "source": "24 TV",
    "publishedAt": "2025-09-24",
    "externalUrl": "https://www.yirmidort.tv/yasam/yeryuzu-doktorlari-her-zorluga-ragmen-gazzeye-kurban-eti-ulastirdi-243740"
  },
  {
    "title": "Yeryüzü Doktorları her zorluğa rağmen Gazze'ye kurban eti ulaştırdı",
    "source": "AKŞAM",
    "publishedAt": "2025-09-24",
    "externalUrl": "https://www.aksam.com.tr/dunya/yeryuzu-doktorlari-her-zorluga-ragmen-gazzeye-kurban-eti-ulastirdi/haber-1604648"
  },
  {
    "title": "Yeryüzü Doktorları bağışlanan kurban etlerini Gazze'ye ulaştırdı",
    "source": "Yeni Şafak",
    "publishedAt": "2025-09-24",
    "externalUrl": "https://www.yenisafak.com/dunya/yeryuzu-doktorlari-bagislanan-kurban-etlerini-gazzeye-ulastirdi-4751709"
  },
  {
    "title": "Yeryüzü Doktorları her zorluğa rağmen Gazze'ye kurban eti ulaştırdı",
    "source": "HABER 7",
    "publishedAt": "2025-09-24",
    "externalUrl": "https://www.haber7.com/guncel/haber/3565920-yeryuzu-doktorlari-her-zorluga-ragmen-gazzeye-kurban-eti-ulastirdi"
  },
  {
    "title": "Genç Yeryüzü Doktorları'ndan Anlamlı Çağrı",
    "source": "24 TV",
    "publishedAt": "2025-09-16",
    "externalUrl": "https://www.yirmidort.tv/yasam/genc-yeryuzu-doktorlarindan-anlamli-cagri-242882"
  },
  {
    "title": "Genç Yeryüzü Doktorları'ndan Anlamlı Çağrı",
    "source": "HABER 7",
    "publishedAt": "2025-09-16",
    "externalUrl": "https://www.haber7.com/guncel/haber/3563784-genc-yeryuzu-doktorlarindan-anlamli-cagri"
  },
  {
    "title": "Genç Yeryüzü Doktorları Ormanları Temizliyor",
    "source": "Haberler.com",
    "publishedAt": "2025-09-16",
    "externalUrl": "https://www.haberler.com/guncel/genc-yeryuzu-doktorlari-ormanlari-temizliyor-19052902-haberi/"
  },
  {
    "title": "Genç Yeryüzü Doktorları'ndan Anlamlı Çağrı",
    "source": "AKŞAM",
    "publishedAt": "2025-09-16",
    "externalUrl": "https://www.aksam.com.tr/guncel/genc-yeryuzu-doktorlarindan-anlamli-cagri/haber-1602381"
  },
  {
    "title": "Genç Yeryüzü Doktorları'ndan anlamlı çağrı",
    "source": "STAR",
    "publishedAt": "2025-09-16",
    "externalUrl": "https://www.star.com.tr/guncel/genc-yeryuzu-doktorlarindan-anlamli-cagri-haber-1965617/"
  },
  {
    "title": "Yeryüzü Doktorları'ndan kıtlığın ortasında bebekler için mücadele",
    "source": "AKŞAM",
    "publishedAt": "2025-08-29",
    "externalUrl": "https://www.aksam.com.tr/dunya/yeryuzu-doktorlarindan-kitligin-ortasinda-bebekler-icin-mucadele/haber-1597563"
  },
  {
    "title": "Yeryüzü Doktorları'ndan kıtlığın ortasında bebekler için mücadele",
    "source": "STAR",
    "publishedAt": "2025-08-29",
    "externalUrl": "https://www.star.com.tr/dunya/yeryuzu-doktorlarindan-kitligin-ortasinda-bebekler-icin-mucadele-haber-1962406/"
  },
  {
    "title": "Yeryüzü Doktorları'ndan Kıtlığın Ortasında Bebekler İçin Mücadele",
    "source": "Haber.tr",
    "publishedAt": "2025-08-28",
    "externalUrl": "https://www.haber.tr/yeryuzu-doktorlarindan-kitligin-ortasinda-bebekler-icin-mucadele"
  },
  {
    "title": "Kıtlığın ortasında bebekler için yaşam mücadelesi",
    "source": "İLKHA",
    "publishedAt": "2025-08-28",
    "externalUrl": "https://ilkha.com/video-gallery/kitligin-ortasinda-bebekler-icin-yasam-mucadelesi-475711"
  },
  {
    "title": "Yeryüzü Doktorları'ndan Gazze'de örnek davranış",
    "source": "GZT",
    "publishedAt": "2025-08-28",
    "externalUrl": "https://www.gzt.com/jurnalist/yeryuzu-doktorlarindan-gazzede-ornek-davranis-kitligin-ortasinda-bebeklere-mama-binlerce-gazzeliye-gida-yardimi-3804217"
  },
  {
    "title": "Yeryüzü Doktorları Derneği, Gazze'deki Bebeklere Mama ve Gıda Yardımı Ulaştırdı",
    "source": "Haberler.com",
    "publishedAt": "2025-08-28",
    "externalUrl": "https://www.haberler.com/guncel/yeryuzu-doktorlari-dernegi-gazze-deki-bebeklere-mama-ve-gida-yardimi-ulastirdi-18988786-haberi/"
  },
  {
    "title": "Yeryüzü Doktorları'ndan Kıtlığın Ortasında Bebekler İçin Mücadele",
    "source": "Haber 7",
    "publishedAt": "2025-08-28",
    "externalUrl": "https://www.haber7.com/guncel/haber/3558748-yeryuzu-doktorlarindan-kitligin-ortasinda-bebekler-icin-mucadele"
  },
  {
    "title": "Yeryüzü Doktorları Etiyopya'da bir ilki başardı",
    "source": "STAR",
    "publishedAt": "2025-08-27",
    "externalUrl": "https://www.star.com.tr/dunya/yeryuzu-doktorlari-etiyopyada-bir-ilki-basardi-haber-1962039/"
  },
  {
    "title": "'Yeryüzü Doktorları' Etiyopya'da bir ilki başardı",
    "source": "GÜNEŞ",
    "publishedAt": "2025-08-27",
    "externalUrl": "https://www.gunes.com/gundem/yeryuzu-doktorlari-etiyopyada-bir-ilki-basardi-1221247"
  },
  {
    "title": "Türkiye's aid groups deliver food, water and medicine to Gaza",
    "source": "DAILY SABAH",
    "publishedAt": "2025-08-26",
    "externalUrl": "https://www.dailysabah.com/politics/turkiyes-aid-groups-deliver-food-water-and-medicine-to-gaza/news"
  },
  {
    "title": "Türkiye's aid groups sustain Gaza with food, water, and medical support amid blockade",
    "source": "A NEWS",
    "publishedAt": "2025-08-26",
    "externalUrl": "https://www.anews.com.tr/middle-east/2025/08/26/turkiyes-aid-groups-sustain-gaza-with-food-water-and-medical-support-amid-blockade"
  },
  {
    "title": "Yeryüzü Doktorları'ndan Etiyopya'da İlk Artroskopik Cerrahi",
    "source": "Haberler.com",
    "publishedAt": "2025-08-25",
    "externalUrl": "https://www.haberler.com/guncel/yeryuzu-doktorlari-ndan-etiyopya-da-ilk-artroskopik-cerrahi-18980579-haberi/"
  },
  {
    "title": "Yeryüzü Doktorları Derneğinin gönüllü sağlık ekibi Etiyopya sağlık kampını tamamladı",
    "source": "İTTİFAK GAZETESİ",
    "publishedAt": "2025-08-25",
    "externalUrl": "https://ittifakgazetesi.com/yeryuzu-doktorlari-derneginin-gonullu-saglik-ekibi-etiyopya-saglik-kampini-tamamladi/"
  },
  {
    "title": "Dünya izliyor, Gazze yardım bekliyor",
    "source": "24 TV",
    "publishedAt": "2025-08-24",
    "externalUrl": "https://www.yirmidort.tv/dunya/dunya-izliyor-gazze-yardim-bekliyor-240240"
  },
  {
    "title": "Türkiye'deki STK'ler Gazze'deki gıda krizine aralıksız yardım ediyor",
    "source": "HABER 7",
    "publishedAt": "2025-08-21",
    "externalUrl": "https://www.haber7.com/guncel/haber/3556912-turkiyedeki-stkler-gazzedeki-gida-krizine-araliksiz-yardim-ediyor"
  },
  {
    "title": "Dünya izliyor, Gazze yardım bekliyor",
    "source": "GÜNEŞ",
    "publishedAt": "2025-08-20",
    "externalUrl": "https://www.gunes.com/gundem/dunya-izliyor-gazze-yardim-bekliyor-1221041"
  },
  {
    "title": "Turkish NGOs continue uninterrupted aid efforts to address food crisis in Gaza",
    "source": "Anadolu Ajansı",
    "publishedAt": "2025-08-20",
    "externalUrl": "https://www.aa.com.tr/en/middle-east/turkish-ngos-continue-uninterrupted-aid-efforts-to-address-food-crisis-in-gaza/3664073"
  },
  {
    "title": "Yeryüzü Doktorları: Dünya izliyor, Gazze yardım bekliyor",
    "source": "İLKHA",
    "publishedAt": "2025-08-19",
    "externalUrl": "https://www.ilkha.com/guncel/yeryuzu-doktorlari-dunya-izliyor-gazze-yardim-bekliyor-474035"
  },
  {
    "title": "Türkiye'deki STK'ler, Gazze'deki gıda krizi için yardımlarını kesintisiz sürdürüyor",
    "source": "Anadolu Ajansı",
    "publishedAt": "2025-08-19",
    "externalUrl": "https://www.aa.com.tr/tr/gundem/turkiyedeki-stkler-gazzedeki-gida-krizi-icin-yardimlarini-kesintisiz-surduruyor/3663313"
  },
  {
    "title": "Yeryüzü Doktorları Gönüllü Sağlık Ekibi Etiyopya'ya gitti",
    "source": "STAR",
    "publishedAt": "2025-08-18",
    "externalUrl": "https://www.star.com.tr/dunya/yeryuzu-doktorlari-gonullu-saglik-ekibi-etiyopyaya-gitti-haber-1960335/"
  },
  {
    "title": "Yeryüzü Doktorları Gönüllü Sağlık Ekibi Etiyopya'ya gitti",
    "source": "AKŞAM",
    "publishedAt": "2025-08-18",
    "externalUrl": "https://www.aksam.com.tr/guncel/yeryuzu-doktorlari-gonullu-saglik-ekibi-etiyopyaya-gitti/haber-1594408"
  },
  {
    "title": "Yeryüzü Doktorları Derneğinin gönüllü sağlık ekibi Etiyopya'ya gitti",
    "source": "MİLLİ GAZETE",
    "publishedAt": "2025-08-16",
    "externalUrl": "https://www.milligazete.com.tr/haber/25968953/yeryuzu-doktorlari-derneginin-gonullu-saglik-ekibi-etiyopyaya-gitti"
  },
  {
    "title": "Gazze'deki açlığa karşı yöneticilere ve uluslararası kuruluşlara baskı kurma çağrısı",
    "source": "İLKHA",
    "publishedAt": "2025-08-09",
    "externalUrl": "https://ilkha.com/roportaj/gazzedeki-acliga-karsi-yoneticilere-ve-uluslararasi-kuruluslara-baski-kurma-cagrisi-472084"
  },
  {
    "title": "Canlı yayında Gazze mesajı: İnsan onurunun yok sayıldığı bir dönem",
    "source": "AKŞAM",
    "publishedAt": "2025-07-29",
    "externalUrl": "https://www.aksam.com.tr/guncel/canli-yayinda-gazze-mesaji-insan-onurunun-yok-sayildigi-bir-donem/haber-1588678"
  },
  {
    "title": "Yeryüzü Doktorları Gönüllü Sağlık Ekibi Etiyopya'ya gitti",
    "source": "GÜNEŞ",
    "publishedAt": "2025-07-18",
    "externalUrl": "https://www.gunes.com/dunya/yeryuzu-doktorlari-gonullu-saglik-ekibi-etiyopyaya-gitti-1221011"
  },
  {
    "title": "Yeryüzü Doktorları Tanzanya'da umut oldu",
    "source": "24 TV",
    "publishedAt": "2025-07-01",
    "externalUrl": "https://www.yirmidort.tv/gundem/yeryuzu-doktorlari-tanzanyada-umut-oldu-236057"
  },
  {
    "title": "Yeryüzü Doktorları gönüllüleri Tanzanya'da sağlık hizmeti verecek",
    "source": "STAR",
    "publishedAt": "2025-07-01",
    "externalUrl": "https://www.star.com.tr/guncel/yeryuzu-doktorlari-gonulluleri-tanzanyada-saglik-hizmeti-verecek-haber-1951501/"
  },
  {
    "title": "Yeryüzü Doktorları gönüllüleri Tanzanya'da sağlık hizmeti verecek",
    "source": "Yeni Şafak",
    "publishedAt": "2025-07-01",
    "externalUrl": "https://www.yenisafak.com/dunya/yeryuzu-doktorlari-gonulluleri-tanzanyada-saglik-hizmeti-verecek-4724128"
  },
  {
    "title": "Yeryüzü Doktorları gönüllü sağlık ekipleri Tanzanya'ya ulaştı",
    "source": "AKŞAM",
    "publishedAt": "2025-07-01",
    "externalUrl": "https://www.aksam.com.tr/guncel/yeryuzu-doktorlari-gonullu-saglik-ekipleri-tanzanyaya-ulasti/haber-1581577"
  },
  {
    "title": "Türk STK'lerin İsrail'in ablukasındaki Gazze'ye kurban seferberliği",
    "source": "Anadolu Ajansı",
    "publishedAt": "2025-06-13",
    "externalUrl": "https://www.aa.com.tr/tr/gundem/turk-stklerin-israilin-ablukasindaki-gazzeye-kurban-seferberligi/3596481"
  },
  {
    "title": "Türkiye'den Gazze'ye Kurban Projeleriyle Yardım Seferberliği",
    "source": "Haberler.com",
    "publishedAt": "2025-06-13",
    "externalUrl": "https://www.haberler.com/guncel/turkiye-den-gazze-ye-kurban-projeleriyle-yardim-seferberligi-18739681-haberi/"
  },
  {
    "title": "Kurban Sevincini Yeryüzü ile Paylaşacaklar",
    "source": "AKŞAM",
    "publishedAt": "2025-06-02",
    "externalUrl": "https://www.aksam.com.tr/guncel/kurban-sevincini-yeryuzu-ile-paylasacaklar/haber-1574327"
  },
  {
    "title": "Kurban Sevincini Yeryüzü ile Paylaşacaklar",
    "source": "STAR",
    "publishedAt": "2025-06-02",
    "externalUrl": "https://www.star.com.tr/guncel/kurban-sevincini-yeryuzu-ile-paylasacaklar-haber-1946654/"
  },
  {
    "title": "Kurban sevincini Yeryüzü ile paylaşacaklar",
    "source": "GÜNEŞ",
    "publishedAt": "2025-06-02",
    "externalUrl": "https://www.gunes.com/gundem/kurban-sevincini-yeryuzu-ile-paylasacaklar-1219161"
  },
  {
    "title": "Yeryüzü Doktorları'ndan 19 ülkede kurban kampanyası: 'Kurban Olsun Sağlık Olsun'",
    "source": "GZT",
    "publishedAt": "2025-05-30",
    "externalUrl": "https://www.gzt.com/jurnalist/yeryuzu-doktorlarindan-19-ulkede-kurban-kampanyasi-kurban-olsun-saglik-olsun-3797023"
  },
  {
    "title": "Kurban sevincini yeryüzü ile paylaşacaklar",
    "source": "HABER 7",
    "publishedAt": "2025-05-30",
    "externalUrl": "https://www.haber7.com/guncel/haber/3534848-kurban-sevincini-yeryuzu-ile-paylasacaklar"
  }
];

async function importMediaCoverage() {
  console.log('🚀 Media Coverage import başlıyor...\n');

  let successCount = 0;
  let errorCount = 0;

  for (const item of mediaCoverageData) {
    try {
      await prisma.mediaCoverage.create({
        data: {
          title: item.title,
          source: item.source,
          sourceType: 'internet',
          externalUrl: item.externalUrl,
          publishedAt: new Date(item.publishedAt),
          isActive: true,
          isFeatured: false,
          displayOrder: 0
        }
      });
      successCount++;
      console.log(`✅ ${successCount}. ${item.title.substring(0, 50)}...`);
    } catch (error) {
      errorCount++;
      console.error(`❌ Hata: ${item.title.substring(0, 30)}... - ${error.message}`);
    }
  }

  console.log(`\n✨ İşlem tamamlandı!`);
  console.log(`✅ Başarılı: ${successCount}`);
  console.log(`❌ Hatalı: ${errorCount}`);
  console.log(`📊 Toplam: ${mediaCoverageData.length}`);

  await prisma.$disconnect();
}

importMediaCoverage().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
