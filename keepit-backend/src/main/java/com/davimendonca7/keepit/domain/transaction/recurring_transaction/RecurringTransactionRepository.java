package com.davimendonca7.keepit.domain.transaction.recurring_transaction;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RecurringTransactionRepository extends JpaRepository<RecurringTransaction, Long> {
    Boolean existsByCategoryId(Long categoryId);
    Optional<RecurringTransaction> findByIdAndUserEmail(Long id, String username);
    List<RecurringTransaction> findAllByUserEmail(String username);
    List<RecurringTransaction> findAllByUserEmailAndActive(String username, boolean active);
}
