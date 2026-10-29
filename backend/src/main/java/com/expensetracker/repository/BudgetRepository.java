package com.expensetracker.repository;

import com.expensetracker.model.Budget;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BudgetRepository extends MongoRepository<Budget, String> {

    List<Budget> findByUserIdAndMonthAndYear(String userId, int month, int year);

    Optional<Budget> findByUserIdAndCategoryAndMonthAndYear(String userId, String category, int month, int year);

    Optional<Budget> findByIdAndUserId(String id, String userId);

    List<Budget> findByMonthAndYear(int month, int year);

    boolean existsByUserIdAndCategoryAndMonthAndYear(String userId, String category, int month, int year);

    List<Budget> findByUserId(String userId);

    long countByUserId(String userId);
}
