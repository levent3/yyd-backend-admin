const validationRuleService = require('./validation-rule.service');

// GET /api/validation-rules
const getAllRules = async (req, res, next) => {
  try {
    const { entityType, fieldName, isActive } = req.query;
    const rules = await validationRuleService.getAllRules({ entityType, fieldName, isActive });

    res.json(rules);
  } catch (error) {
    next(error);
  }
};

// GET /api/validation-rules/:id
const getRuleById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const rule = await validationRuleService.getRuleById(id);

    if (!rule) {
      return res.status(404).json({ message: 'Validation rule not found' });
    }

    res.json(rule);
  } catch (error) {
    next(error);
  }
};

// GET /api/validation-rules/entity/:entityType
const getRulesByEntity = async (req, res, next) => {
  try {
    const { entityType } = req.params;
    const rules = await validationRuleService.getRulesByEntity(entityType);

    res.json(rules);
  } catch (error) {
    next(error);
  }
};

// POST /api/validation-rules
const createRule = async (req, res, next) => {
  try {
    const rule = await validationRuleService.createRule(req.body);

    res.status(201).json({
      message: 'Validation rule created successfully',
      rule
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/validation-rules/:id
const updateRule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const rule = await validationRuleService.updateRule(id, req.body);

    res.json({
      message: 'Validation rule updated successfully',
      rule
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/validation-rules/:id
const deleteRule = async (req, res, next) => {
  try {
    const { id } = req.params;
    await validationRuleService.deleteRule(id);

    res.json({ message: 'Validation rule deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/validation-rules/:id/toggle
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

// GET /api/validation-rules/templates
const getTemplates = async (req, res, next) => {
  try {
    const templates = validationRuleService.getDefaultTemplates();

    res.json(templates);
  } catch (error) {
    next(error);
  }
};

// POST /api/validation-rules/templates/apply
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

module.exports = {
  getAllRules,
  getRuleById,
  getRulesByEntity,
  createRule,
  updateRule,
  deleteRule,
  toggleRuleActive,
  getTemplates,
  applyTemplate
};
