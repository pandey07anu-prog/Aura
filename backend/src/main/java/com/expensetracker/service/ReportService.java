package com.expensetracker.service;

import com.expensetracker.dto.*;
import com.expensetracker.exception.BadRequestException;
import com.expensetracker.model.Category;
import com.expensetracker.model.Transaction;
import com.expensetracker.model.TransactionType;
import com.expensetracker.repository.CategoryRepository;
import com.expensetracker.repository.TransactionRepository;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.OutputStreamWriter;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;
    private final BudgetService budgetService;

    public ReportService(TransactionRepository transactionRepository,
                         CategoryRepository categoryRepository,
                         BudgetService budgetService) {
        this.transactionRepository = transactionRepository;
        this.categoryRepository = categoryRepository;
        this.budgetService = budgetService;
    }

    public ReportsResponse getReports(String userId, LocalDate startDate, LocalDate endDate) {
        LocalDate end = (endDate != null) ? endDate : LocalDate.now();
        LocalDate start = (startDate != null) ? startDate : end.minusMonths(1).plusDays(1);

        if (start.isAfter(end)) {
            throw new BadRequestException("Start date cannot be after end date");
        }

        List<Transaction> transactions = transactionRepository.findByUserIdAndDateBetween(userId, start, end);

        // 1. Calculate Summary
        FinancialSummaryDto summary = calculateSummary(userId, transactions, start, end);

        // 2. Category Distribution (focusing on EXPENSE)
        List<CategorySpendingDto> categoryDistribution = calculateCategoryDistribution(userId, transactions);

        // 3. Highest spending category
        CategorySpendingDto highestCategory = categoryDistribution.stream()
                .max(Comparator.comparing(CategorySpendingDto::getAmount))
                .orElse(null);

        // 4. Monthly Trend (last 6 months up to end date)
        List<MonthlyTrendDto> monthlyTrends = calculateMonthlyTrends(userId, end, 6);

        return new ReportsResponse(summary, categoryDistribution, monthlyTrends, highestCategory);
    }

    public FinancialSummaryDto getDashboardSummary(String userId) {
        LocalDate now = LocalDate.now();
        YearMonth currentYearMonth = YearMonth.of(now.getYear(), now.getMonthValue());
        LocalDate startOfMonth = currentYearMonth.atDay(1);
        LocalDate endOfMonth = currentYearMonth.atEndOfMonth();

        List<Transaction> currentMonthTransactions = transactionRepository.findByUserIdAndDateBetween(userId, startOfMonth, endOfMonth);
        FinancialSummaryDto summary = calculateSummary(userId, currentMonthTransactions, startOfMonth, endOfMonth);

        // Budget remaining for current month
        List<BudgetResponse> budgets = budgetService.getBudgetsForUser(userId, now.getMonthValue(), now.getYear());
        BigDecimal totalBudgetLimit = BigDecimal.ZERO;
        BigDecimal totalBudgetSpent = BigDecimal.ZERO;
        for (BudgetResponse b : budgets) {
            totalBudgetLimit = totalBudgetLimit.add(b.getMonthlyLimit());
            totalBudgetSpent = totalBudgetSpent.add(b.getSpent());
        }
        BigDecimal remainingBudget = totalBudgetLimit.subtract(totalBudgetSpent);
        summary.setRemainingMonthlyBudget(remainingBudget.compareTo(BigDecimal.ZERO) > 0 ? remainingBudget : BigDecimal.ZERO);

        return summary;
    }

    public byte[] exportToCsv(String userId, LocalDate startDate, LocalDate endDate) {
        LocalDate end = (endDate != null) ? endDate : LocalDate.now();
        LocalDate start = (startDate != null) ? startDate : end.minusYears(1);

        if (start.isAfter(end)) {
            throw new BadRequestException("Start date cannot be after end date");
        }

        List<Transaction> transactions = transactionRepository.findByUserIdAndDateBetween(userId, start, end);
        transactions.sort(Comparator.comparing(Transaction::getDate).reversed());

        try (ByteArrayOutputStream out = new ByteArrayOutputStream();
             OutputStreamWriter writer = new OutputStreamWriter(out, StandardCharsets.UTF_8);
             CSVPrinter csvPrinter = new CSVPrinter(writer, CSVFormat.DEFAULT.builder()
                     .setHeader("Transaction ID", "Date", "Type", "Category", "Amount", "Description", "Payment Method", "Notes")
                     .build())) {

            DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            for (Transaction t : transactions) {
                csvPrinter.printRecord(
                        t.getId(),
                        t.getDate() != null ? t.getDate().format(dtf) : "",
                        t.getType() != null ? t.getType().name() : "",
                        t.getCategory(),
                        t.getAmount() != null ? t.getAmount().toPlainString() : "0.00",
                        t.getDescription(),
                        t.getPaymentMethod() != null ? t.getPaymentMethod().name() : "",
                        t.getNotes() != null ? t.getNotes() : ""
                );
            }
            csvPrinter.flush();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate CSV export", e);
        }
    }

    private FinancialSummaryDto calculateSummary(String userId, List<Transaction> transactions, LocalDate start, LocalDate end) {
        FinancialSummaryDto summary = new FinancialSummaryDto();

        BigDecimal income = BigDecimal.ZERO;
        BigDecimal expense = BigDecimal.ZERO;

        for (Transaction t : transactions) {
            if (t.getAmount() == null) continue;
            if (t.getType() == TransactionType.INCOME) {
                income = income.add(t.getAmount());
            } else if (t.getType() == TransactionType.EXPENSE) {
                expense = expense.add(t.getAmount());
            }
        }

        summary.setTotalIncome(income);
        summary.setTotalExpenses(expense);
        summary.setCurrentBalance(income.subtract(expense));
        summary.setTotalTransactions(transactions.size());
        summary.setHasData(!transactions.isEmpty());

        if (income.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal net = income.subtract(expense);
            double rate = net.divide(income, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue();
            summary.setSavingsRate(Math.max(rate, 0.0));
        } else {
            summary.setSavingsRate(0.0);
        }

        // Compare with prior period of same duration
        long days = java.time.temporal.ChronoUnit.DAYS.between(start, end) + 1;
        LocalDate prevEnd = start.minusDays(1);
        LocalDate prevStart = prevEnd.minusDays(days - 1);

        List<Transaction> prevTransactions = transactionRepository.findByUserIdAndDateBetween(userId, prevStart, prevEnd);
        BigDecimal prevIncome = BigDecimal.ZERO;
        BigDecimal prevExpense = BigDecimal.ZERO;
        for (Transaction t : prevTransactions) {
            if (t.getAmount() == null) continue;
            if (t.getType() == TransactionType.INCOME) {
                prevIncome = prevIncome.add(t.getAmount());
            } else if (t.getType() == TransactionType.EXPENSE) {
                prevExpense = prevExpense.add(t.getAmount());
            }
        }

        if (prevIncome.compareTo(BigDecimal.ZERO) > 0) {
            double change = income.subtract(prevIncome).divide(prevIncome, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue();
            summary.setIncomeChangePercent(change);
        }
        if (prevExpense.compareTo(BigDecimal.ZERO) > 0) {
            double change = expense.subtract(prevExpense).divide(prevExpense, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue();
            summary.setExpenseChangePercent(change);
        }

        return summary;
    }

    private List<CategorySpendingDto> calculateCategoryDistribution(String userId, List<Transaction> transactions) {
        Map<String, Category> categoryMap = new HashMap<>();
        categoryRepository.findActiveCategoriesForUser(userId).forEach(c -> categoryMap.put(c.getName().toLowerCase(), c));

        Map<String, BigDecimal> amounts = new HashMap<>();
        Map<String, Long> counts = new HashMap<>();
        BigDecimal totalExpense = BigDecimal.ZERO;

        for (Transaction t : transactions) {
            if (t.getType() == TransactionType.EXPENSE && t.getAmount() != null) {
                String catName = t.getCategory();
                amounts.put(catName, amounts.getOrDefault(catName, BigDecimal.ZERO).add(t.getAmount()));
                counts.put(catName, counts.getOrDefault(catName, 0L) + 1);
                totalExpense = totalExpense.add(t.getAmount());
            }
        }

        List<CategorySpendingDto> distribution = new ArrayList<>();
        for (Map.Entry<String, BigDecimal> entry : amounts.entrySet()) {
            String name = entry.getKey();
            BigDecimal amount = entry.getValue();
            double pct = totalExpense.compareTo(BigDecimal.ZERO) > 0
                    ? amount.divide(totalExpense, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue()
                    : 0.0;

            Category cat = categoryMap.get(name.toLowerCase());
            String icon = cat != null ? cat.getIcon() : "tag";
            String color = cat != null ? cat.getColor() : "#FFFFFF";

            distribution.add(new CategorySpendingDto(name, TransactionType.EXPENSE, amount, pct, counts.get(name), icon, color));
        }

        distribution.sort(Comparator.comparing(CategorySpendingDto::getAmount).reversed());
        return distribution;
    }

    private List<MonthlyTrendDto> calculateMonthlyTrends(String userId, LocalDate endDate, int monthCount) {
        List<MonthlyTrendDto> trends = new ArrayList<>();
        YearMonth current = YearMonth.from(endDate);
        DateTimeFormatter labelFmt = DateTimeFormatter.ofPattern("MMM yyyy");

        for (int i = monthCount - 1; i >= 0; i--) {
            YearMonth ym = current.minusMonths(i);
            LocalDate start = ym.atDay(1);
            LocalDate end = ym.atEndOfMonth();

            List<Transaction> monthTx = transactionRepository.findByUserIdAndDateBetween(userId, start, end);
            BigDecimal inc = BigDecimal.ZERO;
            BigDecimal exp = BigDecimal.ZERO;

            for (Transaction t : monthTx) {
                if (t.getAmount() == null) continue;
                if (t.getType() == TransactionType.INCOME) {
                    inc = inc.add(t.getAmount());
                } else if (t.getType() == TransactionType.EXPENSE) {
                    exp = exp.add(t.getAmount());
                }
            }

            trends.add(new MonthlyTrendDto(ym.getMonthValue(), ym.getYear(), ym.format(labelFmt), inc, exp));
        }

        return trends;
    }
}
