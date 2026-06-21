package com.davimendonca7.keepit.domain.transaction.dto;

import com.davimendonca7.keepit.domain.category.TransactionType;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record RecurringTransactionRequestDto(
        @NotBlank String description,
        @NotNull @Positive BigDecimal amount,
        @NotNull @Min(1) @Max(31) Integer dayOfMonth,
        @NotNull TransactionType type,
        @NotNull Long categoryId
) {}
