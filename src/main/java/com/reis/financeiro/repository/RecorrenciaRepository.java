package com.reis.financeiro.repository;

import com.reis.financeiro.entities.Recorrencia;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface RecorrenciaRepository extends JpaRepository<Recorrencia, Long> {
    List<Recorrencia> findByUser_UserIdOrderByProximaExecucaoAsc(Long userId);

    Optional<Recorrencia> findByIdAndUser_UserId(Long id, Long userId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT r FROM Recorrencia r
            WHERE r.id = :id AND r.user.userId = :userId
            """)
    Optional<Recorrencia> findByIdAndUserForUpdate(
            @Param("id") Long id, @Param("userId") Long userId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT r FROM Recorrencia r
            WHERE r.ativa = true
              AND r.confirmacaoObrigatoria = false
              AND r.proximaExecucao <= :hoje
            ORDER BY r.proximaExecucao
            """)
    List<Recorrencia> findAutomaticasVencidasForUpdate(@Param("hoje") LocalDate hoje);
}
