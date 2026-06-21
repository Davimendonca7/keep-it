package com.davimendonca7.keepit.domain.transaction.dto;

import com.davimendonca7.keepit.domain.category.TransactionType;
import com.davimendonca7.keepit.domain.transaction.Transaction;
import com.davimendonca7.keepit.domain.transaction.TransactionStatus;

import java.math.BigDecimal;
import java.time.LocalDate;

public record TransactionResponseDto(
        Long id,
        String description,
        BigDecimal amount,
        LocalDate date,
        TransactionType type,
        TransactionStatus status,
        Long categoryId
) {
    public TransactionResponseDto(Transaction t) {
        this(t.getId(), t.getDescription(), t.getAmount(), t.getDate(),
             t.getType(), t.getStatus(), t.getCategory().getId());
    }
}
