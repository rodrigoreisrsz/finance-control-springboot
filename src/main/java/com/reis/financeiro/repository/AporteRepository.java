package com.reis.financeiro.repository;

import com.reis.financeiro.entities.Aporte;
import com.reis.financeiro.entities.Registro;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AporteRepository extends JpaRepository<Aporte, Long> {

    Optional<Aporte> findByIdAndCofreUserId(Long id, Long userId);

    List<Aporte> findByCofreIdAndCofreUserId(Long cofreId, Long userId);
}
