package com.expensetracker.service;

import com.expensetracker.dto.RecurringTransactionRequest;
import com.expensetracker.dto.RecurringTransactionResponse;
import com.expensetracker.exception.BadRequestException;
import com.expensetracker.exception.ResourceNotFoundException;
import com.expensetracker.model.*;
import com.expensetracker.repository.CategoryRepository;
import com.expensetracker.repository.RecurringTransactionRepository;
import com.expensetracker.repository.TransactionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RecurringTransactionService {

    private static final Logger log = LoggerFactory.getLogger(RecurringTransactionService.class);

    private final RecurringTransactionRepository recurringRepository;
    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;
    private final NotificationService notificationService;
    private final BudgetService budgetService;

    public RecurringTransactionService(RecurringTransactionRepository recurringRepository,
                                       TransactionRepository transactionRepository,
                                       CategoryRepository categoryRepository,
                                       NotificationService notificationService,
                                       BudgetService budgetService) {
        this.recurringRepository = recurringRepository;
        this.transactionRepository = transactionRepository;
        this.categoryRepository = categoryRepository;
        this.notificationService = notificationService;
        this.budgetService = budgetService;
    }

    public List<RecurringTransactionResponse> getRecurringForUser(String userId) {
        return recurringRepository.findByUserId(userId)
                .stream()
                .map(RecurringTransactionResponse::new)
                .collect(Collectors.toList());
    }

    public RecurringTransactionResponse getRecurringById(String id, String userId) {
        RecurringTransaction recurring = recurringRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Recurring rule not found with id: " + id));
        return new RecurringTransactionResponse(recurring);
    }

    public RecurringTransactionResponse createRecurring(String userId, RecurringTransactionRequest request) {
        validateRecurringRequest(userId, request);

        LocalDate startDate = request.getStartDate();
        LocalDate nextExecution = startDate.isBefore(LocalDate.now()) ? LocalDate.now() : startDate;

        RecurringTransaction recurring = new RecurringTransaction();
        recurring.setUserId(userId);
        recurring.setType(request.getType());
        recurring.setAmount(request.getAmount());
        recurring.setCategory(request.getCategory().trim());
        recurring.setDescription(request.getDescription().trim());
        recurring.setPaymentMethod(request.getPaymentMethod());
        recurring.setFrequency(request.getFrequency());
        recurring.setStartDate(startDate);
        recurring.setEndDate(request.getEndDate());
        recurring.setNextExecutionDate(nextExecution);
        recurring.setStatus(RecurringStatus.ACTIVE);
        recurring.setCreatedAt(LocalDateTime.now());
        recurring.setUpdatedAt(LocalDateTime.now());

        RecurringTransaction saved = recurringRepository.save(recurring);
        return new RecurringTransactionResponse(saved);
    }

    public RecurringTransactionResponse updateRecurring(String id, String userId, RecurringTransactionRequest request) {
        RecurringTransaction recurring = recurringRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Recurring rule not found with id: " + id));

        validateRecurringRequest(userId, request);

        recurring.setType(request.getType());
        recurring.setAmount(request.getAmount());
        recurring.setCategory(request.getCategory().trim());
        recurring.setDescription(request.getDescription().trim());
        recurring.setPaymentMethod(request.getPaymentMethod());
        recurring.setFrequency(request.getFrequency());
        recurring.setStartDate(request.getStartDate());
        recurring.setEndDate(request.getEndDate());
        recurring.setUpdatedAt(LocalDateTime.now());

        RecurringTransaction updated = recurringRepository.save(recurring);
        return new RecurringTransactionResponse(updated);
    }

    public RecurringTransactionResponse updateStatus(String id, String userId, RecurringStatus status) {
        RecurringTransaction recurring = recurringRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Recurring rule not found with id: " + id));

        recurring.setStatus(status);
        recurring.setUpdatedAt(LocalDateTime.now());
        RecurringTransaction updated = recurringRepository.save(recurring);
        return new RecurringTransactionResponse(updated);
    }

    public void deleteRecurring(String id, String userId) {
        RecurringTransaction recurring = recurringRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Recurring rule not found with id: " + id));
        recurringRepository.delete(recurring);
    }

    public int processDueRecurringTransactions() {
        LocalDate today = LocalDate.now();
        List<RecurringTransaction> dueRules = recurringRepository.findByStatusAndNextExecutionDateLessThanEqual(
                RecurringStatus.ACTIVE, today
        );

        int processedCount = 0;

        for (RecurringTransaction rule : dueRules) {
            try {
                // If end date passed, mark as cancelled
                if (rule.getEndDate() != null && today.isAfter(rule.getEndDate())) {
                    rule.setStatus(RecurringStatus.CANCELLED);
                    rule.setUpdatedAt(LocalDateTime.now());
                    recurringRepository.save(rule);
                    continue;
                }

                LocalDate executionDate = rule.getNextExecutionDate();

                // Duplicate prevention: check if a transaction for this exact date, user, category and amount already exists
                boolean alreadyExecuted = transactionRepository.findByUserIdAndCategoryAndDateBetween(
                        rule.getUserId(), rule.getCategory(), executionDate, executionDate
                ).stream().anyMatch(t -> t.getAmount().compareTo(rule.getAmount()) == 0
                        && t.getDescription().contains(rule.getDescription()));

                if (!alreadyExecuted) {
                    Transaction transaction = new Transaction();
                    transaction.setUserId(rule.getUserId());
                    transaction.setType(rule.getType());
                    transaction.setAmount(rule.getAmount());
                    transaction.setCategory(rule.getCategory());
                    transaction.setDate(executionDate);
                    transaction.setDescription("[Recurring] " + rule.getDescription());
                    transaction.setPaymentMethod(rule.getPaymentMethod());
                    transaction.setNotes("Automatically posted by AURA Recurring Scheduler (" + rule.getFrequency() + ")");
                    transaction.setCreatedAt(LocalDateTime.now());
                    transaction.setUpdatedAt(LocalDateTime.now());

                    Transaction saved = transactionRepository.save(transaction);
                    processedCount++;

                    // Trigger budget alerts if expense
                    if (saved.getType() == TransactionType.EXPENSE) {
                        budgetService.checkBudgetAlertsForTransaction(rule.getUserId(), saved.getCategory(), saved.getDate());
                    }

                    // In-app notification
                    notificationService.createNotification(
                            rule.getUserId(),
                            "Recurring " + rule.getType() + " Posted",
                            String.format("Recurring transaction '%s' for $%s was automatically executed on %s.",
                                    rule.getDescription(), rule.getAmount().toPlainString(), executionDate),
                            NotificationType.RECURRING_EXECUTED
                    );
                }

                // Advance nextExecutionDate
                rule.setLastExecutedDate(executionDate);
                LocalDate nextDate = computeNextExecutionDate(executionDate, rule.getFrequency());
                rule.setNextExecutionDate(nextDate);

                if (rule.getEndDate() != null && nextDate.isAfter(rule.getEndDate())) {
                    rule.setStatus(RecurringStatus.CANCELLED);
                }

                rule.setUpdatedAt(LocalDateTime.now());
                recurringRepository.save(rule);

            } catch (Exception ex) {
                log.error("Error processing recurring transaction rule id: {}", rule.getId(), ex);
            }
        }

        return processedCount;
    }

    private LocalDate computeNextExecutionDate(LocalDate current, Frequency frequency) {
        if (frequency == Frequency.WEEKLY) {
            return current.plusWeeks(1);
        } else if (frequency == Frequency.YEARLY) {
            return current.plusYears(1);
        } else {
            return current.plusMonths(1);
        }
    }

    private void validateRecurringRequest(String userId, RecurringTransactionRequest request) {
        if (request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Amount must be greater than zero");
        }

        if (request.getStartDate() == null) {
            throw new BadRequestException("Start date is required");
        }

        if (request.getEndDate() != null && request.getEndDate().isBefore(request.getStartDate())) {
            throw new BadRequestException("End date cannot be earlier than start date");
        }

        String catName = request.getCategory() != null ? request.getCategory().trim() : "";
        boolean exists = categoryRepository.existsByNameIgnoreCaseAndUserId(catName, userId)
                || categoryRepository.existsByNameIgnoreCaseAndIsSystemTrue(catName);
        if (!exists) {
            throw new BadRequestException("Category '" + catName + "' does not exist");
        }
    }
}
