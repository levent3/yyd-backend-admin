const teamMemberRepo = require('./team-member.repository');
const { parsePagination, createPaginatedResponse } = require('../../../utils/pagination');
const { formatEntityWithTranslation } = require('../../../utils/translationHelper');

const getAllTeamMembers = async (queryParams = {}) => {
  const { page, limit, teamType, isActive, language = 'tr' } = queryParams;
  const { skip, limit: take } = parsePagination(page, limit);

  const where = {};
  if (teamType) where.teamType = teamType;
  if (isActive !== undefined) where.isActive = isActive === 'true';

  const [members, total] = await Promise.all([
    teamMemberRepo.findMany({ skip, take, where, language }),
    teamMemberRepo.count(where),
  ]);

  const formattedMembers = members.map(item =>
    formatEntityWithTranslation(item, language, false)
  );

  return createPaginatedResponse(formattedMembers, total, parseInt(page) || 1, take);
};

const getTeamMemberById = async (id, language = 'tr') => {
  const member = await teamMemberRepo.findById(id, null);
  return formatEntityWithTranslation(member, language, true);
};

const getTeamMembersByType = async (teamType, language = 'tr') => {
  const members = await teamMemberRepo.findByTeamType(teamType, language);
  return members.map(item => formatEntityWithTranslation(item, language, true));
};

const createTeamMember = async (data) => {
  const { translations, ...rest } = data;

  if (!translations || translations.length === 0) {
    const error = new Error('En az bir çeviri gereklidir');
    error.statusCode = 400;
    throw error;
  }

  const translationsData = translations.map(trans => ({
    language: trans.language,
    fullName: trans.fullName,
    biography: trans.biography || null,
    education: trans.education || null,
    experience: trans.experience || null
  }));

  const mappedData = {
    photoUrl: rest.photoUrl || null,
    position: rest.position,
    teamType: rest.teamType || 'yonetim',
    displayOrder: rest.displayOrder || 0,
    isActive: rest.isActive !== undefined ? rest.isActive : true,
    birthYear: rest.birthYear ? parseInt(rest.birthYear) : null,
    birthCity: rest.birthCity || null,
    languages: rest.languages || null,
    translations: {
      create: translationsData
    }
  };

  try {
    return await teamMemberRepo.create(mappedData);
  } catch (error) {
    throw error;
  }
};

const updateTeamMember = async (id, data) => {
  const { translations, ...rest } = data;
  const mappedData = {};

  if (rest.photoUrl !== undefined) mappedData.photoUrl = rest.photoUrl;
  if (rest.position !== undefined) mappedData.position = rest.position;
  if (rest.teamType !== undefined) mappedData.teamType = rest.teamType;
  if (rest.displayOrder !== undefined) mappedData.displayOrder = parseInt(rest.displayOrder);
  if (rest.isActive !== undefined) mappedData.isActive = rest.isActive;
  if (rest.birthYear !== undefined) mappedData.birthYear = rest.birthYear ? parseInt(rest.birthYear) : null;
  if (rest.birthCity !== undefined) mappedData.birthCity = rest.birthCity;
  if (rest.languages !== undefined) mappedData.languages = rest.languages;

  if (translations && translations.length > 0) {
    const translationUpdates = translations.map(trans => ({
      where: {
        memberId_language: {
          memberId: id,
          language: trans.language
        }
      },
      create: {
        language: trans.language,
        fullName: trans.fullName,
        biography: trans.biography || null,
        education: trans.education || null,
        experience: trans.experience || null
      },
      update: {
        fullName: trans.fullName,
        biography: trans.biography || null,
        education: trans.education || null,
        experience: trans.experience || null
      }
    }));

    mappedData.translations = {
      upsert: translationUpdates
    };
  }

  try {
    return await teamMemberRepo.update(id, mappedData);
  } catch (error) {
    throw error;
  }
};

const deleteTeamMember = (id) => teamMemberRepo.deleteById(id);

module.exports = {
  getAllTeamMembers,
  getTeamMemberById,
  getTeamMembersByType,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember
};
