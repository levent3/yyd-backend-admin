const { body } = require('express-validator');

const registerValidation = [
  body('email').isEmail().withMessage('Geçerli bir email adresi giriniz.'),
  body('password').isLength({ min: 6 }).withMessage('Şifre en az 6 karakter olmalıdır.'),
  body('username').notEmpty().withMessage('Kullanıcı adı boş olamaz.'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Geçerli bir email adresi giriniz.'),
  body('password').notEmpty().withMessage('Şifre boş olamaz.'),
];

module.exports = { registerValidation, loginValidation };