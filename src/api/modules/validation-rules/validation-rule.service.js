const validationRuleRepo = require('./validation-rule.repository');
const { clearValidationCache } = require('../../validators/dynamicValidator');

const getAllRules = (filters) => {
  return validationRuleRepo.findAll(filters);
};

const getRuleById = (id) => {
  return validationRuleRepo.findById(id);
};

const getRulesByEntity = (entityType) => {
  return validationRuleRepo.findByEntity(entityType);
};

const createRule = async (data) => {
  const rule = await validationRuleRepo.create(data);

  // Cache'i temizle
  clearValidationCache();

  return rule;
};

const updateRule = async (id, data) => {
  const rule = await validationRuleRepo.update(id, data);

  // Cache'i temizle
  clearValidationCache();

  return rule;
};

const deleteRule = async (id) => {
  const result = await validationRuleRepo.deleteById(id);

  // Cache'i temizle
  clearValidationCache();

  return result;
};

const toggleRuleActive = async (id, isActive) => {
  const rule = await validationRuleRepo.toggleActive(id, isActive);

  // Cache'i temizle
  clearValidationCache();

  return rule;
};

// Önceden tanımlı template'ler - Hızlı başlangıç için
const getDefaultTemplates = () => {
  return {
    donorName: [
      {
        ruleType: 'required',
        ruleValue: null,
        errorMessage: {
          tr: 'İsim alanı zorunludur',
          en: 'Name is required',
          ar: 'الاسم مطلوب'
        },
        priority: 1
      },
      {
        ruleType: 'minLength',
        ruleValue: '3',
        errorMessage: {
          tr: 'İsim en az 3 karakter olmalıdır',
          en: 'Name must be at least 3 characters',
          ar: 'يجب أن يكون الاسم 3 أحرف على الأقل'
        },
        priority: 2
      },
      {
        ruleType: 'custom',
        ruleValue: JSON.stringify({
          hasVowel: true,
          noRepeated: 3,
          allowedChars: '^[a-zA-ZğüşıöçĞÜŞİÖÇ\\s]+$'
        }),
        errorMessage: {
          tr: 'Geçerli bir isim giriniz (en az bir sesli harf içermeli, aynı harften 3+ üst üste olamaz)',
          en: 'Enter a valid name (must contain at least one vowel, no more than 2 repeated characters)',
          ar: 'أدخل اسمًا صالحًا'
        },
        priority: 3
      }
    ],
    email: [
      {
        ruleType: 'required',
        ruleValue: null,
        errorMessage: {
          tr: 'Email adresi zorunludur',
          en: 'Email is required',
          ar: 'البريد الإلكتروني مطلوب'
        },
        priority: 1
      },
      {
        ruleType: 'regex',
        ruleValue: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
        errorMessage: {
          tr: 'Geçerli bir email adresi giriniz',
          en: 'Enter a valid email address',
          ar: 'أدخل عنوان بريد إلكتروني صالح'
        },
        priority: 2
      }
    ],
    phoneNumber: [
      {
        ruleType: 'regex',
        ruleValue: '^(\\+90|0)?5\\d{9}$',
        errorMessage: {
          tr: 'Geçerli bir telefon numarası giriniz (örn: 05XX XXX XX XX)',
          en: 'Enter a valid phone number',
          ar: 'أدخل رقم هاتف صالح'
        },
        priority: 1
      }
    ],
    amount: [
      {
        ruleType: 'required',
        ruleValue: null,
        errorMessage: {
          tr: 'Bağış tutarı zorunludur',
          en: 'Donation amount is required',
          ar: 'مبلغ التبرع مطلوب'
        },
        priority: 1
      },
      {
        ruleType: 'min',
        ruleValue: '10',
        errorMessage: {
          tr: 'Minimum bağış tutarı 10 TL olmalıdır',
          en: 'Minimum donation amount is 10 TL',
          ar: 'الحد الأدنى للتبرع هو 10 ليرة تركية'
        },
        priority: 2
      }
    ]
  };
};

// Bulk template creation - Hızlı başlangıç için tüm kuralları oluştur
const createTemplateRules = async (entityType, fieldName) => {
  const templates = getDefaultTemplates();

  if (!templates[fieldName]) {
    throw new Error(`No template found for field: ${fieldName}`);
  }

  const createdRules = [];

  for (const template of templates[fieldName]) {
    const rule = await validationRuleRepo.create({
      entityType,
      fieldName,
      ...template
    });
    createdRules.push(rule);
  }

  // Cache'i temizle
  clearValidationCache();

  return createdRules;
};

module.exports = {
  getAllRules,
  getRuleById,
  getRulesByEntity,
  createRule,
  updateRule,
  deleteRule,
  toggleRuleActive,
  getDefaultTemplates,
  createTemplateRules
};
