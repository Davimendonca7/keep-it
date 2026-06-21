package com.davimendonca7.keepit.domain.category;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findAllByUserUsername(String username);
    List<Category> findAllByUserUsernameAndType(String username, TransactionType type);
    Optional<Category> findByIdAndUserUsername(Long id, String username);
}
