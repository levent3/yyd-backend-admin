# Windows Docker Volume Sync Issue - Çözüm Dokümanı

## Problem Nedir?

Windows'ta Docker Desktop kullanırken, host makinedeki dosya değişiklikleri bazen container içine otomatik olarak senkronize olmaz. Bu durum özellikle şu senaryolarda görülür:

1. **Prisma schema değişiklikleri**: `prisma/schema.prisma` dosyasına yeni model eklediğinizde
2. **Yeni route dosyaları**: `src/api/modules/` altına yeni modül klasörleri eklediğinizde
3. **Seed dosyası güncellemeleri**: `prisma/seed-modules.js` gibi dosyalarda değişiklik yaptığınızda

## Neden Oluyor?

Windows Docker Desktop, Linux container'lar ile Windows dosya sistemi arasında bir köprü kurarak çalışır. Bu köprü bazen gecikme yaşar veya bazı dosya değişikliklerini görmez. Bu, Docker'ın Windows'a özgü bir limitasyonudur ve production ortamında (Linux sunucularda) **GERÇEKLEŞMEZ**.

## Nasıl Anlaşılır?

Eğer şu belirtileri görüyorsanız, bu sorunla karşılaşmışsınız demektir:

```bash
# 1. API'de 500 hatası: "Cannot read properties of undefined (reading 'findMany')"
# 2. Yeni route'lar 404 hatası veriyor
# 3. Host'ta dosya var ama container içinde yok veya eski versiyonu var
```

## Çözüm Adımları

### Yeni Modül Eklerken (Bankalar, BIN Kodları vb.)

#### 1. Schema Değişikliği Sonrası

```bash
# Schema dosyasını container'a kopyala
docker cp prisma/schema.prisma yyd_web_backend-api-1:/usr/src/app/prisma/schema.prisma

# Prisma Client'i yeniden oluştur
docker-compose exec -T api npx prisma generate

# Container'ı yeniden başlat (temiz başlangıç için)
docker-compose restart api
```

#### 2. Yeni Route Modülleri Ekledikten Sonra

```bash
# Yeni modül klasörünü kopyala (örnek: banks)
docker cp src/api/modules/banks yyd_web_backend-api-1:/usr/src/app/src/api/modules/

# Yeni modül klasörünü kopyala (örnek: bin-codes)
docker cp src/api/modules/bin-codes yyd_web_backend-api-1:/usr/src/app/src/api/modules/

# app.js güncellendiyse onu da kopyala
docker cp src/app.js yyd_web_backend-api-1:/usr/src/app/src/app.js

# API'yi yeniden başlat
docker-compose restart api
```

#### 3. Seed Dosyası Güncellemesi

```bash
# Seed dosyasını kopyala
docker cp prisma/seed-modules.js yyd_web_backend-api-1:/usr/src/app/prisma/seed-modules.js

# Seed'i çalıştır
docker-compose exec -T api npx prisma db seed
```

### Doğrulama Komutları

```bash
# 1. Dosyanın container içinde olup olmadığını kontrol et
docker-compose exec -T api cat prisma/schema.prisma | tail -n 30

# 2. Prisma Client'in yeni modelleri tanıyıp tanımadığını test et
docker-compose exec -T api node test-prisma-models.js

# 3. API loglarını kontrol et
docker-compose logs --tail=20 api

# 4. Belirli bir hatayı ara
docker-compose logs api | grep -E "(error|Error|500)"
```

## Kalıcı Çözüm (Gelecekte Bu Sorunu Önlemek İçin)

### Yeni Modül Ekleme Checklist

Her yeni modül eklediğinizde bu adımları takip edin:

- [ ] 1. Prisma schema'ya modeli ekle
- [ ] 2. Migration oluştur: `npx prisma migrate dev --name add_xyz`
- [ ] 3. **Schema'yı container'a kopyala** (Windows için)
- [ ] 4. **Prisma generate çalıştır** (container içinde)
- [ ] 5. Backend repository, service, controller, routes oluştur
- [ ] 6. **Yeni modül klasörünü container'a kopyala** (Windows için)
- [ ] 7. app.js'e route'u ekle
- [ ] 8. **app.js'i container'a kopyala** (Windows için)
- [ ] 9. **Container'ı restart et**
- [ ] 10. Frontend service ve sayfaları oluştur
- [ ] 11. Seed dosyasına modül ekle
- [ ] 12. **Seed dosyasını container'a kopyala** (Windows için)
- [ ] 13. useDynamicMenu'de path ve categoryMap'i güncelle
- [ ] 14. Test et ve commit yap

### Script Oluşturma (Opsiyonel)

Bu süreci otomatikleştirmek için bir PowerShell script'i oluşturabilirsiniz:

```powershell
# sync-to-docker.ps1
param(
    [string]$target = "all"
)

$container = "yyd_web_backend-api-1"

if ($target -eq "all" -or $target -eq "schema") {
    Write-Host "Copying schema.prisma..." -ForegroundColor Green
    docker cp prisma/schema.prisma ${container}:/usr/src/app/prisma/schema.prisma
    docker-compose exec -T api npx prisma generate
}

if ($target -eq "all" -or $target -eq "routes") {
    Write-Host "Copying routes..." -ForegroundColor Green
    docker cp src/app.js ${container}:/usr/src/app/src/app.js
    docker cp src/api/modules ${container}:/usr/src/app/src/api/
}

if ($target -eq "all" -or $target -eq "seed") {
    Write-Host "Copying seed files..." -ForegroundColor Green
    docker cp prisma/seed-modules.js ${container}:/usr/src/app/prisma/seed-modules.js
}

Write-Host "Restarting API..." -ForegroundColor Yellow
docker-compose restart api
Write-Host "Done!" -ForegroundColor Green
```

Kullanımı:
```powershell
# Hepsini senkronize et
.\sync-to-docker.ps1

# Sadece schema'yı senkronize et
.\sync-to-docker.ps1 -target schema

# Sadece route'ları senkronize et
.\sync-to-docker.ps1 -target routes
```

## Önemli Notlar

1. **Production'da bu sorun yoktur**: Linux sunucularda Docker volume sync mükemmel çalışır.
2. **Her deployment'ta migration çalışır**: `prisma migrate deploy` komutu production'da otomatik çalışır.
3. **Sadece development ortamında**: Bu workaround sadece Windows development ortamında gereklidir.
4. **Git'e eklenecek dosyalar**: Sadece kaynak kodları commit edin, container içindeki dosyaları değil.

## Son Eklenen Modül: Banks & BIN Codes (05.11.2024)

Bu modüllerde yaşanan sorun ve çözümü:

**Sorun**:
- Schema'ya Bank ve BinCode modelleri eklendi ama container içinde yoktu
- Prisma Client bank ve binCode modellerini tanımıyordu
- API'de 500 hatası: "Cannot read properties of undefined (reading 'findMany')"

**Kök Neden**:
- Windows Docker volume sync gecikmesi
- schema.prisma dosyası container'a senkronize olmamış
- Prisma generate eski schema ile çalışmış

**Çözüm**:
```bash
docker cp prisma/schema.prisma yyd_web_backend-api-1:/usr/src/app/prisma/schema.prisma
docker-compose exec -T api npx prisma generate
docker-compose restart api
```

Bu işlem sonrası Prisma Client bank ve binCode modellerini tanıdı ve API'ler çalışmaya başladı.
