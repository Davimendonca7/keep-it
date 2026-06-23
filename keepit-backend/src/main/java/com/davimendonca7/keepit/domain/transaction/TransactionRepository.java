package com.davimendonca7.keepit.domain.transaction;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    Boolean existsByCategoryId(Long categoryId);

    Optional<Transaction> findByIdAndUserUsername(Long id, String email);

    @Query("SELECT t FROM Transaction t WHERE t.user.email = :email AND MONTH(t.date) = :month AND YEAR(t.date) = :year")
    List<Transaction> findByUserUsernameAndMonthAndYear(
            @Param("email") String email,
            @Param("month") int month,
            @Param("year") int year);

    @Query("SELECT t FROM Transaction t WHERE t.user.email = :email AND MONTH(t.date) = :month AND YEAR(t.date) = :year AND t.category.id = :categoryId")
    List<Transaction> findByUserUsernameAndMonthAndYearAndCategoryId(
            @Param("email") String email,
            @Param("month") int month,
            @Param("year") int year,
            @Param("categoryId") Long categoryId);

    @Query("SELECT t FROM Transaction t WHERE t.user.email = :email AND MONTH(t.date) = :month AND YEAR(t.date) = :year AND t.status = :status")
    List<Transaction> findByUserUsernameAndMonthAndYearAndStatus(
            @Param("email") String email,
            @Param("month") int month,
            @Param("year") int year,
            @Param("status") TransactionStatus status);

    @Query("SELECT t FROM Transaction t WHERE t.user.email = :email AND MONTH(t.date) = :month AND YEAR(t.date) = :year AND t.category.id = :categoryId AND t.status = :status")
    List<Transaction> findByUserUsernameAndMonthAndYearAndCategoryIdAndStatus(
            @Param("email") String email,
            @Param("month") int month,
            @Param("year") int year,
            @Param("categoryId") Long categoryId,
            @Param("status") TransactionStatus status);

    Boolean existsByRecurringTransactionIdAndUserUsernameAndStatusNot(
            Long recurringTransactionId, String email, TransactionStatus status);

    @Query("SELECT t FROM Transaction t WHERE t.user.email = :email AND t.status = :status ORDER BY t.date DESC")
    List<Transaction> findByUserUsernameAndStatus(
            @Param("email") String email,
            @Param("status") TransactionStatus status);

    @Query("SELECT t FROM Transaction t WHERE t.user.email = :email ORDER BY t.date DESC")
    List<Transaction> findTop10ByUserUsernameOrderByDateDesc(@Param("email") String email);

    @Query("SELECT t FROM Transaction t WHERE t.user.email = :email AND t.status = :status AND MONTH(t.date) = :month AND YEAR(t.date) = :year")
    List<Transaction> findPendingByUserUsernameAndMonthAndYear(
            @Param("email") String email,
            @Param("status") TransactionStatus status,
            @Param("month") int month,
            @Param("year") int year);
}
