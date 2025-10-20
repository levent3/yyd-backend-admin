const dashboardService = require('./dashboard.service');

const getStatistics = async (req, res, next) => {
  try {
    const stats = await dashboardService.getGlobalStatistics();
    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
};

const getDonationChart = async (req, res, next) => {
  try {
    const { period = 'monthly', limit = 30 } = req.query;
    const chartData = await dashboardService.getDonationChartData(period, parseInt(limit));
    res.status(200).json(chartData);
  } catch (error) {
    next(error);
  }
};

const getRecentActivities = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;
    const activities = await dashboardService.getRecentActivities(parseInt(limit));
    res.status(200).json(activities);
  } catch (error) {
    next(error);
  }
};

const getTopCampaigns = async (req, res, next) => {
  try {
    const { limit = 5 } = req.query;
    const campaigns = await dashboardService.getTopCampaigns(parseInt(limit));
    res.status(200).json(campaigns);
  } catch (error) {
    next(error);
  }
};

const getTopDonors = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;
    const donors = await dashboardService.getTopDonors(parseInt(limit));
    res.status(200).json(donors);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStatistics,
  getDonationChart,
  getRecentActivities,
  getTopCampaigns,
  getTopDonors,
};
