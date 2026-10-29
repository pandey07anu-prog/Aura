const reportService = require('../services/reportService');
const { success } = require('../utils/apiResponse');

async function getReports(req, res, next) {
  try {
    const { startDate, endDate } = req.query;
    const response = await reportService.getReports(req.user._id, startDate, endDate);
    res.json(success(response));
  } catch (err) {
    next(err);
  }
}

async function getDashboardSummary(req, res, next) {
  try {
    const summary = await reportService.getDashboardSummary(req.user._id);
    res.json(success(summary));
  } catch (err) {
    next(err);
  }
}

async function exportCsv(req, res, next) {
  try {
    const { startDate, endDate } = req.query;
    const csvBuffer = await reportService.exportToCsv(req.user._id, startDate, endDate);

    res.setHeader('Content-Disposition', 'attachment; filename="aura_transactions_report.csv"');
    res.setHeader('Content-Type', 'text/csv');
    res.send(csvBuffer);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getReports,
  getDashboardSummary,
  exportCsv
};
