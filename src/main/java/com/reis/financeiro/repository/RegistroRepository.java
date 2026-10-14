package com.reis.financeiro.repository;

import com.reis.financeiro.entities.Registro;

import com.reis.financeiro.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RegistroRepository extends JpaRepository<Registro, Long> {
    List<Registro> findByUserId(Long userId);
    Optional<Registro> findByIdAndUserId(
            Long id,
            Long userId
    );


}
