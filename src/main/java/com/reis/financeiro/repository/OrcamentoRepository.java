package com.reis.financeiro.repository;

import com.reis.financeiro.entities.CategoriaRegistro;
import com.reis.financeiro.entities.Orcamento;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface OrcamentoRepository extends JpaRepository<Orcamento, Long> {
    List<Orcamento> findByUser_UserIdAndMesOrderByCategoria(Long userId, LocalDate mes);

    Optional<Orcamento> findByUser_UserIdAndMesAndCategoria(
            Long userId, LocalDate mes, CategoriaRegistro categoria);

    Optional<Orcamento> findByIdAndUser_UserId(Long id, Long userId);
}
