package com.davimendonca7.keepit.domain.dashboard.dto;

import java.math.BigDecimal;

public record CategoryTotalDto(
        String categoryName,
        BigDecimal total
) {}
