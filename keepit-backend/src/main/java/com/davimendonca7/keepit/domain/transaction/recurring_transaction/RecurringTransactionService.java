package com.davimendonca7.keepit.domain.transaction.recurring_transaction;

import com.davimendonca7.keepit.domain.category.Category;
import com.davimendonca7.keepit.domain.category.CategoryRepository;
import com.davimendonca7.keepit.domain.transaction.Transaction;
import com.davimendonca7.keepit.domain.transaction.TransactionRepository;
import com.davimendonca7.keepit.domain.transaction.TransactionStatus;
import com.davimendonca7.keepit.domain.transaction.dto.RecurringTransactionRequestDto;
import com.davimendonca7.keepit.domain.transaction.dto.RecurringTransactionResponseDto;
import com.davimendonca7.keepit.domain.transaction.dto.TransactionResponseDto;
import com.davimendonca7.keepit.domain.user.User;
import com.davimendonca7.keepit.domain.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RecurringTransactionService {

    private final RecurringTransactionRepository recurringTransactionRepository;
    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;
    private final UserService userService;

    public RecurringTransactionResponseDto createRecurringTransaction(RecurringTransactionRequestDto dto) {
        User user = userService.getAuthenticatedUser();

        Category category = categoryRepository.findByIdAndUserEmail(dto.categoryId(), UserService.getAuthenticatedUsername())
                .orElseThrow(() -> new RuntimeException("Categoria não encontrada"));

        RecurringTransaction rt = RecurringTransaction.builder()
                .description(dto.description())
                .amount(dto.amount())
                .dayOfMonth(dto.dayOfMonth())
                .type(dto.type())
                .category(category)
                .user(user)
                .build();

        return new RecurringTransactionResponseDto(recurringTransactionRepository.save(rt));
    }

    public List<RecurringTransactionResponseDto> listRecurringTransactions() {
        String username = UserService.getAuthenticatedUsername();
        return recurringTransactionRepository.findAllByUserEmail(username)
                .stream().map(RecurringTransactionResponseDto::new).toList();
    }

    public RecurringTransactionResponseDto updateRecurringTransaction(Long id, RecurringTransactionRequestDto dto) {
        String username = UserService.getAuthenticatedUsername();
        RecurringTransaction rt = recurringTransactionRepository.findByIdAndUserEmail(id, username)
                .orElseThrow(() -> new RuntimeException("Transação recorrente não encontrada"));

        Category category = categoryRepository.findByIdAndUserEmail(dto.categoryId(), username)
                .orElseThrow(() -> new RuntimeException("Categoria não encontrada"));

        rt.setDescription(dto.description());
        rt.setAmount(dto.amount());
        rt.setDayOfMonth(dto.dayOfMonth());
        rt.setType(dto.type());
        rt.setCategory(category);

        return new RecurringTransactionResponseDto(recurringTransactionRepository.save(rt));
    }

    public void deleteRecurringTransaction(Long id) {
        String username = UserService.getAuthenticatedUsername();
        RecurringTransaction rt = recurringTransactionRepository.findByIdAndUserEmail(id, username)
                .orElseThrow(() -> new RuntimeException("Transação recorrente não encontrada"));
        recurringTransactionRepository.delete(rt);
    }

    public RecurringTransactionResponseDto pauseRecurringTransaction(Long id) {
        String username = UserService.getAuthenticatedUsername();
        RecurringTransaction rt = recurringTransactionRepository.findByIdAndUserEmail(id, username)
                .orElseThrow(() -> new RuntimeException("Transação recorrente não encontrada"));
        rt.setActive(false);
        return new RecurringTransactionResponseDto(recurringTransactionRepository.save(rt));
    }

    public RecurringTransactionResponseDto resumeRecurringTransaction(Long id) {
        String username = UserService.getAuthenticatedUsername();
        RecurringTransaction rt = recurringTransactionRepository.findByIdAndUserEmail(id, username)
                .orElseThrow(() -> new RuntimeException("Transação recorrente não encontrada"));
        rt.setActive(true);
        return new RecurringTransactionResponseDto(recurringTransactionRepository.save(rt));
    }

    public List<TransactionResponseDto> generateMonthlyTransactions(int month, int year) {
        String username = UserService.getAuthenticatedUsername();
        List<RecurringTransaction> activeTemplates = recurringTransactionRepository
                .findAllByUserEmailAndActive(username, true);

        YearMonth yearMonth = YearMonth.of(year, month);
        int lengthOfMonth = yearMonth.lengthOfMonth();

        return activeTemplates.stream()
                .filter(rt -> !transactionRepository.existsByRecurringTransactionIdAndUserUsernameAndStatusNot(
                        rt.getId(), username, TransactionStatus.COMPLETED))
                .map(rt -> {
                    int day = Math.min(rt.getDayOfMonth(), lengthOfMonth);
                    LocalDate date = LocalDate.of(year, month, day);
                    Transaction t = new Transaction(rt, date);
                    return new TransactionResponseDto(transactionRepository.save(t));
                })
                .toList();
    }
}
