const prisma = require('../../../config/prismaClient');
const { includeTranslations } = require('../../../utils/translationHelper');

const findMany = (options = {}) => {
  const { skip, take, where, orderBy, language } = options;
  return prisma.teamMember.findMany({
    skip,
    take,
    where,
    orderBy: orderBy || { displayOrder: 'asc' },
    include: {
      ...includeTranslations(language)
    }
  });
};

const count = (where = {}) => prisma.teamMember.count({ where });

const findById = (id, language = null) => prisma.teamMember.findUnique({
  where: { id },
  include: {
    ...includeTranslations(language)
  }
});

const findByTeamType = (teamType, language = null) => prisma.teamMember.findMany({
  where: { teamType, isActive: true },
  orderBy: { displayOrder: 'asc' },
  include: {
    ...includeTranslations(language)
  }
});

const create = (data) => prisma.teamMember.create({ data });
const update = (id, data) => prisma.teamMember.update({ where: { id }, data });
const deleteById = (id) => prisma.teamMember.delete({ where: { id } });

module.exports = { findMany, count, findById, findByTeamType, create, update, deleteById };
