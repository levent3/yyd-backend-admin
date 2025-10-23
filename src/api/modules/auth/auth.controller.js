const { validationResult } = require('express-validator');
const authService = require('./auth.service');
const logger = require('../../../config/logger');

const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const user = await authService.register(req.body);
    res.status(201).json({ message: 'Kullanıcı başarıyla oluşturuldu.', userId: user.id });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    logger.info('Login attempt', { email });
    const result = await authService.login(email, password);

    // Token'ı httpOnly cookie olarak set et
    res.cookie('token', result.token, {
      httpOnly: true, // XSS saldırılarına karşı
      secure: false, // TODO: Domain alınca HTTPS ile true yap
      sameSite: 'lax', // CSRF koruması
      maxAge: 24 * 60 * 60 * 1000 // 1 gün
    });

    logger.info('Login successful', { email, userId: result.user.id });
    // Token'ı response'da da döndür (opsiyonel, frontend localStorage için)
    res.status(200).json(result);
  } catch (error) {
    logger.error('Login failed', { email: req.body.email, error: error.message });
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    // Cookie'yi temizle
    res.clearCookie('token');
    res.status(200).json({ message: 'Başarıyla çıkış yapıldı.' });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    // req.user, authMiddleware tarafından set edildi
    const userData = await authService.getMe(req.user.userId);
    res.status(200).json(userData);
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, logout, getMe };