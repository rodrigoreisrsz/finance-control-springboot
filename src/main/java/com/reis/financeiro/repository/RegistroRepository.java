package com.reis.financeiro.repository;

import com.reis.financeiro.entities.Registro;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RegistroRepository extends JpaRepository<Registro, Long> {
    @Query("SELECT r FROM Registro r WHERE r.user.userId = :userId")
    List<Registro> findByUserId(@Param("userId") Long userId);

    @Query("""
    SELECT r FROM Registro r
    WHERE r.id = :id
      AND r.user.userId = :userId
    """)
    Optional<Registro> findByIdAndUserId(
            @Param("id") Long id,
            @Param("userId") Long userId
    );


}
