const cron = require('node-cron');
const recurringService = require('../services/recurringService');

function initScheduler() {
  // Run once every hour at minute 0 (matching Java scheduler cron: "0 0 * * * ?")
  cron.schedule('0 * * * *', async () => {
    console.log('[Scheduler] Starting scheduled recurring transactions processor...');
    try {
      const count = await recurringService.processDueRecurringTransactions();
      console.log(`[Scheduler] Processed ${count} recurring transactions successfully.`);
    } catch (err) {
      console.error('[Scheduler] Error processing recurring transactions:', err);
    }
  });

  console.log('[Scheduler] Recurring transaction cron scheduler initialized (hourly)');
}

module.exports = initScheduler;
