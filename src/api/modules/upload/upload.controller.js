const path = require('path');
const sharp = require('sharp');
const fs = require('fs');

// Resim optimizasyonu fonksiyonu
const optimizeImage = async (filePath, mimetype) => {
  try {
    // Sadece resimler için optimizasyon yap
    if (!mimetype.startsWith('image/')) {
      return null;
    }

    const fileDir = path.dirname(filePath);
    const fileName = path.basename(filePath);
    const nameWithoutExt = path.parse(fileName).name;

    // Optimized ve thumbnail dosya yolları
    const optimizedPath = path.join(fileDir, `${nameWithoutExt}-optimized.webp`);
    const thumbnailPath = path.join(fileDir, `${nameWithoutExt}-thumb.webp`);

    // Ana resmi optimize et - max 1920px genişlik, WebP formatı
    await sharp(filePath)
      .resize(1920, null, {
        withoutEnlargement: true, // Küçük resimleri büyütme
        fit: 'inside'
      })
      .webp({ quality: 85 }) // WebP formatı, %85 kalite
      .toFile(optimizedPath);

    // Thumbnail oluştur - 400x300px
    await sharp(filePath)
      .resize(400, 300, {
        fit: 'cover',
        position: 'center'
      })
      .webp({ quality: 80 })
      .toFile(thumbnailPath);

    // Orijinal dosyayı sil (optimized versiyonu kullanacağız)
    fs.unlinkSync(filePath);

    return {
      optimizedFileName: path.basename(optimizedPath),
      thumbnailFileName: path.basename(thumbnailPath)
    };
  } catch (error) {
    console.error('Resim optimizasyonu hatası:', error);
    return null;
  }
};

// POST /api/upload/image - Single image upload
const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Dosya yüklenmedi' });
    }

    const filePath = req.file.path;
    const baseUrl = process.env.BASE_URL || 'http://localhost:5001';
    let fileUrl = `${baseUrl}/uploads/${req.file.filename}`;
    let thumbnailUrl = null;

    // Resim ise optimize et
    if (req.file.mimetype.startsWith('image/')) {
      const optimized = await optimizeImage(filePath, req.file.mimetype);

      if (optimized) {
        fileUrl = `${baseUrl}/uploads/${optimized.optimizedFileName}`;
        thumbnailUrl = `${baseUrl}/uploads/${optimized.thumbnailFileName}`;
      }
    }

    res.status(200).json({
      message: 'Dosya başarıyla yüklendi',
      fileUrl,
      thumbnailUrl,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimeType: req.file.mimetype
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/upload/images - Multiple images upload
const uploadImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Dosyalar yüklenmedi' });
    }

    const baseUrl = process.env.BASE_URL || 'http://localhost:5001';
    const files = req.files.map(file => ({
      fileUrl: `${baseUrl}/uploads/${file.filename}`,
      fileName: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype
    }));

    res.status(200).json({
      message: `${files.length} dosya başarıyla yüklendi`,
      files
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/upload/:filename - Delete uploaded file
const deleteFile = async (req, res, next) => {
  try {
    const fs = require('fs');
    const filePath = path.join(__dirname, '../../../../uploads', req.params.filename);

    // Dosya var mı kontrol et
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Dosya bulunamadı' });
    }

    // Dosyayı sil
    fs.unlinkSync(filePath);

    res.status(200).json({ message: 'Dosya silindi' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadImage,
  uploadImages,
  deleteFile
};
