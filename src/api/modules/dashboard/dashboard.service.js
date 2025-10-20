const dashboardRepository = require('./dashboard.repository');

const getGlobalStatistics = async () => {
  const [
    donationStats,
    campaignStats,
    donorStats,
    projectStats,
    volunteerStats,
    contactStats,
  ] = await Promise.all([
    dashboardRepository.getDonationStatistics(),
    dashboardRepository.getCampaignStatistics(),
    dashboardRepository.getDonorStatistics(),
    dashboardRepository.getProjectStatistics(),
    dashboardRepository.getVolunteerStatistics(),
    dashboardRepository.getContactStatistics(),
  ]);

  return {
    donations: donationStats,
    campaigns: campaignStats,
    donors: donorStats,
    projects: projectStats,
    volunteers: volunteerStats,
    contacts: contactStats,
  };
};

const getDonationChartData = async (period, limit) => {
  return await dashboardRepository.getDonationChartData(period, limit);
};

const getRecentActivities = async (limit) => {
  const [recentDonations, recentVolunteers, recentContacts] = await Promise.all([
    dashboardRepository.getRecentDonations(limit),
    dashboardRepository.getRecentVolunteers(Math.ceil(limit / 3)),
    dashboardRepository.getRecentContacts(Math.ceil(limit / 3)),
  ]);

  // Merge ve tarihçe göre sırala
  const activities = [
    ...recentDonations.map((d) => ({
      type: 'donation',
      id: d.id,
      title: `Yeni bağış: ${d.amount} ${d.currency}`,
      description: d.donorName || d.donorEmail,
      campaign: d.campaign?.title,
      timestamp: d.createdAt,
    })),
    ...recentVolunteers.map((v) => ({
      type: 'volunteer',
      id: v.id,
      title: 'Yeni gönüllü başvurusu',
      description: v.fullName,
      timestamp: v.submittedAt,
    })),
    ...recentContacts.map((c) => ({
      type: 'contact',
      id: c.id,
      title: 'Yeni iletişim mesajı',
      description: c.fullName,
      subject: c.subject,
      timestamp: c.submittedAt,
    })),
  ];

  // Tarihe göre sırala ve limit uygula
  return activities
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, limit);
};

const getTopCampaigns = async (limit) => {
  return await dashboardRepository.getTopCampaigns(limit);
};

const getTopDonors = async (limit) => {
  return await dashboardRepository.getTopDonors(limit);
};

module.exports = {
  getGlobalStatistics,
  getDonationChartData,
  getRecentActivities,
  getTopCampaigns,
  getTopDonors,
};
