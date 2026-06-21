package com.davimendonca7.keepit.domain.category.dto;

import com.davimendonca7.keepit.domain.category.TransactionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CategoryRequestDto(
        @NotBlank String name,
        @NotNull TransactionType type
) {}
