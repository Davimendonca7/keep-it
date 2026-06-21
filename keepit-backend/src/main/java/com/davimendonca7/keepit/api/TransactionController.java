package com.davimendonca7.keepit.api;

import com.davimendonca7.keepit.domain.transaction.TransactionService;
import com.davimendonca7.keepit.domain.transaction.TransactionStatus;
import com.davimendonca7.keepit.domain.transaction.dto.TransactionRequestDto;
import com.davimendonca7.keepit.domain.transaction.dto.TransactionResponseDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @PostMapping
    public ResponseEntity<TransactionResponseDto> create(@RequestBody @Valid TransactionRequestDto dto) {
        return ResponseEntity.status(201).body(transactionService.createTransaction(dto));
    }

    @GetMapping
    public ResponseEntity<List<TransactionResponseDto>> list(
            @RequestParam int month,
            @RequestParam int year,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) TransactionStatus status) {
        return ResponseEntity.ok(transactionService.listTransactions(month, year, categoryId, status));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TransactionResponseDto> update(@PathVariable Long id, @RequestBody @Valid TransactionRequestDto dto) {
        return ResponseEntity.ok(transactionService.updateTransaction(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        transactionService.deleteTransaction(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/confirm")
    public ResponseEntity<TransactionResponseDto> confirm(@PathVariable Long id) {
        return ResponseEntity.ok(transactionService.confirmTransaction(id));
    }
}
