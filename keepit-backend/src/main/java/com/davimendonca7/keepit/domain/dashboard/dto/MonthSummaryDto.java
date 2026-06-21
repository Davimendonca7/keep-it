package com.davimendonca7.keepit.domain.dashboard.dto;

import java.math.BigDecimal;

public record MonthSummaryDto(
        int month,
        int year,
        BigDecimal totalReceitas,
        BigDecimal totalDespesas
) {}
