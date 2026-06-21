package com.davimendonca7.keepit.domain.category.dto;

import com.davimendonca7.keepit.domain.category.Category;
import com.davimendonca7.keepit.domain.category.TransactionType;

public record CategoryResponseDto(
        Long id,
        String name,
        TransactionType type
) {
    public CategoryResponseDto(Category c) {
        this(c.getId(), c.getName(), c.getType());
    }
}
