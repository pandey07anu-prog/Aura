package com.expensetracker.service;

import com.expensetracker.dto.*;
import com.expensetracker.exception.BadRequestException;
import com.expensetracker.exception.ResourceNotFoundException;
import com.expensetracker.model.*;
import com.expensetracker.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;
    private final RecurringTransactionRepository recurringRepository;
    private final AuditLogRepository auditLogRepository;
    private final NotificationService notificationService;
    private final MongoTemplate mongoTemplate;

    public AdminService(UserRepository userRepository,
                        TransactionRepository transactionRepository,
                        CategoryRepository categoryRepository,
                        RecurringTransactionRepository recurringRepository,
                        AuditLogRepository auditLogRepository,
                        NotificationService notificationService,
                        MongoTemplate mongoTemplate) {
        this.userRepository = userRepository;
        this.transactionRepository = transactionRepository;
        this.categoryRepository = categoryRepository;
        this.recurringRepository = recurringRepository;
        this.auditLogRepository = auditLogRepository;
        this.notificationService = notificationService;
        this.mongoTemplate = mongoTemplate;
    }

    public AdminDashboardSummaryDto getDashboardSummary() {
        AdminDashboardSummaryDto dto = new AdminDashboardSummaryDto();

        dto.setTotalUsers(userRepository.count());
        dto.setActiveUsers(userRepository.countByStatus(UserStatus.ACTIVE));
        dto.setSuspendedUsers(userRepository.countByStatus(UserStatus.SUSPENDED));

        LocalDateTime startOfMonth = YearMonth.now().atDay(1).atStartOfDay();
        dto.setNewUsersThisMonth(userRepository.countByCreatedAtAfter(startOfMonth));

        dto.setTotalTransactions(transactionRepository.count());
        dto.setTotalCategoriesCount(categoryRepository.count());
        dto.setTotalActiveRecurringRules(recurringRepository.findByStatusAndNextExecutionDateLessThanEqual(
                RecurringStatus.ACTIVE, LocalDate.now().plusYears(100)
        ).size());

        // Aggregate Platform Volume across all transactions
        List<Transaction> allTransactions = transactionRepository.findAll();
        BigDecimal aggIncome = BigDecimal.ZERO;
        BigDecimal aggExpense = BigDecimal.ZERO;
        for (Transaction t : allTransactions) {
            if (t.getAmount() == null) continue;
            if (t.getType() == TransactionType.INCOME) {
                aggIncome = aggIncome.add(t.getAmount());
            } else if (t.getType() == TransactionType.EXPENSE) {
                aggExpense = aggExpense.add(t.getAmount());
            }
        }
        dto.setAggregateIncomeVolume(aggIncome);
        dto.setAggregateExpenseVolume(aggExpense);

        return dto;
    }

    public Page<UserSummaryDto> getAllUsers(Role role, UserStatus status, String search,
                                           int page, int size, String sortBy, String direction) {
        Query query = new Query();
        if (role != null) {
            query.addCriteria(Criteria.where("role").is(role));
        }
        if (status != null) {
            query.addCriteria(Criteria.where("status").is(status));
        }
        if (search != null && !search.isBlank()) {
            String pattern = "(?i)" + Pattern.quote(search.trim());
            Criteria searchCriteria = new Criteria().orOperator(
                    Criteria.where("fullName").regex(pattern),
                    Criteria.where("email").regex(pattern)
            );
            query.addCriteria(searchCriteria);
        }

        long total = mongoTemplate.count(query, User.class);

        Sort sort = Sort.by(
                "asc".equalsIgnoreCase(direction) ? Sort.Direction.ASC : Sort.Direction.DESC,
                (sortBy != null && !sortBy.isBlank()) ? sortBy : "createdAt"
        );
        Pageable pageable = PageRequest.of(page >= 0 ? page : 0, size > 0 ? size : 20, sort);
        query.with(pageable);

        List<User> users = mongoTemplate.find(query, User.class);
        List<UserSummaryDto> responses = users.stream()
                .map(UserSummaryDto::new)
                .collect(Collectors.toList());

        return new PageImpl<>(responses, pageable, total);
    }

    public AdminUserDetailDto getUserDetails(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        AdminUserDetailDto detail = new AdminUserDetailDto();
        detail.setUser(new UserSummaryDto(user));

        List<Transaction> transactions = transactionRepository.findByUserId(userId);
        detail.setTransactionCount(transactions.size());

        BigDecimal income = BigDecimal.ZERO;
        BigDecimal expense = BigDecimal.ZERO;
        Map<String, BigDecimal> categoryExpenses = new HashMap<>();

        for (Transaction t : transactions) {
            if (t.getAmount() == null) continue;
            if (t.getType() == TransactionType.INCOME) {
                income = income.add(t.getAmount());
            } else if (t.getType() == TransactionType.EXPENSE) {
                expense = expense.add(t.getAmount());
                String cat = t.getCategory();
                categoryExpenses.put(cat, categoryExpenses.getOrDefault(cat, BigDecimal.ZERO).add(t.getAmount()));
            }
        }

        detail.setTotalIncome(income);
        detail.setTotalExpenses(expense);
        detail.setCurrentBalance(income.subtract(expense));

        // Top categories
        List<CategorySpendingDto> topCats = new ArrayList<>();
        for (Map.Entry<String, BigDecimal> entry : categoryExpenses.entrySet()) {
            double pct = expense.compareTo(BigDecimal.ZERO) > 0
                    ? entry.getValue().divide(expense, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue()
                    : 0.0;
            topCats.add(new CategorySpendingDto(entry.getKey(), TransactionType.EXPENSE, entry.getValue(), pct, 0, "tag", "#FFFFFF"));
        }
        topCats.sort(Comparator.comparing(CategorySpendingDto::getAmount).reversed());
        detail.setTopCategories(topCats.stream().limit(5).collect(Collectors.toList()));

        // Recent transactions
        List<TransactionResponse> recent = transactionRepository.findTop10ByUserIdOrderByDateDescCreatedAtDesc(userId)
                .stream().map(TransactionResponse::new).collect(Collectors.toList());
        detail.setRecentTransactions(recent);

        // Audit logs
        detail.setAuditLogs(auditLogRepository.findByTargetUserIdOrderByTimestampDesc(userId));

        return detail;
    }

    public UserSummaryDto updateUserStatus(String targetUserId, UserStatusUpdateRequest request,
                                          String adminId, String adminEmail, String ipAddress) {
        User user = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + targetUserId));

        if (user.getRole() == Role.ROLE_ADMIN && request.getStatus() == UserStatus.SUSPENDED) {
            throw new BadRequestException("Administrator accounts cannot be suspended");
        }

        UserStatus oldStatus = user.getStatus();
        user.setStatus(request.getStatus());
        user.setUpdatedAt(LocalDateTime.now());
        User updated = userRepository.save(user);

        // Record Audit Log
        AuditLog auditLog = new AuditLog(
                adminId,
                adminEmail,
                "USER_STATUS_CHANGE_" + request.getStatus(),
                targetUserId,
                String.format("Changed status from %s to %s. Reason: %s",
                        oldStatus, request.getStatus(), (request.getReason() != null ? request.getReason() : "None specified")),
                ipAddress
        );
        auditLogRepository.save(auditLog);

        // In-app notification for the user
        notificationService.createNotification(
                targetUserId,
                "Account Status Updated",
                "Your account status has been changed to " + request.getStatus() + " by an administrator.",
                NotificationType.SYSTEM
        );

        return new UserSummaryDto(updated);
    }

    public List<AuditLog> getRecentAuditLogs() {
        return auditLogRepository.findTop20ByOrderByTimestampDesc();
    }
}
