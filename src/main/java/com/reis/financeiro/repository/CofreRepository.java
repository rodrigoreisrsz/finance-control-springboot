package com.reis.financeiro.repository;

import com.reis.financeiro.entities.Cofre;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CofreRepository extends JpaRepository<Cofre, Long> {
    List<Cofre> findByUserId(Long userId);
    Optional<Cofre> findByIdAndUserId(
            Long id,
            Long userId
    );
}
