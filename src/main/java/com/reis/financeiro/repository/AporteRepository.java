
        package com.reis.financeiro.repository;

import com.reis.financeiro.entities.Aporte;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AporteRepository extends JpaRepository<Aporte, Long> {

    @Query("""
        SELECT a FROM Aporte a
        WHERE a.id = :id
          AND a.cofre.user.userId = :userId
        """)
    Optional<Aporte> findByIdAndCofreUserId(
            @Param("id") Long id,
            @Param("userId") Long userId
    );

    @Query("""
        SELECT a FROM Aporte a
        WHERE a.cofre.id = :cofreId
          AND a.cofre.user.userId = :userId
        """)
    List<Aporte> findByCofreIdAndCofreUserId(
            @Param("cofreId") Long cofreId,
            @Param("userId") Long userId
    );
}
