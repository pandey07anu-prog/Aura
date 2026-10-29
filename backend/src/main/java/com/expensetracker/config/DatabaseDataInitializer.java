package com.expensetracker.config;

import com.expensetracker.model.Category;
import com.expensetracker.model.Role;
import com.expensetracker.model.TransactionType;
import com.expensetracker.model.User;
import com.expensetracker.model.UserStatus;
import com.expensetracker.repository.CategoryRepository;
import com.expensetracker.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class DatabaseDataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DatabaseDataInitializer.class);

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.default-email:admin@aurafinance.com}")
    private String adminEmail;

    @Value("${app.admin.default-password:Admin@123456}")
    private String adminPassword;

    public DatabaseDataInitializer(CategoryRepository categoryRepository,
                                   UserRepository userRepository,
                                   PasswordEncoder passwordEncoder) {
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        initDefaultCategories();
        initDefaultAdminUser();
    }

    private void initDefaultCategories() {
        log.info("Checking and initializing system default financial categories in MongoDB...");

        // Default Expense Categories
        List<Category> defaultExpense = List.of(
                new Category(null, "Food", TransactionType.EXPENSE, "utensils", "#F59E0B", true),
                new Category(null, "Shopping", TransactionType.EXPENSE, "shopping-bag", "#EC4899", true),
                new Category(null, "Transportation", TransactionType.EXPENSE, "car", "#3B82F6", true),
                new Category(null, "Rent", TransactionType.EXPENSE, "home", "#8B5CF6", true),
                new Category(null, "Bills and Utilities", TransactionType.EXPENSE, "zap", "#10B981", true),
                new Category(null, "Healthcare", TransactionType.EXPENSE, "heart-pulse", "#EF4444", true),
                new Category(null, "Education", TransactionType.EXPENSE, "graduation-cap", "#6366F1", true),
                new Category(null, "Entertainment", TransactionType.EXPENSE, "film", "#F97316", true),
                new Category(null, "Travel", TransactionType.EXPENSE, "plane", "#06B6D4", true),
                new Category(null, "Other", TransactionType.EXPENSE, "tag", "#A3A3A3", true)
        );

        // Default Income Categories
        List<Category> defaultIncome = List.of(
                new Category(null, "Salary", TransactionType.INCOME, "wallet", "#10B981", true),
                new Category(null, "Freelancing", TransactionType.INCOME, "laptop", "#3B82F6", true),
                new Category(null, "Business", TransactionType.INCOME, "briefcase", "#8B5CF6", true),
                new Category(null, "Investments", TransactionType.INCOME, "trending-up", "#F59E0B", true),
                new Category(null, "Gifts", TransactionType.INCOME, "gift", "#EC4899", true),
                new Category(null, "Other Income", TransactionType.INCOME, "dollar-sign", "#A3A3A3", true)
        );

        for (Category cat : defaultExpense) {
            if (!categoryRepository.existsByNameIgnoreCaseAndIsSystemTrue(cat.getName())) {
                categoryRepository.save(cat);
                log.info("Initialized system expense category: {}", cat.getName());
            }
        }

        for (Category cat : defaultIncome) {
            if (!categoryRepository.existsByNameIgnoreCaseAndIsSystemTrue(cat.getName())) {
                categoryRepository.save(cat);
                log.info("Initialized system income category: {}", cat.getName());
            }
        }
    }

    private void initDefaultAdminUser() {
        if (!userRepository.existsByEmail(adminEmail)) {
            log.info("Creating initial authorized administrator account: {}", adminEmail);
            User admin = new User();
            admin.setFullName("AURA System Administrator");
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode(adminPassword));
            admin.setRole(Role.ROLE_ADMIN);
            admin.setStatus(UserStatus.ACTIVE);
            admin.setCreatedAt(LocalDateTime.now());
            admin.setUpdatedAt(LocalDateTime.now());
            admin.setLastLoginAt(LocalDateTime.now());
            userRepository.save(admin);
            log.info("Administrator account successfully initialized.");
        }
    }
}
