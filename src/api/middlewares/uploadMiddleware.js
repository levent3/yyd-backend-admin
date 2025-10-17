const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Uploads klasörünü oluştur
const uploadsDir = path.join(__dirname, '../../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Storage ayarları
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Benzersiz dosya adı oluştur: timestamp-randomstring.extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// Dosya filtreleme
const fileFilter = (req, file, cb) => {
  // İzin verilen dosya tipleri
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const allowedVideoTypes = /mp4|avi|mov|webm/;
  const allowedDocTypes = /pdf|doc|docx/;

  const extname = path.extname(file.originalname).toLowerCase();
  const isImage = allowedImageTypes.test(extname) && file.mimetype.startsWith('image/');
  const isVideo = allowedVideoTypes.test(extname) && file.mimetype.startsWith('video/');
  const isDoc = allowedDocTypes.test(extname);

  if (isImage || isVideo || isDoc) {
    // Dosya boyutu kontrolü (mimetype'a göre)
    if (isImage && file.size > 10 * 1024 * 1024) { // 10MB resim için
      return cb(new Error('Resim dosyası çok büyük! Maksimum 10MB olmalıdır.'));
    }
    if (isVideo && file.size > 100 * 1024 * 1024) { // 100MB video için
      return cb(new Error('Video dosyası çok büyük! Maksimum 100MB olmalıdır.'));
    }
    return cb(null, true);
  } else {
    cb(new Error('Desteklenmeyen dosya tipi! Sadece resim (JPG, PNG, GIF, WebP), video (MP4, AVI, MOV) ve belge (PDF, DOC) dosyaları yüklenebilir.'));
  }
};

// Multer konfigürasyonu
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB max dosya boyutu (video için)
  },
  fileFilter: fileFilter
});

// Export multer instance'ları
module.exports = {
  single: (fieldName) => upload.single(fieldName),
  multiple: (fieldName, maxCount) => upload.array(fieldName, maxCount),
  fields: (fields) => upload.fields(fields)
};
