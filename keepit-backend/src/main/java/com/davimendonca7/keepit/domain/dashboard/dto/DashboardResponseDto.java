package com.davimendonca7.keepit.domain.dashboard.dto;

import com.davimendonca7.keepit.domain.transaction.dto.TransactionResponseDto;

import java.math.BigDecimal;
import java.util.List;

public record DashboardResponseDto(
        BigDecimal saldoAtual,
        BigDecimal totalReceitasMes,
        BigDecimal totalDespesasMes,
        BigDecimal saldoMes,
        BigDecimal saldoProjetado,
        List<CategoryTotalDto> despesasPorCategoria,
        List<MonthSummaryDto> receitaVsDespesa6Meses,
        List<TransactionResponseDto> ultimosLancamentos,
        List<TransactionResponseDto> fixosPendentesMes
) {}
