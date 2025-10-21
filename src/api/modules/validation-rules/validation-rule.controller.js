/**
 * Validation Rule Controller
 *
 * REFACTORING NOTU:
 * -----------------
 * Bu controller artık generic controllerFactory kullanıyor.
 * Standard CRUD işlemleri factory'den geliyor.
 * Özel metodlar: getRulesByEntity, toggleRuleActive, getTemplates, applyTemplate
 */

const validationRuleService = require('./validation-rule.service');
const { createCRUDController } = require('../../../utils/controllerFactory');

// ========== STANDARD CRUD OPERATIONS (Factory ile) ==========

const validationRuleServiceAdapter = {
  getAll: (query) => validationRuleService.getAllRules(query),
  getById: (id) => validationRuleService.getRuleById(id),
  create: (data) => validationRuleService.createRule(data),
  update: (id, data) => validationRuleService.updateRule(id, data),
  delete: (id) => validationRuleService.deleteRule(id),
};

const crudController = createCRUDController(validationRuleServiceAdapter, {
  entityName: 'Validation rule',
  entityNamePlural: 'Validation rules',
});

// ========== ÖZEL METODLAR ==========

// GET /api/validation-rules/entity/:entityType - Get rules by entity
const getRulesByEntity = async (req, res, next) => {
  try {
    const { entityType } = req.params;
    const rules = await validationRuleService.getRulesByEntity(entityType);

    res.json(rules);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/validation-rules/:id/toggle - Toggle rule active/inactive
const toggleRuleActive = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const rule = await validationRuleService.toggleRuleActive(id, isActive);

    res.json({
      message: `Validation rule ${isActive ? 'activated' : 'deactivated'} successfully`,
      rule
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/validation-rules/templates - Get templates
const getTemplates = async (req, res, next) => {
  try {
    const templates = validationRuleService.getDefaultTemplates();

    res.json(templates);
  } catch (error) {
    next(error);
  }
};

// POST /api/validation-rules/templates/apply - Apply template
const applyTemplate = async (req, res, next) => {
  try {
    const { entityType, fieldName } = req.body;

    if (!entityType || !fieldName) {
      return res.status(400).json({
        message: 'entityType and fieldName are required'
      });
    }

    const rules = await validationRuleService.createTemplateRules(entityType, fieldName);

    res.status(201).json({
      message: `Template rules created for ${entityType}.${fieldName}`,
      rules
    });
  } catch (error) {
    next(error);
  }
};

// ========== EXPORT ==========

module.exports = {
  // Standard CRUD (factory'den)
  getAllRules: crudController.getAll,
  getRuleById: crudController.getById,
  createRule: crudController.create,
  updateRule: crudController.update,
  deleteRule: crudController.delete,

  // Özel metodlar
  getRulesByEntity,
  toggleRuleActive,
  getTemplates,
  applyTemplate,
};
