const prisma = require('../../../config/prismaClient');
const { includeTranslations } = require('../../../utils/translationHelper');

const findMany = (options = {}) => {
  const { skip, take, where, orderBy, language } = options;
  return prisma.timeline.findMany({
    skip,
    take,
    where,
    orderBy: orderBy || { year: 'desc', displayOrder: 'asc' },
    include: {
      ...includeTranslations(language)
    }
  });
};

const count = (where = {}) => prisma.timeline.count({ where });

const findById = (id, language = null) => prisma.timeline.findUnique({
  where: { id },
  include: {
    ...includeTranslations(language)
  }
});

const findByYear = (year, language = null) => prisma.timeline.findMany({
  where: { year },
  orderBy: { displayOrder: 'asc' },
  include: {
    ...includeTranslations(language)
  }
});

const create = (data) => prisma.timeline.create({ data });
const update = (id, data) => prisma.timeline.update({ where: { id }, data });
const deleteById = (id) => prisma.timeline.delete({ where: { id } });

module.exports = { findMany, count, findById, findByYear, create, update, deleteById };
