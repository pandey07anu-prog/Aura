package com.expensetracker.repository;

import com.expensetracker.model.RecurringStatus;
import com.expensetracker.model.RecurringTransaction;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface RecurringTransactionRepository extends MongoRepository<RecurringTransaction, String> {

    List<RecurringTransaction> findByUserId(String userId);

    Optional<RecurringTransaction> findByIdAndUserId(String id, String userId);

    List<RecurringTransaction> findByStatusAndNextExecutionDateLessThanEqual(RecurringStatus status, LocalDate date);

    long countByUserId(String userId);
}
