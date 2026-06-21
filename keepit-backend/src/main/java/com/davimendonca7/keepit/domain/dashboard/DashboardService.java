package com.davimendonca7.keepit.domain.dashboard;

import com.davimendonca7.keepit.domain.category.TransactionType;
import com.davimendonca7.keepit.domain.dashboard.dto.CategoryTotalDto;
import com.davimendonca7.keepit.domain.dashboard.dto.DashboardResponseDto;
import com.davimendonca7.keepit.domain.dashboard.dto.MonthSummaryDto;
import com.davimendonca7.keepit.domain.transaction.Transaction;
import com.davimendonca7.keepit.domain.transaction.TransactionRepository;
import com.davimendonca7.keepit.domain.transaction.TransactionStatus;
import com.davimendonca7.keepit.domain.transaction.dto.TransactionResponseDto;
import com.davimendonca7.keepit.domain.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final TransactionRepository transactionRepository;

    public DashboardResponseDto getDashboard(int month, int year) {
        String username = UserService.getAuthenticatedUsername();

        // Saldo atual: todas as COMPLETED (histórico total)
        List<Transaction> allCompleted = transactionRepository.findByUserUsernameAndStatus(username, TransactionStatus.COMPLETED);
        BigDecimal saldoAtual = allCompleted.stream()
                .map(t -> t.getType() == TransactionType.INCOME ? t.getAmount() : t.getAmount().negate())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Transações COMPLETED do mês
        List<Transaction> completedMes = transactionRepository
                .findByUserUsernameAndMonthAndYearAndStatus(username, month, year, TransactionStatus.COMPLETED);

        BigDecimal totalReceitasMes = completedMes.stream()
                .filter(t -> t.getType() == TransactionType.INCOME)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalDespesasMes = completedMes.stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal saldoMes = totalReceitasMes.subtract(totalDespesasMes);

        // Saldo projetado: saldoMes + PENDING do mês
        List<Transaction> pendingMes = transactionRepository
                .findPendingByUserUsernameAndMonthAndYear(username, TransactionStatus.PENDING, month, year);

        BigDecimal pendingReceitas = pendingMes.stream()
                .filter(t -> t.getType() == TransactionType.INCOME)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal pendingDespesas = pendingMes.stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal saldoProjetado = saldoMes.add(pendingReceitas).subtract(pendingDespesas);

        // Despesas por categoria (COMPLETED do mês)
        Map<String, BigDecimal> despesasPorCatMap = completedMes.stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE)
                .collect(Collectors.groupingBy(
                        t -> t.getCategory().getName(),
                        Collectors.reducing(BigDecimal.ZERO, Transaction::getAmount, BigDecimal::add)
                ));
        List<CategoryTotalDto> despesasPorCategoria = despesasPorCatMap.entrySet().stream()
                .map(e -> new CategoryTotalDto(e.getKey(), e.getValue()))
                .sorted(Comparator.comparing(CategoryTotalDto::total).reversed())
                .toList();

        // Receita vs Despesa — últimos 6 meses
        List<MonthSummaryDto> receitaVsDespesa6Meses = new ArrayList<>();
        YearMonth current = YearMonth.of(year, month);
        for (int i = 5; i >= 0; i--) {
            YearMonth ym = current.minusMonths(i);
            List<Transaction> monthCompleted = transactionRepository
                    .findByUserUsernameAndMonthAndYearAndStatus(username, ym.getMonthValue(), ym.getYear(), TransactionStatus.COMPLETED);

            BigDecimal rec = monthCompleted.stream()
                    .filter(t -> t.getType() == TransactionType.INCOME)
                    .map(Transaction::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal desp = monthCompleted.stream()
                    .filter(t -> t.getType() == TransactionType.EXPENSE)
                    .map(Transaction::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            receitaVsDespesa6Meses.add(new MonthSummaryDto(ym.getMonthValue(), ym.getYear(), rec, desp));
        }

        // Últimos lançamentos (top 10)
        List<TransactionResponseDto> ultimosLancamentos = transactionRepository
                .findTop10ByUserUsernameOrderByDateDesc(username)
                .stream()
                .limit(10)
                .map(TransactionResponseDto::new)
                .toList();

        // Fixos pendentes do mês
        List<TransactionResponseDto> fixosPendentesMes = pendingMes.stream()
                .filter(t -> t.getRecurringTransaction() != null)
                .map(TransactionResponseDto::new)
                .toList();

        return new DashboardResponseDto(
                saldoAtual,
                totalReceitasMes,
                totalDespesasMes,
                saldoMes,
                saldoProjetado,
                despesasPorCategoria,
                receitaVsDespesa6Meses,
                ultimosLancamentos,
                fixosPendentesMes
        );
    }
}
