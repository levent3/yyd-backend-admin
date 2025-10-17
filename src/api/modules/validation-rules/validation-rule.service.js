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
    ],

    // ===== PROJECTS =====
    title: [
      {
        ruleType: 'required',
        ruleValue: null,
        errorMessage: {
          tr: 'Başlık zorunludur',
          en: 'Title is required',
          ar: 'العنوان مطلوب'
        },
        priority: 1
      },
      {
        ruleType: 'minLength',
        ruleValue: '3',
        errorMessage: {
          tr: 'Başlık en az 3 karakter olmalıdır',
          en: 'Title must be at least 3 characters',
          ar: 'يجب أن يكون العنوان 3 أحرف على الأقل'
        },
        priority: 2
      },
      {
        ruleType: 'maxLength',
        ruleValue: '200',
        errorMessage: {
          tr: 'Başlık en fazla 200 karakter olabilir',
          en: 'Title must be at most 200 characters',
          ar: 'يجب أن يكون العنوان 200 حرفًا كحد أقصى'
        },
        priority: 3
      }
    ],

    description: [
      {
        ruleType: 'maxLength',
        ruleValue: '1000',
        errorMessage: {
          tr: 'Açıklama en fazla 1000 karakter olabilir',
          en: 'Description must be at most 1000 characters',
          ar: 'يجب أن يكون الوصف 1000 حرف كحد أقصى'
        },
        priority: 1
      }
    ],

    budget: [
      {
        ruleType: 'min',
        ruleValue: '0',
        errorMessage: {
          tr: 'Bütçe negatif olamaz',
          en: 'Budget cannot be negative',
          ar: 'لا يمكن أن تكون الميزانية سالبة'
        },
        priority: 1
      }
    ],

    // ===== USERS =====
    username: [
      {
        ruleType: 'required',
        ruleValue: null,
        errorMessage: {
          tr: 'Kullanıcı adı zorunludur',
          en: 'Username is required',
          ar: 'اسم المستخدم مطلوب'
        },
        priority: 1
      },
      {
        ruleType: 'minLength',
        ruleValue: '3',
        errorMessage: {
          tr: 'Kullanıcı adı en az 3 karakter olmalıdır',
          en: 'Username must be at least 3 characters',
          ar: 'يجب أن يكون اسم المستخدم 3 أحرف على الأقل'
        },
        priority: 2
      },
      {
        ruleType: 'regex',
        ruleValue: '^[a-zA-Z0-9_]+$',
        errorMessage: {
          tr: 'Kullanıcı adı sadece harf, rakam ve alt çizgi içerebilir',
          en: 'Username can only contain letters, numbers and underscores',
          ar: 'يمكن أن يحتوي اسم المستخدم على أحرف وأرقام وشرطات سفلية فقط'
        },
        priority: 3
      }
    ],

    password: [
      {
        ruleType: 'required',
        ruleValue: null,
        errorMessage: {
          tr: 'Şifre zorunludur',
          en: 'Password is required',
          ar: 'كلمة المرور مطلوبة'
        },
        priority: 1
      },
      {
        ruleType: 'minLength',
        ruleValue: '6',
        errorMessage: {
          tr: 'Şifre en az 6 karakter olmalıdır',
          en: 'Password must be at least 6 characters',
          ar: 'يجب أن تكون كلمة المرور 6 أحرف على الأقل'
        },
        priority: 2
      }
    ],

    // ===== NEWS =====
    content: [
      {
        ruleType: 'required',
        ruleValue: null,
        errorMessage: {
          tr: 'İçerik zorunludur',
          en: 'Content is required',
          ar: 'المحتوى مطلوب'
        },
        priority: 1
      },
      {
        ruleType: 'minLength',
        ruleValue: '10',
        errorMessage: {
          tr: 'İçerik en az 10 karakter olmalıdır',
          en: 'Content must be at least 10 characters',
          ar: 'يجب أن يكون المحتوى 10 أحرف على الأقل'
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
