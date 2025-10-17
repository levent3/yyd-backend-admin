// src/config/multer.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Uploads klasörünü oluştur
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Proje görselleri için klasör
const projectImagesDir = path.join(uploadDir, 'projects');
if (!fs.existsSync(projectImagesDir)) {
  fs.mkdirSync(projectImagesDir, { recursive: true });
}

// Storage yapılandırması
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Dosya türüne göre farklı klasörler
    if (req.baseUrl.includes('/projects')) {
      cb(null, projectImagesDir);
    } else {
      cb(null, uploadDir);
    }
  },
  filename: function (req, file, cb) {
    // Benzersiz dosya adı oluştur: timestamp-random-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);

    // Türkçe karakterleri düzelt
    const sanitizedName = nameWithoutExt
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 30);

    cb(null, `${sanitizedName}-${uniqueSuffix}${ext}`);
  }
});

// Dosya filtresi (sadece görseller)
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Sadece görsel dosyaları yüklenebilir! (JPEG, PNG, GIF, WebP)'), false);
  }
};

// Multer yapılandırması
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB maksimum dosya boyutu
  }
});

module.exports = upload;
