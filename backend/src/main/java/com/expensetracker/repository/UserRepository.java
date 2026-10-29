package com.expensetracker.repository;

import com.expensetracker.model.Role;
import com.expensetracker.model.User;
import com.expensetracker.model.UserStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<User> findByResetPasswordToken(String token);

    long countByStatus(UserStatus status);

    long countByCreatedAtAfter(LocalDateTime date);

    long countByRole(Role role);
}
