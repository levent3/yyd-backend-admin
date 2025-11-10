# YYD Web API - Frontend Integration Guide

> **API Base URL**: `http://localhost:5000/api` (Development)
> **Production URL**: `https://your-domain.com/api`

Bu doküman, public website için YYD API'sini nasıl kullanacağınızı detaylı şekilde açıklamaktadır.

---

## 📋 İçindekiler

1. [Genel Bilgiler](#genel-bilgiler)
2. [Menü Sistemi](#menü-sistemi)
3. [Hakkımızda Sayfaları](#hakkımızda-sayfaları)
4. [Faaliyet Alanları](#faaliyet-alanları)
5. [Projeler](#projeler)
6. [Haberler](#haberler)
7. [Medya Modülleri](#medya-modülleri)
8. [Ana Sayfa](#ana-sayfa)
9. [Örnek Kullanım Senaryoları](#örnek-kullanım-senaryoları)

---

## Genel Bilgiler

### Authentication
Tüm public endpoint'ler **authentication gerektirmez**. Direkt olarak çağrılabilir.

### Response Format
Tüm endpoint'ler JSON formatında yanıt döner.

### Caching
Public endpoint'ler cache'lenir:
- Menü: 1 saat
- Sayfalar: 1 saat
- Projeler: 30 dakika
- Haberler: 10 dakika
- Galeri: 10 dakika

### Language Support
API çok dilli destek sunar. `language` parametresi ile dil seçebilirsiniz:
- `tr` (Türkçe) - Varsayılan
- `en` (English)
- `ar` (العربية)

---

## Menü Sistemi

### 🔹 Ana Menüyü Getir

```http
GET /api/menu/slug/main-menu/public
```

**Açıklama**: Site header/footer menüsünü hiyerarşik yapıda getirir.

**Response Örneği**:
```json
{
  "id": 1,
  "name": "Ana Menü",
  "slug": "main-menu",
  "location": "header",
  "isActive": true,
  "menuItems": [
    {
      "id": 1,
      "title": "Ana Sayfa",
      "linkType": "custom",
      "customUrl": "/",
      "displayOrder": 1,
      "children": []
    },
    {
      "id": 2,
      "title": "Hakkımızda",
      "linkType": "custom",
      "customUrl": "/hakkimizda",
      "displayOrder": 2,
      "children": [
        {
          "id": 3,
          "title": "Biz Kimiz",
          "linkType": "page",
          "pageId": 1,
          "displayOrder": 1,
          "page": {
            "id": 1,
            "translation": {
              "title": "Biz Kimiz",
              "slug": "biz-kimiz",
              "language": "tr"
            }
          }
        }
      ]
    },
    {
      "id": 10,
      "title": "Faaliyet Alanları",
      "linkType": "custom",
      "customUrl": "/faaliyet-alanlari",
      "displayOrder": 4,
      "children": [
        {
          "id": 11,
          "title": "Beslenme Sağlığı",
          "linkType": "activityArea",
          "activityAreaId": 1,
          "displayOrder": 1,
          "activityArea": {
            "id": 1,
            "translation": {
              "title": "Beslenme Sağlığı",
              "slug": "beslenme-sagligi",
              "language": "tr"
            }
          }
        }
      ]
    },
    {
      "id": 20,
      "title": "Medya",
      "linkType": "custom",
      "customUrl": "/medya",
      "displayOrder": 5,
      "children": [
        {
          "id": 21,
          "title": "Haberler",
          "linkType": "custom",
          "customUrl": "/haberler",
          "displayOrder": 1
        },
        {
          "id": 22,
          "title": "Basında Biz",
          "linkType": "custom",
          "customUrl": "/basinda-biz",
          "displayOrder": 2
        },
        {
          "id": 23,
          "title": "Galeri",
          "linkType": "custom",
          "customUrl": "/galeri",
          "displayOrder": 3
        }
      ]
    }
  ]
}
```

### 📝 Menu Item LinkType'ları ve URL Oluşturma

| linkType | Açıklama | URL Nasıl Oluşturulur |
|----------|----------|----------------------|
| `page` | Hakkımızda sayfaları | `/hakkimizda/{page.translation.slug}` |
| `activityArea` | Faaliyet alanı detayı | `/faaliyet-alanlari/{activityArea.translation.slug}` |
| `project` | Proje detayı | `/projeler/{project.translation.slug}` |
| `news` | Haber detayı | `/haberler/{news.translation.slug}` |
| `custom` | Özel URL (liste sayfaları) | `{customUrl}` (direkt kullan) |
| `external` | Dış link | `{customUrl}` (yeni sekmede aç) |

**Next.js Router Örneği**:
```typescript
const generateMenuUrl = (menuItem: MenuItem): string => {
  switch (menuItem.linkType) {
    case 'page':
      return `/hakkimizda/${menuItem.page.translation.slug}`;

    case 'activityArea':
      return `/faaliyet-alanlari/${menuItem.activityArea.translation.slug}`;

    case 'project':
      return `/projeler/${menuItem.project.translation.slug}`;

    case 'news':
      return `/haberler/${menuItem.news.translation.slug}`;

    case 'custom':
    case 'external':
      return menuItem.customUrl;

    default:
      return '/';
  }
};
```

---

## Hakkımızda Sayfaları

### 🔹 Tüm Sayfaları Listele

```http
GET /api/pages/public
```

**Query Parameters**:
- `pageType` (optional): `about`, `terms`, `privacy`, `faq`, `contact`, `team`, `general`

**Response**:
```json
{
  "pages": [
    {
      "id": 1,
      "pageType": "about",
      "isActive": true,
      "isPublic": true,
      "status": "published",
      "displayOrder": 1,
      "translation": {
        "title": "Biz Kimiz",
        "slug": "biz-kimiz",
        "content": "<p>YYD, 1997 yılında...</p>",
        "excerpt": "Yeryüzü Doktorları kısa açıklama",
        "metaTitle": "Biz Kimiz - Yeryüzü Doktorları",
        "metaDescription": "YYD'nin misyonu ve vizyonu hakkında bilgi",
        "language": "tr"
      },
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-02-20T14:45:00.000Z"
    }
  ],
  "total": 5
}
```

### 🔹 Sayfa Detayı (Slug ile)

```http
GET /api/pages/public/slug/:slug
```

**Örnek**:
```http
GET /api/pages/public/slug/biz-kimiz
```

**Response**:
```json
{
  "id": 1,
  "pageType": "about",
  "translation": {
    "title": "Biz Kimiz",
    "slug": "biz-kimiz",
    "content": "<div class=\"page-content\">...</div>",
    "excerpt": "Yeryüzü Doktorları kısa açıklama",
    "metaTitle": "Biz Kimiz - YYD",
    "metaDescription": "YYD hakkında detaylı bilgi",
    "language": "tr",
    "builderHtml": "...",
    "builderCss": "..."
  },
  "featuredImage": "/uploads/pages/biz-kimiz-banner.jpg",
  "status": "published",
  "isActive": true
}
```

### 🔹 Sayfa Tipine Göre Listele

```http
GET /api/pages/public/type/:pageType
```

**Örnek**:
```http
GET /api/pages/public/type/about
```

---

## Faaliyet Alanları

### 🔹 Tüm Aktif Faaliyet Alanları

```http
GET /api/activity-areas/active
```

**Query Parameters**:
- `page` (default: 1)
- `limit` (default: 10, max: 100)
- `language` (default: tr)

**Response**:
```json
{
  "data": [
    {
      "id": 1,
      "icon": "nutrition",
      "displayOrder": 1,
      "isActive": true,
      "translation": {
        "title": "Beslenme Sağlığı",
        "slug": "beslenme-sagligi",
        "description": "Beslenme ile ilgili sağlık çalışmaları",
        "content": "<p>Beslenme sağlığı programları...</p>",
        "language": "tr"
      },
      "createdAt": "2024-01-10T08:00:00.000Z"
    },
    {
      "id": 2,
      "icon": "eye",
      "displayOrder": 2,
      "isActive": true,
      "translation": {
        "title": "Göz Sağlığı",
        "slug": "goz-sagligi",
        "description": "Göz hizmetleri ve katarakt operasyonları",
        "content": "<p>Göz sağlığı hizmetleri...</p>",
        "language": "tr"
      },
      "createdAt": "2024-01-10T08:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 8,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

### 🔹 Faaliyet Alanı Detayı (Slug ile)

```http
GET /api/activity-areas/slug/:slug
```

**Örnek**:
```http
GET /api/activity-areas/slug/beslenme-sagligi?language=tr
```

**Response**:
```json
{
  "id": 1,
  "icon": "nutrition",
  "displayOrder": 1,
  "isActive": true,
  "translation": {
    "title": "Beslenme Sağlığı",
    "slug": "beslenme-sagligi",
    "description": "Beslenme ile ilgili sağlık çalışmaları",
    "content": "<div>Detaylı içerik...</div>",
    "language": "tr"
  },
  "createdAt": "2024-01-10T08:00:00.000Z",
  "updatedAt": "2024-02-15T10:30:00.000Z"
}
```

---

## Projeler

### 🔹 Tüm Aktif Projeler

```http
GET /api/projects/public
```

**Query Parameters**:
- `page` (default: 1)
- `limit` (default: 10)
- `category` (optional): Kategori filtresi
- `country` (optional): Ülke filtresi
- `isFeatured` (optional): Öne çıkan projeler

**Response**:
```json
{
  "data": [
    {
      "id": 1,
      "shortCode": "YEMEN01",
      "category": "Sağlık",
      "country": "Yemen",
      "location": "Sana'a",
      "status": "active",
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-12-31T00:00:00.000Z",
      "budget": 50000,
      "isFeatured": true,
      "isActive": true,
      "translation": {
        "title": "Yemen Sağlık Merkezi Projesi",
        "slug": "yemen-saglik-merkezi",
        "description": "Yemen'de sağlık merkezi kurulumu",
        "content": "<p>Detaylı proje içeriği...</p>",
        "language": "tr"
      },
      "featuredImage": "/uploads/projects/yemen-health-center.jpg",
      "gallery": [
        {
          "id": 1,
          "imageUrl": "/uploads/gallery/project-1-img-1.jpg",
          "caption": "Sağlık merkezi dış görünüm",
          "displayOrder": 1
        }
      ],
      "createdAt": "2024-01-05T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

### 🔹 Proje Detayı (Slug ile)

```http
GET /api/projects/public/:slug
```

**Örnek**:
```http
GET /api/projects/public/yemen-saglik-merkezi
```

### 🔹 Proje Detayı (Short Code ile)

SMS kampanyaları için kısa kod ile proje detayına erişim:

```http
GET /api/projects/short/:shortCode
```

**Örnek**:
```http
GET /api/projects/short/YEMEN01
```

---

## Haberler

### 🔹 Yayınlanmış Haberler

```http
GET /api/news/published
```

**Query Parameters**:
- `page` (default: 1)
- `limit` (default: 10, max: 100)

**Response**:
```json
{
  "data": [
    {
      "id": 1,
      "category": "Sağlık",
      "status": "published",
      "publishedAt": "2024-03-01T09:00:00.000Z",
      "viewCount": 1250,
      "isActive": true,
      "isFeatured": true,
      "translation": {
        "title": "Yemen'de Yeni Sağlık Merkezi Açıldı",
        "slug": "yemen-yeni-saglik-merkezi",
        "summary": "YYD'nin Yemen'deki yeni sağlık merkezi hizmete başladı",
        "content": "<p>Detaylı haber içeriği...</p>",
        "language": "tr"
      },
      "featuredImage": "/uploads/news/yemen-health-opening.jpg",
      "author": {
        "id": 5,
        "fullName": "Ahmet Yılmaz"
      },
      "createdAt": "2024-02-28T14:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 10,
    "totalPages": 15
  }
}
```

### 🔹 Haber Detayı (Slug ile)

```http
GET /api/news/slug/:slug
```

**Örnek**:
```http
GET /api/news/slug/yemen-yeni-saglik-merkezi
```

---

## Medya Modülleri

### 📷 Galeri

#### Galeri Öğelerini Listele
```http
GET /api/gallery/public
```

**Query Parameters**:
- `page` (default: 1)
- `limit` (default: 10, max: 100)
- `mediaType`: `image` veya `video`
- `projectId` (optional): Proje bazlı filtreleme

**Response**:
```json
{
  "data": [
    {
      "id": 1,
      "mediaType": "image",
      "imageUrl": "/uploads/gallery/event-2024-03-15.jpg",
      "videoUrl": null,
      "caption": "Yemen'de açılış töreni",
      "projectId": 1,
      "displayOrder": 1,
      "isActive": true,
      "project": {
        "id": 1,
        "translation": {
          "title": "Yemen Sağlık Merkezi",
          "slug": "yemen-saglik-merkezi"
        }
      }
    }
  ],
  "pagination": {
    "total": 200,
    "page": 1,
    "limit": 10,
    "totalPages": 20
  }
}
```

---

### 📖 İyileşme Öyküleri

#### Tüm Aktif Öyküler
```http
GET /api/success-stories/public
```

**Response**:
```json
{
  "success": true,
  "message": "Success stories retrieved successfully",
  "data": [
    {
      "id": 1,
      "patientName": "Fatma (Hastanın Gerçek İsmi Gizlenmiştir)",
      "age": 8,
      "location": "Gazze",
      "category": "Sağlık",
      "isFeatured": true,
      "isActive": true,
      "translation": {
        "title": "Fatma'nın Göz Ameliyatı Hikayesi",
        "story": "<p>8 yaşındaki Fatma...</p>",
        "outcome": "Fatma ameliyat sonrası tam olarak iyileşti",
        "language": "tr"
      },
      "beforeImage": "/uploads/stories/fatma-before.jpg",
      "afterImage": "/uploads/stories/fatma-after.jpg",
      "storyDate": "2024-02-15T00:00:00.000Z"
    }
  ]
}
```

#### Öne Çıkan Öyküler
```http
GET /api/success-stories/featured
```

#### Öykü Detayı (Slug ile)
```http
GET /api/success-stories/slug/:slug?language=tr
```

---

### 🎥 Kamu Spotları

#### Tüm Aktif Spotlar
```http
GET /api/public-spots/public?language=tr
```

**Response**:
```json
{
  "success": true,
  "message": "Public spots retrieved successfully",
  "data": [
    {
      "id": 1,
      "videoUrl": "https://www.youtube.com/watch?v=abc123",
      "videoType": "youtube",
      "thumbnailUrl": "/uploads/spots/health-campaign-thumb.jpg",
      "duration": 180,
      "category": "Sağlık",
      "viewCount": 5420,
      "isActive": true,
      "isFeatured": true,
      "displayOrder": 1,
      "publishedAt": "2024-03-01T00:00:00.000Z",
      "translation": {
        "title": "Sağlık Kampanyası 2024",
        "description": "YYD'nin sağlık çalışmalarını anlatan video",
        "language": "tr"
      }
    }
  ]
}
```

#### Öne Çıkan Spotlar
```http
GET /api/public-spots/featured?language=tr
```

#### Kategoriye Göre Spotlar
```http
GET /api/public-spots/category/:category?language=tr
```

#### Görüntülenme Sayısını Artır
```http
POST /api/public-spots/:id/view
```

---

### 📄 Broşürler

#### Tüm Aktif Broşürler
```http
GET /api/brochures/public?language=tr
```

**Response**:
```json
{
  "success": true,
  "message": "Brochures retrieved successfully",
  "data": [
    {
      "id": 1,
      "pdfUrl": "/uploads/brochures/yyd-catalog-2024.pdf",
      "category": "Genel",
      "thumbnailUrl": "/uploads/brochures/yyd-catalog-2024-thumb.jpg",
      "fileSize": 2048000,
      "isActive": true,
      "displayOrder": 1,
      "translation": {
        "title": "YYD 2024 Kataloğu",
        "description": "YYD'nin 2024 yılı faaliyetlerini içeren katalog",
        "language": "tr"
      }
    }
  ]
}
```

#### Kategoriye Göre Broşürler
```http
GET /api/brochures/category/:category?language=tr
```

---

### 🎨 Kurumsal Kimlik (Brand Assets)

#### Dosya Tipine Göre Getir
```http
GET /api/brand-assets/type/:fileType
```

**fileType değerleri**:
- `logo`: Logo dosyaları
- `brand_guide`: Marka kılavuzları
- `color_palette`: Renk paletleri
- `font`: Font dosyaları

**Örnek**:
```http
GET /api/brand-assets/type/logo
```

**Response**:
```json
{
  "success": true,
  "message": "Brand assets retrieved successfully",
  "data": [
    {
      "id": 1,
      "fileName": "YYD Logo Türkçe",
      "fileType": "logo",
      "fileUrl": "/uploads/brand/yyd-logo-tr.pdf",
      "thumbnailUrl": "/uploads/brand/yyd-logo-tr-thumb.png",
      "fileSize": 524288,
      "language": "tr",
      "version": "v2.0",
      "description": "Türkçe logomuz - PDF formatında",
      "isActive": true,
      "displayOrder": 1
    }
  ]
}
```

---

### 📰 Basında Biz

#### Tüm Medya Haberleri
```http
GET /api/media-coverage/public
```

#### Öne Çıkan Haberler
```http
GET /api/media-coverage/featured
```

---

## Ana Sayfa

### 🎬 Slider'ları Getir

```http
GET /api/homepage/sliders/public
```

**Response**:
```json
{
  "data": [
    {
      "id": 1,
      "imageUrl": "/uploads/sliders/hero-image-1.jpg",
      "mobileImageUrl": "/uploads/sliders/hero-image-1-mobile.jpg",
      "linkUrl": "/projeler/yemen-saglik-merkezi",
      "linkType": "internal",
      "displayOrder": 1,
      "isActive": true,
      "translation": {
        "title": "Yemen'de Umut Oluyoruz",
        "subtitle": "Sağlık hizmetlerinde yanınızdayız",
        "buttonText": "Detaylı Bilgi",
        "language": "tr"
      }
    }
  ]
}
```

### 📊 Site İstatistikleri

```http
GET /api/homepage/statistics/public
```

**Response**:
```json
{
  "id": 1,
  "projectsCompleted": 450,
  "peopleHelped": 125000,
  "countriesServed": 35,
  "volunteersActive": 850,
  "translation": {
    "projectsLabel": "Tamamlanan Proje",
    "peopleLabel": "Yardım Edilen İnsan",
    "countriesLabel": "Hizmet Verilen Ülke",
    "volunteersLabel": "Aktif Gönüllü",
    "language": "tr"
  },
  "updatedAt": "2024-03-15T10:00:00.000Z"
}
```

---

## Örnek Kullanım Senaryoları

### Senaryo 1: Ana Menüyü Render Etmek

```typescript
// services/menuService.ts
export async function getMainMenu(language: string = 'tr') {
  const response = await fetch(`${API_BASE_URL}/menu/slug/main-menu/public`);
  return response.json();
}

// components/Header.tsx
import { useEffect, useState } from 'react';
import { getMainMenu } from '@/services/menuService';

export default function Header() {
  const [menu, setMenu] = useState(null);

  useEffect(() => {
    getMainMenu('tr').then(setMenu);
  }, []);

  const renderMenuItem = (item: MenuItem) => {
    const url = generateMenuUrl(item);
    const isExternal = item.linkType === 'external';

    return (
      <li key={item.id}>
        <Link
          href={url}
          target={item.target || '_self'}
          className={item.cssClass}
        >
          {item.icon && <i className={item.icon} />}
          {item.title}
        </Link>

        {item.children && item.children.length > 0 && (
          <ul className="dropdown">
            {item.children.map(renderMenuItem)}
          </ul>
        )}
      </li>
    );
  };

  return (
    <nav>
      <ul>
        {menu?.menuItems?.map(renderMenuItem)}
      </ul>
    </nav>
  );
}
```

---

### Senaryo 2: "Biz Kimiz" Sayfasını Göstermek

```typescript
// pages/hakkimizda/[slug].tsx
import { GetStaticProps, GetStaticPaths } from 'next';

export const getStaticPaths: GetStaticPaths = async () => {
  // Tüm about sayfalarını çek
  const response = await fetch(`${API_BASE_URL}/pages/public?pageType=about`);
  const data = await response.json();

  const paths = data.pages.map((page: any) => ({
    params: { slug: page.translation.slug }
  }));

  return { paths, fallback: 'blocking' };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string;

  const response = await fetch(`${API_BASE_URL}/pages/public/slug/${slug}`);

  if (!response.ok) {
    return { notFound: true };
  }

  const page = await response.json();

  return {
    props: { page },
    revalidate: 3600 // 1 saat sonra revalidate
  };
};

export default function AboutPage({ page }: { page: any }) {
  return (
    <div>
      <h1>{page.translation.title}</h1>

      {page.featuredImage && (
        <img src={page.featuredImage} alt={page.translation.title} />
      )}

      {/* GrapesJS ile oluşturulmuş HTML */}
      {page.translation.builderHtml && (
        <>
          <style dangerouslySetInnerHTML={{ __html: page.translation.builderCss }} />
          <div dangerouslySetInnerHTML={{ __html: page.translation.builderHtml }} />
        </>
      )}

      {/* Fallback: Normal content */}
      {!page.translation.builderHtml && (
        <div dangerouslySetInnerHTML={{ __html: page.translation.content }} />
      )}
    </div>
  );
}
```

---

### Senaryo 3: Faaliyet Alanları Liste ve Detay

```typescript
// pages/faaliyet-alanlari/index.tsx
export const getStaticProps: GetStaticProps = async () => {
  const response = await fetch(
    `${API_BASE_URL}/activity-areas/active?limit=100&language=tr`
  );
  const data = await response.json();

  return {
    props: { activityAreas: data.data },
    revalidate: 600 // 10 dakika
  };
};

export default function ActivityAreasPage({ activityAreas }: any) {
  return (
    <div className="activity-areas-grid">
      {activityAreas.map((area: any) => (
        <Link
          key={area.id}
          href={`/faaliyet-alanlari/${area.translation.slug}`}
        >
          <div className="activity-card">
            <i className={`icon-${area.icon}`} />
            <h3>{area.translation.title}</h3>
            <p>{area.translation.description}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

// pages/faaliyet-alanlari/[slug].tsx
export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string;

  const response = await fetch(
    `${API_BASE_URL}/activity-areas/slug/${slug}?language=tr`
  );

  if (!response.ok) {
    return { notFound: true };
  }

  const area = await response.json();

  return {
    props: { area },
    revalidate: 600
  };
};

export default function ActivityAreaDetailPage({ area }: any) {
  return (
    <div>
      <h1>{area.translation.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: area.translation.content }} />
    </div>
  );
}
```

---

### Senaryo 4: Projeler Liste ve Detay

```typescript
// pages/projeler/index.tsx
export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const loadProjects = async () => {
    setLoading(true);
    const response = await fetch(
      `${API_BASE_URL}/projects/public?page=${page}&limit=12`
    );
    const data = await response.json();
    setProjects(prev => [...prev, ...data.data]);
    setLoading(false);
  };

  useEffect(() => {
    loadProjects();
  }, [page]);

  return (
    <div>
      <h1>Projelerimiz</h1>

      <div className="projects-grid">
        {projects.map((project: any) => (
          <Link
            key={project.id}
            href={`/projeler/${project.translation.slug}`}
          >
            <div className="project-card">
              <img src={project.featuredImage} alt={project.translation.title} />
              <h3>{project.translation.title}</h3>
              <p>{project.translation.description}</p>
              <span className="category">{project.category}</span>
              <span className="location">{project.location}</span>
            </div>
          </Link>
        ))}
      </div>

      <button onClick={() => setPage(p => p + 1)} disabled={loading}>
        Daha Fazla Yükle
      </button>
    </div>
  );
}

// pages/projeler/[slug].tsx
export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string;

  const response = await fetch(`${API_BASE_URL}/projects/public/${slug}`);

  if (!response.ok) {
    return { notFound: true };
  }

  const project = await response.json();

  return {
    props: { project },
    revalidate: 1800 // 30 dakika
  };
};

export default function ProjectDetailPage({ project }: any) {
  return (
    <div>
      <h1>{project.translation.title}</h1>

      {/* Featured Image */}
      <img src={project.featuredImage} alt={project.translation.title} />

      {/* Project Info */}
      <div className="project-meta">
        <span>Kategori: {project.category}</span>
        <span>Lokasyon: {project.location}</span>
        <span>Durum: {project.status}</span>
        {project.budget && <span>Bütçe: ${project.budget}</span>}
      </div>

      {/* Project Content */}
      <div dangerouslySetInnerHTML={{ __html: project.translation.content }} />

      {/* Gallery */}
      {project.gallery && project.gallery.length > 0 && (
        <div className="project-gallery">
          <h2>Proje Galerisi</h2>
          <div className="gallery-grid">
            {project.gallery.map((item: any) => (
              <div key={item.id} className="gallery-item">
                <img src={item.imageUrl} alt={item.caption} />
                {item.caption && <p>{item.caption}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Donation Button (shortCode ile) */}
      <a href={`/bagis?proje=${project.shortCode}`} className="donate-btn">
        Bu Projeye Bağış Yap
      </a>
    </div>
  );
}
```

---

### Senaryo 5: Medya Modülü - Haberler

```typescript
// pages/haberler/index.tsx
export default function NewsPage() {
  const [news, setNews] = useState([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetch(`${API_BASE_URL}/news/published?page=${page}&limit=10`)
      .then(res => res.json())
      .then(data => setNews(prev => [...prev, ...data.data]));
  }, [page]);

  return (
    <div>
      <h1>Haberler</h1>

      <div className="news-list">
        {news.map((article: any) => (
          <Link key={article.id} href={`/haberler/${article.translation.slug}`}>
            <article className="news-card">
              <img src={article.featuredImage} alt={article.translation.title} />
              <div className="news-content">
                <span className="category">{article.category}</span>
                <h3>{article.translation.title}</h3>
                <p>{article.translation.summary}</p>
                <time>{new Date(article.publishedAt).toLocaleDateString('tr-TR')}</time>
              </div>
            </article>
          </Link>
        ))}
      </div>

      <button onClick={() => setPage(p => p + 1)}>
        Daha Fazla Haber
      </button>
    </div>
  );
}
```

---

### Senaryo 6: Ana Sayfa

```typescript
// pages/index.tsx
export const getStaticProps: GetStaticProps = async () => {
  // Paralel olarak tüm verileri çek
  const [sliders, stats, featuredProjects, latestNews, activityAreas] = await Promise.all([
    fetch(`${API_BASE_URL}/homepage/sliders/public`).then(r => r.json()),
    fetch(`${API_BASE_URL}/homepage/statistics/public`).then(r => r.json()),
    fetch(`${API_BASE_URL}/projects/public?isFeatured=true&limit=3`).then(r => r.json()),
    fetch(`${API_BASE_URL}/news/published?limit=6`).then(r => r.json()),
    fetch(`${API_BASE_URL}/activity-areas/active?limit=8`).then(r => r.json())
  ]);

  return {
    props: {
      sliders: sliders.data,
      stats,
      featuredProjects: featuredProjects.data,
      latestNews: latestNews.data,
      activityAreas: activityAreas.data
    },
    revalidate: 600 // 10 dakika
  };
};

export default function HomePage({
  sliders,
  stats,
  featuredProjects,
  latestNews,
  activityAreas
}: any) {
  return (
    <div>
      {/* Hero Slider */}
      <Swiper>
        {sliders.map((slide: any) => (
          <SwiperSlide key={slide.id}>
            <div className="hero-slide">
              <img src={slide.imageUrl} alt={slide.translation.title} />
              <div className="hero-content">
                <h1>{slide.translation.title}</h1>
                <p>{slide.translation.subtitle}</p>
                {slide.linkUrl && (
                  <Link href={slide.linkUrl}>
                    {slide.translation.buttonText}
                  </Link>
                )}
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Site Statistics */}
      <section className="statistics">
        <div className="stat-item">
          <span className="number">{stats.projectsCompleted}</span>
          <span className="label">{stats.translation.projectsLabel}</span>
        </div>
        <div className="stat-item">
          <span className="number">{stats.peopleHelped.toLocaleString()}</span>
          <span className="label">{stats.translation.peopleLabel}</span>
        </div>
        <div className="stat-item">
          <span className="number">{stats.countriesServed}</span>
          <span className="label">{stats.translation.countriesLabel}</span>
        </div>
        <div className="stat-item">
          <span className="number">{stats.volunteersActive}</span>
          <span className="label">{stats.translation.volunteersLabel}</span>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="featured-projects">
        <h2>Öne Çıkan Projeler</h2>
        <div className="projects-grid">
          {featuredProjects.map((project: any) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </section>

      {/* Activity Areas */}
      <section className="activity-areas">
        <h2>Faaliyet Alanlarımız</h2>
        <div className="areas-grid">
          {activityAreas.map((area: any) => (
            <ActivityAreaCard key={area.id} area={area} />
          ))}
        </div>
      </section>

      {/* Latest News */}
      <section className="latest-news">
        <h2>Son Haberler</h2>
        <div className="news-grid">
          {latestNews.map((article: any) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      </section>
    </div>
  );
}
```

---

## 🔧 Yardımcı TypeScript Tipleri

```typescript
// types/api.ts

export interface Menu {
  id: number;
  name: string;
  slug: string;
  location: 'header' | 'footer' | 'sidebar' | 'mobile';
  isActive: boolean;
  menuItems: MenuItem[];
}

export interface MenuItem {
  id: number;
  menuId: number;
  parentId?: number;
  title: string;
  linkType: 'page' | 'project' | 'news' | 'activityArea' | 'custom' | 'external';
  pageId?: number;
  projectId?: number;
  newsId?: number;
  activityAreaId?: number;
  customUrl?: string;
  icon?: string;
  cssClass?: string;
  target: '_self' | '_blank';
  displayOrder: number;
  isActive: boolean;
  children?: MenuItem[];
  page?: ContentItem;
  project?: ContentItem;
  news?: ContentItem;
  activityArea?: ContentItem;
}

export interface ContentItem {
  id: number;
  translation: {
    title: string;
    slug: string;
    language: string;
  };
}

export interface Page {
  id: number;
  pageType: 'about' | 'terms' | 'privacy' | 'faq' | 'contact' | 'team' | 'general';
  status: 'draft' | 'published';
  isPublic: boolean;
  isActive: boolean;
  displayOrder: number;
  featuredImage?: string;
  translation: {
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    metaTitle?: string;
    metaDescription?: string;
    language: string;
    builderHtml?: string;
    builderCss?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ActivityArea {
  id: number;
  icon: string;
  displayOrder: number;
  isActive: boolean;
  translation: {
    title: string;
    slug: string;
    description: string;
    content: string;
    language: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: number;
  shortCode: string;
  category: string;
  country: string;
  location: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
  startDate: string;
  endDate?: string;
  budget?: number;
  isFeatured: boolean;
  isActive: boolean;
  featuredImage?: string;
  translation: {
    title: string;
    slug: string;
    description: string;
    content: string;
    language: string;
  };
  gallery?: GalleryItem[];
  createdAt: string;
  updatedAt: string;
}

export interface GalleryItem {
  id: number;
  imageUrl: string;
  caption?: string;
  displayOrder: number;
}

export interface News {
  id: number;
  category: string;
  status: 'draft' | 'published';
  publishedAt: string;
  viewCount: number;
  isActive: boolean;
  isFeatured: boolean;
  featuredImage?: string;
  translation: {
    title: string;
    slug: string;
    summary: string;
    content: string;
    language: string;
  };
  author?: {
    id: number;
    fullName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
```

---

## 📚 Ek Kaynaklar

- **Swagger UI**: `http://localhost:5000/api-docs` (Tüm endpoint'leri test edebilirsiniz)
- **Deployment Guide**: `DEPLOYMENT.md` (Production'a deploy için)
- **Database Schema**: `prisma/schema.prisma` (Veri modelleri)

---

## ❓ Sık Sorulan Sorular

### 1. Menüdeki customUrl hangi sayfalara yönlendiriyor?

**Cevap**: `customUrl` değerleri liste sayfalarına yönlendirir:
- `/haberler` → Haberler liste sayfası
- `/basinda-biz` → Basında Biz liste sayfası
- `/galeri` → Galeri liste sayfası
- `/iyilesme-oykuleri` → İyileşme Öyküleri liste sayfası
- `/kamu-spotlari` → Kamu Spotları liste sayfası
- `/brosurler` → Broşürler liste sayfası
- `/kurumsal-kimlik` → Kurumsal Kimlik sayfası

Bu sayfaları frontend'de oluşturmanız ve ilgili endpoint'lerden verileri çekmeniz gerekiyor.

### 2. Detay sayfaları için URL nasıl oluşturulur?

**Cevap**: Detay sayfaları slug-based routing kullanır:
- Sayfa: `/hakkimizda/{slug}` → `/api/pages/public/slug/{slug}`
- Faaliyet Alanı: `/faaliyet-alanlari/{slug}` → `/api/activity-areas/slug/{slug}`
- Proje: `/projeler/{slug}` → `/api/projects/public/{slug}`
- Haber: `/haberler/{slug}` → `/api/news/slug/{slug}`

### 3. Çoklu dil desteği nasıl çalışır?

**Cevap**: API, her içerik için `translation` objesi döner. `language` query parametresi ile dil seçebilirsiniz:
```
/api/pages/public/slug/biz-kimiz?language=en
/api/activity-areas/active?language=ar
```

### 4. Pagination nasıl çalışır?

**Cevap**: Tüm liste endpoint'leri `page` ve `limit` parametrelerini destekler:
```
/api/news/published?page=2&limit=10
/api/projects/public?page=1&limit=12
```

Response'da `pagination` objesi döner:
```json
{
  "data": [...],
  "pagination": {
    "total": 150,
    "page": 2,
    "limit": 10,
    "totalPages": 15
  }
}
```

### 5. Cache nasıl yönetilir?

**Cevap**: Public endpoint'ler otomatik olarak cache'lenir. Next.js ISR (Incremental Static Regeneration) kullanarak `revalidate` değeri ekleyebilirsiniz:

```typescript
export const getStaticProps: GetStaticProps = async () => {
  // ...
  return {
    props: { data },
    revalidate: 600 // 10 dakikada bir revalidate
  };
};
```

---

## 🎯 Özet Checklist

Frontend geliştirme için yapılması gerekenler:

- [ ] Ana menüyü çek ve render et (`/api/menu/slug/main-menu/public`)
- [ ] Menü item URL'lerini doğru oluştur (linkType'a göre)
- [ ] Ana sayfa slider ve istatistikleri göster
- [ ] Hakkımızda sayfalarını slug ile çek
- [ ] Faaliyet alanları liste ve detay sayfalarını oluştur
- [ ] Projeler liste ve detay sayfalarını oluştur
- [ ] Haberler liste ve detay sayfalarını oluştur
- [ ] Medya modülleri için liste sayfaları oluştur:
  - [ ] Basında Biz
  - [ ] Galeri
  - [ ] İyileşme Öyküleri
  - [ ] Kamu Spotları
  - [ ] Broşürler
  - [ ] Kurumsal Kimlik
- [ ] Çoklu dil desteği ekle
- [ ] SEO için meta tag'leri kullan
- [ ] Loading states ve error handling ekle
- [ ] Pagination implementasyonu yap

---

**Hazırlayan**: YYD Backend Team
**Tarih**: 2024-03-20
**Versiyon**: 1.0.0

---

## 📞 Destek

Herhangi bir sorunuz varsa backend ekibiyle iletişime geçin.

**API Documentation**: http://localhost:5000/api-docs
