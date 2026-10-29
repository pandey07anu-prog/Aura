const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', reportController.getReports);
router.get('/dashboard-summary', reportController.getDashboardSummary);
router.get('/export-csv', reportController.exportCsv);

module.exports = router;
