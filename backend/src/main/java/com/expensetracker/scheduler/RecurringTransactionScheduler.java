package com.expensetracker.scheduler;

import com.expensetracker.service.RecurringTransactionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class RecurringTransactionScheduler {

    private static final Logger log = LoggerFactory.getLogger(RecurringTransactionScheduler.class);

    private final RecurringTransactionService recurringService;

    public RecurringTransactionScheduler(RecurringTransactionService recurringService) {
        this.recurringService = recurringService;
    }

    /**
     * Executes every day at 01:00 AM to process due recurring transactions.
     * Also runs every hour in dev environments to promptly process test recurring entries.
     */
    @Scheduled(cron = "0 0 * * * ?")
    public void processDueRecurring() {
        log.info("Starting scheduled recurring transactions processor...");
        int count = recurringService.processDueRecurringTransactions();
        log.info("Processed {} recurring transactions successfully.", count);
    }
}
