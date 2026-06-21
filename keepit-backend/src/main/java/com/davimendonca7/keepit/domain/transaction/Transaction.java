package com.davimendonca7.keepit.domain.transaction;

import com.davimendonca7.keepit.domain.category.Category;
import com.davimendonca7.keepit.domain.category.TransactionType;
import com.davimendonca7.keepit.domain.transaction.recurring_transaction.RecurringTransaction;
import com.davimendonca7.keepit.domain.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "transactions")
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private TransactionType type;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    private TransactionStatus status = TransactionStatus.COMPLETED;

    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "recurring_transaction_id")
    private RecurringTransaction recurringTransaction;

    public Transaction(RecurringTransaction rt, LocalDate date) {
        this.description = rt.getDescription();
        this.amount = rt.getAmount();
        this.type = rt.getType();
        this.category = rt.getCategory();
        this.user = rt.getUser();
        this.recurringTransaction = rt;
        this.date = date;
        this.status = TransactionStatus.PENDING;
    }
}
