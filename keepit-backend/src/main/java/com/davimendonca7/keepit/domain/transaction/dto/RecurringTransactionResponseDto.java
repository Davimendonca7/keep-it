package com.davimendonca7.keepit.domain.transaction.dto;

import com.davimendonca7.keepit.domain.category.TransactionType;
import com.davimendonca7.keepit.domain.transaction.recurring_transaction.RecurringTransaction;

import java.math.BigDecimal;

public record RecurringTransactionResponseDto(
        Long id,
        String description,
        BigDecimal amount,
        Integer dayOfMonth,
        TransactionType type,
        Boolean active,
        Long categoryId
) {
    public RecurringTransactionResponseDto(RecurringTransaction rt) {
        this(rt.getId(), rt.getDescription(), rt.getAmount(), rt.getDayOfMonth(),
             rt.getType(), rt.getActive(), rt.getCategory().getId());
    }
}
