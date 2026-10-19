package com.reis.financeiro.repository;

import com.reis.financeiro.entities.Saldo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface SaldoRepository extends JpaRepository<Saldo, Long> {
    @Query("SELECT s FROM Saldo s WHERE s.user.userId = :userId")
    Optional<Saldo> findByUserId(@Param("userId") Long userId);
}
