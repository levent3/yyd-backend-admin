// Dinamik Validation Engine
// Admin panelden tanımlanan kuralları okur ve uygular
// TAMAMEN DİNAMİK - Hiçbir şey hardcoded değil!

const prisma = require('../../config/prismaClient');

/**
 * Veritabanından validation kurallarını çeker (cache ile)
 */
let rulesCache = {};
let cacheExpiry = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 dakika

const loadValidationRules = async (entityType, fieldName = null) => {
  const now = Date.now();

  // Cache kontrolü
  const cacheKey = `${entityType}:${fieldName || 'all'}`;
  if (rulesCache[cacheKey] && cacheExpiry && now < cacheExpiry) {
    return rulesCache[cacheKey];
  }

  // Database'den çek
  const where = {
    entityType,
    isActive: true
  };

  if (fieldName) {
    where.fieldName = fieldName;
  }

  const rules = await prisma.validationRule.findMany({
    where,
    orderBy: { priority: 'asc' }
  });

  // Cache'e kaydet
  rulesCache[cacheKey] = rules;
  cacheExpiry = now + CACHE_DURATION;

  return rules;
};

/**
 * Cache'i temizle (admin panel'den kural güncellendiğinde çağrılır)
 */
const clearValidationCache = () => {
  rulesCache = {};
  cacheExpiry = null;
};

/**
 * Tek bir field'ı validate eder
 */
const validateField = (fieldName, value, rules, language = 'tr') => {
  const errors = [];

  for (const rule of rules) {
    if (rule.fieldName !== fieldName) continue;

    let isValid = true;
    let errorMsg = rule.errorMessage[language] || rule.errorMessage.tr || 'Geçersiz değer';

    switch (rule.ruleType) {
      case 'required':
        isValid = value !== null && value !== undefined && value !== '';
        break;

      case 'minLength':
        const minLen = parseInt(rule.ruleValue);
        isValid = value && value.length >= minLen;
        break;

      case 'maxLength':
        const maxLen = parseInt(rule.ruleValue);
        isValid = !value || value.length <= maxLen;
        break;

      case 'regex':
        try {
          const regex = new RegExp(rule.ruleValue);
          isValid = regex.test(value);
        } catch (e) {
          console.error(`Invalid regex pattern for rule ${rule.id}:`, e);
          isValid = true; // Regex hatası varsa pas geç
        }
        break;

      case 'enum':
        try {
          const allowedValues = JSON.parse(rule.ruleValue);
          isValid = allowedValues.includes(value);
        } catch (e) {
          console.error(`Invalid enum values for rule ${rule.id}:`, e);
          isValid = true;
        }
        break;

      case 'min':
        const minVal = parseFloat(rule.ruleValue);
        isValid = parseFloat(value) >= minVal;
        break;

      case 'max':
        const maxVal = parseFloat(rule.ruleValue);
        isValid = parseFloat(value) <= maxVal;
        break;

      case 'custom':
        // Custom validation için JSON config
        try {
          const config = JSON.parse(rule.ruleValue);
          isValid = evaluateCustomRule(value, config);
        } catch (e) {
          console.error(`Custom validation error for rule ${rule.id}:`, e);
          isValid = true;
        }
        break;

      default:
        console.warn(`Unknown rule type: ${rule.ruleType}`);
        isValid = true;
    }

    if (!isValid) {
      errors.push(errorMsg);
    }
  }

  return errors;
};

/**
 * Custom rule evaluation - JSON config'e göre özel kurallar
 * Örnek config: { "hasVowel": true, "noRepeated": 3, "allowedChars": "^[a-zA-ZğüşıöçĞÜŞİÖÇ\\s]+$" }
 */
const evaluateCustomRule = (value, config) => {
  // Sesli harf kontrolü (Türkçe isimler için)
  if (config.hasVowel) {
    const vowelRegex = /[aeıioöuüAEIİOÖUÜ]/;
    if (!vowelRegex.test(value)) {
      return false;
    }
  }

  // Tekrarlanan karakter kontrolü
  if (config.noRepeated) {
    const repeatPattern = new RegExp(`(.)\\1{${config.noRepeated - 1},}`);
    if (repeatPattern.test(value)) {
      return false;
    }
  }

  // İzin verilen karakterler
  if (config.allowedChars) {
    const allowedRegex = new RegExp(config.allowedChars);
    if (!allowedRegex.test(value)) {
      return false;
    }
  }

  // Numeric range
  if (config.numericRange) {
    const numValue = parseFloat(value);
    if (config.numericRange.min !== undefined && numValue < config.numericRange.min) {
      return false;
    }
    if (config.numericRange.max !== undefined && numValue > config.numericRange.max) {
      return false;
    }
  }

  return true;
};

/**
 * Tüm entity'yi validate eder
 */
const validateEntity = async (entityType, data, language = 'tr') => {
  const rules = await loadValidationRules(entityType);
  const errors = {};

  // Her field için validasyon
  for (const fieldName in data) {
    const value = data[fieldName];
    const fieldRules = rules.filter(r => r.fieldName === fieldName);

    if (fieldRules.length > 0) {
      const fieldErrors = validateField(fieldName, value, fieldRules, language);

      if (fieldErrors.length > 0) {
        errors[fieldName] = fieldErrors;
      }
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Express middleware olarak kullanım
 */
const validationMiddleware = (entityType) => {
  return async (req, res, next) => {
    try {
      const language = req.headers['accept-language']?.split(',')[0]?.split('-')[0] || 'tr';
      const validation = await validateEntity(entityType, req.body, language);

      if (!validation.valid) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: validation.errors
        });
      }

      next();
    } catch (error) {
      console.error('Validation middleware error:', error);
      next(error);
    }
  };
};

module.exports = {
  loadValidationRules,
  clearValidationCache,
  validateField,
  validateEntity,
  validationMiddleware
};
