const teamMemberService = require('./team-member.service');
const { createCRUDController } = require('../../../utils/controllerFactory');

const teamMemberServiceAdapter = {
  getAll: (query) => teamMemberService.getAllTeamMembers(query),
  getById: (id, query) => {
    const language = query.language || 'tr';
    return teamMemberService.getTeamMemberById(id, language);
  },
  create: (data) => teamMemberService.createTeamMember(data),
  update: (id, data) => teamMemberService.updateTeamMember(id, data),
  delete: (id) => teamMemberService.deleteTeamMember(id),
};

const crudController = createCRUDController(teamMemberServiceAdapter, {
  entityName: 'Ekip Üyesi',
  entityNamePlural: 'Ekip Üyeleri',
  beforeCreate: async (req, data) => {
    if (!data.translations && (data.fullName)) {
      data.translations = [{
        language: 'tr',
        fullName: data.fullName,
        biography: data.biography || null,
        education: data.education || null,
        experience: data.experience || null
      }];
      delete data.fullName;
      delete data.biography;
      delete data.education;
      delete data.experience;
    }
    return data;
  },
});

const getTeamMembersByType = async (req, res, next) => {
  try {
    const { teamType } = req.params;
    const language = req.query.language || 'tr';

    const members = await teamMemberService.getTeamMembersByType(teamType, language);

    res.status(200).json({
      success: true,
      message: `${teamType} ekibi başarıyla getirildi`,
      data: members,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllTeamMembers: crudController.getAll,
  getTeamMemberById: crudController.getById,
  createTeamMember: crudController.create,
  updateTeamMember: crudController.update,
  deleteTeamMember: crudController.delete,
  getTeamMembersByType,
};
