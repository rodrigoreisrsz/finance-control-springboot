package com.reis.financeiro.repository;

import com.reis.financeiro.entities.Aporte;
import com.reis.financeiro.entities.Registro;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AporteRepository extends JpaRepository<Aporte, Long> {
    List<Aporte> findByCofreId(Long cofreId);
    Optional<Registro> findByIdAndUserId(
            Long id,
            Long userId
    );
}
