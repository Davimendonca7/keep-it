package com.davimendonca7.keepit.domain.transaction;

import com.davimendonca7.keepit.domain.category.Category;
import com.davimendonca7.keepit.domain.category.CategoryRepository;
import com.davimendonca7.keepit.domain.transaction.dto.TransactionRequestDto;
import com.davimendonca7.keepit.domain.transaction.dto.TransactionResponseDto;
import com.davimendonca7.keepit.domain.user.User;
import com.davimendonca7.keepit.domain.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;
    private final UserService userService;

    public TransactionResponseDto createTransaction(TransactionRequestDto dto) {
        User user = userService.getAuthenticatedUser();


        Category category = categoryRepository.findByIdAndUserEmail(dto.categoryId(), UserService.getAuthenticatedUsername())
                .orElseThrow(() -> new RuntimeException("Categoria não encontrada"));


        if (!category.getType().equals(dto.type())) {
            throw new RuntimeException("O tipo da transação deve ser igual ao tipo da categoria");
        }

        Transaction transaction = Transaction.builder()
                .description(dto.description())
                .amount(dto.amount())
                .date(dto.date())
                .type(dto.type())
                .status(TransactionStatus.COMPLETED)
                .category(category)
                .user(user)
                .build();

        return new TransactionResponseDto(transactionRepository.save(transaction));
    }

    public List<TransactionResponseDto> listTransactions(int month, int year, Long categoryId, TransactionStatus status) {
        String username = UserService.getAuthenticatedUsername();
        List<Transaction> transactions;

        if (categoryId != null && status != null) {
            transactions = transactionRepository.findByUserUsernameAndMonthAndYearAndCategoryIdAndStatus(username, month, year, categoryId, status);
        } else if (categoryId != null) {
            transactions = transactionRepository.findByUserUsernameAndMonthAndYearAndCategoryId(username, month, year, categoryId);
        } else if (status != null) {
            transactions = transactionRepository.findByUserUsernameAndMonthAndYearAndStatus(username, month, year, status);
        } else {
            transactions = transactionRepository.findByUserUsernameAndMonthAndYear(username, month, year);
        }

        return transactions.stream().map(TransactionResponseDto::new).toList();
    }

    public TransactionResponseDto updateTransaction(Long id, TransactionRequestDto dto) {
        String username = UserService.getAuthenticatedUsername();
        Transaction transaction = transactionRepository.findByIdAndUserEmail(id, username)
                .orElseThrow(() -> new RuntimeException("Transação não encontrada"));

        Category category = categoryRepository.findByIdAndUserEmail(dto.categoryId(), username)
                .orElseThrow(() -> new RuntimeException("Categoria não encontrada"));

        if (!category.getType().equals(dto.type())) {
            throw new RuntimeException("O tipo da transação deve ser igual ao tipo da categoria");
        }

        transaction.setDescription(dto.description());
        transaction.setAmount(dto.amount());
        transaction.setDate(dto.date());
        transaction.setType(dto.type());
        transaction.setCategory(category);

        return new TransactionResponseDto(transactionRepository.save(transaction));
    }

    public void deleteTransaction(Long id) {
        String username = UserService.getAuthenticatedUsername();
        Transaction transaction = transactionRepository.findByIdAndUserEmail(id, username)
                .orElseThrow(() -> new RuntimeException("Transação não encontrada"));
        transactionRepository.delete(transaction);
    }

    public TransactionResponseDto confirmTransaction(Long id) {
        String username = UserService.getAuthenticatedUsername();
        Transaction transaction = transactionRepository.findByIdAndUserEmail(id, username)
                .orElseThrow(() -> new RuntimeException("Transação não encontrada"));

        if (transaction.getStatus() == TransactionStatus.COMPLETED) {
            throw new RuntimeException("Transação já está confirmada");
        }

        transaction.setStatus(TransactionStatus.COMPLETED);
        return new TransactionResponseDto(transactionRepository.save(transaction));
    }
}
