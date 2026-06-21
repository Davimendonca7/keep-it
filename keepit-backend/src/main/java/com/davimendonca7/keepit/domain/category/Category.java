package com.davimendonca7.keepit.domain.category;

import com.davimendonca7.keepit.domain.user.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "category", uniqueConstraints = {
        @UniqueConstraint(name = "uk_name_type_user", columnNames = {"name", "type", "user_id"})
})
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Enumerated(EnumType.STRING)
    private TransactionType type;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}
