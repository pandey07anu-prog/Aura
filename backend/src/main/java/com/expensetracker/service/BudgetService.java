package com.expensetracker.service;

import com.expensetracker.dto.BudgetRequest;
import com.expensetracker.dto.BudgetResponse;
import com.expensetracker.exception.BadRequestException;
import com.expensetracker.exception.ConflictException;
import com.expensetracker.exception.ResourceNotFoundException;
import com.expensetracker.model.*;
import com.expensetracker.repository.BudgetRepository;
import com.expensetracker.repository.CategoryRepository;
import com.expensetracker.repository.TransactionRepository;
import com.expensetracker.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;

@Service
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;

    public BudgetService(BudgetRepository budgetRepository,
                         TransactionRepository transactionRepository,
                         CategoryRepository categoryRepository,
                         UserRepository userRepository,
                         NotificationService notificationService,
                         EmailService emailService) {
        this.budgetRepository = budgetRepository;
        this.transactionRepository = transactionRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.emailService = emailService;
    }

    public List<BudgetResponse> getBudgetsForUser(String userId, Integer month, Integer year) {
        LocalDate now = LocalDate.now();
        int targetMonth = (month != null && month >= 1 && month <= 12) ? month : now.getMonthValue();
        int targetYear = (year != null && year >= 2000) ? year : now.getYear();

        List<Budget> budgets = budgetRepository.findByUserIdAndMonthAndYear(userId, targetMonth, targetYear);
        List<BudgetResponse> responseList = new ArrayList<>();

        for (Budget budget : budgets) {
            BigDecimal spent = calculateSpentForCategoryAndMonth(userId, budget.getCategory(), targetMonth, targetYear);
            responseList.add(new BudgetResponse(budget, spent));
        }

        return responseList;
    }

    public BudgetResponse getBudgetById(String id, String userId) {
        Budget budget = budgetRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found with id: " + id));

        BigDecimal spent = calculateSpentForCategoryAndMonth(userId, budget.getCategory(), budget.getMonth(), budget.getYear());
        return new BudgetResponse(budget, spent);
    }

    public BudgetResponse createBudget(String userId, BudgetRequest request) {
        String category = request.getCategory().trim();
        validateCategoryExists(userId, category);

        LocalDate now = LocalDate.now();
        int month = (request.getMonth() >= 1 && request.getMonth() <= 12) ? request.getMonth() : now.getMonthValue();
        int year = (request.getYear() >= 2000) ? request.getYear() : now.getYear();

        if (budgetRepository.existsByUserIdAndCategoryAndMonthAndYear(userId, category, month, year)) {
            throw new ConflictException(String.format("A budget for category '%s' in %02d/%d already exists", category, month, year));
        }

        Budget budget = new Budget();
        budget.setUserId(userId);
        budget.setName(request.getName() != null && !request.getName().isBlank() ? request.getName().trim() : category + " Budget");
        budget.setCategory(category);
        budget.setMonthlyLimit(request.getMonthlyLimit());
        budget.setMonth(month);
        budget.setYear(year);
        budget.setAlertThreshold(request.getAlertThreshold() > 0 ? request.getAlertThreshold() : 80.0);
        budget.setCreatedAt(LocalDateTime.now());
        budget.setUpdatedAt(LocalDateTime.now());

        Budget saved = budgetRepository.save(budget);
        BigDecimal spent = calculateSpentForCategoryAndMonth(userId, category, month, year);

        // Check if existing transactions in this month already hit the threshold
        checkAndNotifyBudget(saved, spent);

        return new BudgetResponse(saved, spent);
    }

    public BudgetResponse updateBudget(String id, String userId, BudgetRequest request) {
        Budget budget = budgetRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found with id: " + id));

        String category = request.getCategory().trim();
        validateCategoryExists(userId, category);

        int month = (request.getMonth() >= 1 && request.getMonth() <= 12) ? request.getMonth() : budget.getMonth();
        int year = (request.getYear() >= 2000) ? request.getYear() : budget.getYear();

        // If category, month or year changed, verify no conflict
        if (!budget.getCategory().equalsIgnoreCase(category) || budget.getMonth() != month || budget.getYear() != year) {
            if (budgetRepository.existsByUserIdAndCategoryAndMonthAndYear(userId, category, month, year)) {
                throw new ConflictException(String.format("A budget for category '%s' in %02d/%d already exists", category, month, year));
            }
        }

        budget.setName(request.getName() != null && !request.getName().isBlank() ? request.getName().trim() : category + " Budget");
        budget.setCategory(category);
        budget.setMonthlyLimit(request.getMonthlyLimit());
        budget.setMonth(month);
        budget.setYear(year);
        budget.setAlertThreshold(request.getAlertThreshold() > 0 ? request.getAlertThreshold() : 80.0);
        budget.setUpdatedAt(LocalDateTime.now());

        Budget saved = budgetRepository.save(budget);
        BigDecimal spent = calculateSpentForCategoryAndMonth(userId, category, month, year);

        checkAndNotifyBudget(saved, spent);

        return new BudgetResponse(saved, spent);
    }

    public void deleteBudget(String id, String userId) {
        Budget budget = budgetRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found with id: " + id));

        budgetRepository.delete(budget);
    }

    public void checkBudgetAlertsForTransaction(String userId, String category, LocalDate date) {
        int month = date.getMonthValue();
        int year = date.getYear();

        budgetRepository.findByUserIdAndCategoryAndMonthAndYear(userId, category, month, year)
                .ifPresent(budget -> {
                    BigDecimal spent = calculateSpentForCategoryAndMonth(userId, category, month, year);
                    checkAndNotifyBudget(budget, spent);
                });
    }

    private void checkAndNotifyBudget(Budget budget, BigDecimal spent) {
        if (budget.getMonthlyLimit() == null || budget.getMonthlyLimit().compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }

        BigDecimal limit = budget.getMonthlyLimit();
        double percent = spent.divide(limit, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue();

        boolean updated = false;

        // 1. Exceeded alert
        if (spent.compareTo(limit) > 0 && !budget.isAlertSentForExceeded()) {
            budget.setAlertSentForExceeded(true);
            budget.setAlertSentForThreshold(true); // also consider threshold passed
            budget.setLastAlertSentAt(LocalDateTime.now());
            updated = true;

            // In-app notification
            notificationService.createNotification(
                    budget.getUserId(),
                    "Budget Exceeded: " + budget.getCategory(),
                    String.format("You have exceeded your monthly limit for %s. Spent: $%s, Limit: $%s.",
                            budget.getCategory(), spent.toPlainString(), limit.toPlainString()),
                    NotificationType.BUDGET_EXCEEDED
            );

            // Email dispatch
            userRepository.findById(budget.getUserId()).ifPresent(user -> {
                emailService.sendBudgetExceededEmail(
                        user.getEmail(),
                        user.getFullName(),
                        budget.getCategory(),
                        spent.toPlainString(),
                        limit.toPlainString()
                );
            });
        }
        // 2. Threshold alert
        else if (percent >= budget.getAlertThreshold() && !budget.isAlertSentForThreshold() && spent.compareTo(limit) <= 0) {
            budget.setAlertSentForThreshold(true);
            budget.setLastAlertSentAt(LocalDateTime.now());
            updated = true;

            // In-app notification
            notificationService.createNotification(
                    budget.getUserId(),
                    "Budget Warning: " + budget.getCategory(),
                    String.format("You have used %.1f%% of your budget for %s ($%s / $%s).",
                            percent, budget.getCategory(), spent.toPlainString(), limit.toPlainString()),
                    NotificationType.BUDGET_WARNING
            );

            // Email dispatch
            userRepository.findById(budget.getUserId()).ifPresent(user -> {
                emailService.sendBudgetWarningEmail(
                        user.getEmail(),
                        user.getFullName(),
                        budget.getCategory(),
                        spent.toPlainString(),
                        limit.toPlainString(),
                        percent
                );
            });
        }

        if (updated) {
            budgetRepository.save(budget);
        }
    }

    private BigDecimal calculateSpentForCategoryAndMonth(String userId, String category, int month, int year) {
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate start = yearMonth.atDay(1);
        LocalDate end = yearMonth.atEndOfMonth();

        List<Transaction> transactions = transactionRepository.findByUserIdAndCategoryAndDateBetween(userId, category, start, end);
        BigDecimal total = BigDecimal.ZERO;

        for (Transaction t : transactions) {
            // ONLY count EXPENSES toward spending
            if (t.getType() == TransactionType.EXPENSE && t.getAmount() != null) {
                total = total.add(t.getAmount());
            }
        }
        return total;
    }

    private void validateCategoryExists(String userId, String categoryName) {
        boolean exists = categoryRepository.existsByNameIgnoreCaseAndUserId(categoryName, userId)
                || categoryRepository.existsByNameIgnoreCaseAndIsSystemTrue(categoryName);
        if (!exists) {
            throw new BadRequestException("Category '" + categoryName + "' does not exist");
        }
    }
}
