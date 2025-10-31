const prisma = require('../../../config/prismaClient');

const findByProjectId = (projectId) => {
  return prisma.projectSettings.findUnique({
    where: { projectId: parseInt(projectId) },
    include: {
      project: {
        select: {
          id: true,
          targetAmount: true,
          collectedAmount: true,
          category: true,
          isActive: true,
          isFeatured: true,
          translations: {
            select: {
              language: true,
              title: true,
              slug: true,
              description: true
            }
          }
        }
      }
    }
  });
};

const create = (data) => {
  return prisma.projectSettings.create({
    data: {
      projectId: parseInt(data.projectId),
      presetAmounts: data.presetAmounts || null,
      minAmount: data.minAmount || null,
      maxAmount: data.maxAmount || null,
      allowRepeat: data.allowRepeat !== undefined ? data.allowRepeat : true,
      minRepeatCount: data.minRepeatCount || 2,
      maxRepeatCount: data.maxRepeatCount || 18,
      allowOneTime: data.allowOneTime !== undefined ? data.allowOneTime : true,
      allowRecurring: data.allowRecurring !== undefined ? data.allowRecurring : true,
      allowedFrequencies: data.allowedFrequencies || null,
      allowDedication: data.allowDedication || false,
      allowAnonymous: data.allowAnonymous !== undefined ? data.allowAnonymous : true,
      requireMessage: data.requireMessage || false,
      isSacrifice: data.isSacrifice || false,
      sacrificeConfig: data.sacrificeConfig || null,
      showProgress: data.showProgress !== undefined ? data.showProgress : true,
      showDonorCount: data.showDonorCount !== undefined ? data.showDonorCount : true,
      showBeneficiaries: data.showBeneficiaries !== undefined ? data.showBeneficiaries : true,
      impactMetrics: data.impactMetrics || null,
      successStories: data.successStories || null,
      customCss: data.customCss || null,
      customJs: data.customJs || null
    },
    include: {
      project: true
    }
  });
};

const update = (projectId, data) => {
  const updateData = {};

  if (data.presetAmounts !== undefined) updateData.presetAmounts = data.presetAmounts;
  if (data.minAmount !== undefined) updateData.minAmount = data.minAmount;
  if (data.maxAmount !== undefined) updateData.maxAmount = data.maxAmount;
  if (data.allowRepeat !== undefined) updateData.allowRepeat = data.allowRepeat;
  if (data.minRepeatCount !== undefined) updateData.minRepeatCount = data.minRepeatCount;
  if (data.maxRepeatCount !== undefined) updateData.maxRepeatCount = data.maxRepeatCount;
  if (data.allowOneTime !== undefined) updateData.allowOneTime = data.allowOneTime;
  if (data.allowRecurring !== undefined) updateData.allowRecurring = data.allowRecurring;
  if (data.allowedFrequencies !== undefined) updateData.allowedFrequencies = data.allowedFrequencies;
  if (data.allowDedication !== undefined) updateData.allowDedication = data.allowDedication;
  if (data.allowAnonymous !== undefined) updateData.allowAnonymous = data.allowAnonymous;
  if (data.requireMessage !== undefined) updateData.requireMessage = data.requireMessage;
  if (data.isSacrifice !== undefined) updateData.isSacrifice = data.isSacrifice;
  if (data.sacrificeConfig !== undefined) updateData.sacrificeConfig = data.sacrificeConfig;
  if (data.showProgress !== undefined) updateData.showProgress = data.showProgress;
  if (data.showDonorCount !== undefined) updateData.showDonorCount = data.showDonorCount;
  if (data.showBeneficiaries !== undefined) updateData.showBeneficiaries = data.showBeneficiaries;
  if (data.impactMetrics !== undefined) updateData.impactMetrics = data.impactMetrics;
  if (data.successStories !== undefined) updateData.successStories = data.successStories;
  if (data.customCss !== undefined) updateData.customCss = data.customCss;
  if (data.customJs !== undefined) updateData.customJs = data.customJs;

  return prisma.projectSettings.update({
    where: { projectId: parseInt(projectId) },
    data: updateData,
    include: {
      project: true
    }
  });
};

const deleteById = (projectId) => {
  return prisma.projectSettings.delete({
    where: { projectId: parseInt(projectId) }
  });
};

// Create or update (upsert)
const upsert = async (projectId, data) => {
  const existing = await findByProjectId(projectId);

  if (existing) {
    return update(projectId, data);
  } else {
    return create({ ...data, projectId });
  }
};

module.exports = {
  findByProjectId,
  create,
  update,
  deleteById,
  upsert
};
