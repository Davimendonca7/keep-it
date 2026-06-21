package com.davimendonca7.keepit.domain.transaction.recurring_transaction;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RecurringTransactionRepository extends JpaRepository<RecurringTransaction, Long> {
    Boolean existsByCategoryId(Long categoryId);
    Optional<RecurringTransaction> findByIdAndUserUsername(Long id, String username);
    List<RecurringTransaction> findAllByUserUsername(String username);
    List<RecurringTransaction> findAllByUserUsernameAndActive(String username, boolean active);
}
