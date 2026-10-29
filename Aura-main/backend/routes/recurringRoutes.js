const express = require('express');
const router = express.Router();
const recurringController = require('../controllers/recurringController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', recurringController.getRecurring);
router.get('/:id', recurringController.getRecurringById);
router.post('/', recurringController.createRecurring);
router.put('/:id', recurringController.updateRecurring);
router.patch('/:id/status', recurringController.updateStatus);
router.delete('/:id', recurringController.deleteRecurring);
router.post('/process-now', recurringController.processNow);

module.exports = router;
