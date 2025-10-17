// src/api/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const config = require('../../config');

const authMiddleware = (req, res, next) => {
  try {
    let token;

    // 1. Önce cookie'den token'ı kontrol et (frontend için)
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    // 2. Cookie'de yoksa Authorization header'dan al (Swagger/Postman için)
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Token bulunamadıysa hata fırlat
    if (!token) {
      const error = new Error('Yetkilendirme başarısız: Token bulunamadı.');
      error.statusCode = 401; // Unauthorized
      throw error;
    }

    // 2. Token'ı doğrula
    const decodedToken = jwt.verify(token, config.jwt.secret);

    // 3. Doğrulanmış kullanıcı bilgilerini isteğe (request) ekle
    // Bu sayede sonraki controller'lar bu bilgiye erişebilir
    req.user = { userId: decodedToken.userId, roleId: decodedToken.roleId };

    // 4. Her şey yolundaysa, bir sonraki adıma geç
    next();
  } catch (error) {
    // Token geçersizse veya başka bir hata olursa...
    if (!error.statusCode) {
      error.statusCode = 401; // Unauthorized
      error.message = 'Geçersiz token.';
    }
    next(error); // Hatayı merkezi errorHandler'a gönder
  }
};

module.exports = authMiddleware;