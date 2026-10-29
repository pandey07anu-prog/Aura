package com.expensetracker.repository;

import com.expensetracker.model.Category;
import com.expensetracker.model.TransactionType;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends MongoRepository<Category, String> {

    @Query("{ '$or': [ { 'userId': ?0 }, { 'isSystem': true } ], 'isArchived': false }")
    List<Category> findActiveCategoriesForUser(String userId);

    @Query("{ '$or': [ { 'userId': ?0 }, { 'isSystem': true } ], 'type': ?1, 'isArchived': false }")
    List<Category> findActiveCategoriesForUserAndType(String userId, TransactionType type);

    Optional<Category> findByIdAndUserId(String id, String userId);

    Optional<Category> findByNameIgnoreCaseAndUserId(String name, String userId);

    Optional<Category> findByNameIgnoreCaseAndIsSystemTrue(String name);

    boolean existsByNameIgnoreCaseAndUserId(String name, String userId);

    boolean existsByNameIgnoreCaseAndIsSystemTrue(String name);

    List<Category> findByIsSystemTrue();

    long countByUserId(String userId);
}
