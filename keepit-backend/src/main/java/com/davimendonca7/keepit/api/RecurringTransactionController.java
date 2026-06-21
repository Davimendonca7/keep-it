package com.davimendonca7.keepit.api;

import com.davimendonca7.keepit.domain.transaction.dto.RecurringTransactionRequestDto;
import com.davimendonca7.keepit.domain.transaction.dto.RecurringTransactionResponseDto;
import com.davimendonca7.keepit.domain.transaction.dto.TransactionResponseDto;
import com.davimendonca7.keepit.domain.transaction.recurring_transaction.RecurringTransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/recurring-transactions")
@RequiredArgsConstructor
public class RecurringTransactionController {

    private final RecurringTransactionService recurringTransactionService;

    @PostMapping
    public ResponseEntity<RecurringTransactionResponseDto> create(@RequestBody @Valid RecurringTransactionRequestDto dto) {
        return ResponseEntity.status(201).body(recurringTransactionService.createRecurringTransaction(dto));
    }

    @GetMapping
    public ResponseEntity<List<RecurringTransactionResponseDto>> list() {
        return ResponseEntity.ok(recurringTransactionService.listRecurringTransactions());
    }

    @PutMapping("/{id}")
    public ResponseEntity<RecurringTransactionResponseDto> update(@PathVariable Long id, @RequestBody @Valid RecurringTransactionRequestDto dto) {
        return ResponseEntity.ok(recurringTransactionService.updateRecurringTransaction(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        recurringTransactionService.deleteRecurringTransaction(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/pause")
    public ResponseEntity<RecurringTransactionResponseDto> pause(@PathVariable Long id) {
        return ResponseEntity.ok(recurringTransactionService.pauseRecurringTransaction(id));
    }

    @PatchMapping("/{id}/resume")
    public ResponseEntity<RecurringTransactionResponseDto> resume(@PathVariable Long id) {
        return ResponseEntity.ok(recurringTransactionService.resumeRecurringTransaction(id));
    }

    @GetMapping("/generate")
    public ResponseEntity<List<TransactionResponseDto>> generate(
            @RequestParam int month,
            @RequestParam int year) {
        return ResponseEntity.ok(recurringTransactionService.generateMonthlyTransactions(month, year));
    }
}
