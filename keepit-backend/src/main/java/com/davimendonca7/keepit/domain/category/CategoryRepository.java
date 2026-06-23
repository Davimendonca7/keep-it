package com.davimendonca7.keepit.domain.category;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findAllByUserEmail(String username);
    List<Category> findAllByUserEmailAndType(String username, TransactionType type);
    Optional<Category> findByIdAndUserEmail(Long id, String username);
}
